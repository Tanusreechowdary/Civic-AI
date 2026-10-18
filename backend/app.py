"""
CivicMap AI - Flask REST API Backend with PyMongo & AI Engine
"""

import os
import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from ai_engine import rule_based_classify, detect_duplicates
from models import format_complaint_doc, format_user_doc, format_update_log

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/civicmap_db')
DB_NAME = os.getenv('DB_NAME', 'civicmap_db')

try:
    from pymongo import MongoClient, GEOSPHERE
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = client[DB_NAME]
    # Ensure geospatial index for high-speed location queries
    db.complaints.create_index([("location", GEOSPHERE)])
    db.complaints.create_index("id", unique=True)
    mongo_available = True
    print("[CivicMap AI] MongoDB connection established.")
except Exception as e:
    print(f"[CivicMap AI] Warning: MongoDB not reachable ({e}). Falling back to memory store.")
    mongo_available = False
    # In-memory store fallback for standalone testing
    db_memory = {
        'complaints': [],
        'users': [],
        'updates': []
    }

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'mongo_connected': mongo_available,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    category = request.args.get('category')
    status = request.args.get('status')
    priority = request.args.get('priority')
    search = request.args.get('search')
    user_id = request.args.get('userId')

    query = {}
    if category and category != 'all':
        query['category'] = category
    if status and status != 'all':
        query['status'] = status
    if priority and priority != 'all':
        query['priority'] = priority
    if user_id:
        query['userId'] = user_id
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'address': {'$regex': search, '$options': 'i'}},
            {'id': {'$regex': search, '$options': 'i'}}
        ]

    if mongo_available:
        cursor = db.complaints.find(query, {'_id': 0}).sort('createdAt', -1)
        results = list(cursor)
    else:
        results = db_memory['complaints']

    return jsonify({'complaints': results, 'total': len(results)})

@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    data = request.json or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    category = data.get('category', 'other')
    lat = float(data.get('latitude', 12.9716))
    lon = float(data.get('longitude', 77.5946))

    if not title or not description:
        return jsonify({'error': 'Title and description are required.'}), 400

    # Retrieve existing active complaints for duplicate detection
    if mongo_available:
        existing = list(db.complaints.find({'status': {'$ne': 'resolved'}}, {'_id': 0}))
    else:
        existing = db_memory['complaints']

    # AI Classification and Duplicate Checking
    ai_classification = rule_based_classify(title, description, category)
    dup_check = detect_duplicates(title, description, ai_classification['categorySuggestion'], lat, lon, existing)

    ai_analysis = {**ai_classification, **dup_check}

    # Generate Unique ID: CIV-2026-XXXX
    count = db.complaints.count_documents({}) if mongo_available else len(db_memory['complaints'])
    new_id = f"CIV-2026-{1050 + count + random.randint(1, 9)}"

    user = {
        'id': data.get('userId', 'cit-001'),
        'name': data.get('userName', 'Priya Sharma'),
        'email': data.get('userEmail', 'priya.sharma@gmail.com')
    }

    doc = format_complaint_doc({
        'id': new_id,
        'title': title,
        'description': description,
        'category': ai_analysis['categorySuggestion'],
        'priority': ai_analysis['prioritySuggestion'],
        'status': 'submitted',
        'latitude': lat,
        'longitude': lon,
        'address': data.get('address', 'Metro City'),
        'landmark': data.get('landmark', ''),
        'imageUrl': data.get('imageUrl', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'),
        'department': ai_analysis['recommendedDepartment'],
        'aiAnalysis': ai_analysis,
        'isDuplicate': dup_check['isDuplicate'],
        'duplicateOfId': dup_check['duplicateOfId'],
        'timeline': [
            {
                'id': f"t-{int(datetime.utcnow().timestamp())}",
                'status': 'submitted',
                'timestamp': datetime.utcnow().isoformat(),
                'message': f"Complaint reported by citizen at ({lat:.4f}, {lon:.4f}).",
                'actorName': user['name'],
                'actorRole': 'citizen'
            }
        ]
    }, user)

    if mongo_available:
        db.complaints.insert_one(doc)
        doc.pop('_id', None)
    else:
        db_memory['complaints'].insert(0, doc)

    return jsonify({'complaint': doc, 'message': 'Complaint registered successfully!'}), 201

@app.route('/api/complaints/<complaint_id>/status', methods=['PATCH'])
def update_complaint_status(complaint_id):
    data = request.json or {}
    new_status = data.get('status')
    priority = data.get('priority')
    department = data.get('department')
    officer = data.get('assignedOfficer')
    notes = data.get('resolutionNotes')
    actor_name = data.get('actorName', 'Administrator')

    now = datetime.utcnow().isoformat()
    update_fields = {'updatedAt': now}

    if new_status:
        update_fields['status'] = new_status
    if priority:
        update_fields['priority'] = priority
    if department:
        update_fields['department'] = department
    if officer:
        update_fields['assignedOfficer'] = officer
    if notes:
        update_fields['resolutionNotes'] = notes
    if new_status == 'resolved':
        update_fields['resolvedAt'] = now

    timeline_entry = {
        'id': f"t-{int(datetime.utcnow().timestamp())}",
        'status': new_status or 'updated',
        'timestamp': now,
        'message': f"Updated by {actor_name}. Notes: {notes or 'Status progression recorded.'}",
        'actorName': actor_name,
        'actorRole': 'admin'
    }

    if mongo_available:
        res = db.complaints.update_one(
            {'id': complaint_id},
            {
                '$set': update_fields,
                '$push': {'timeline': timeline_entry}
            }
        )
        if res.matched_count == 0:
            return jsonify({'error': 'Complaint not found'}), 404
        updated_doc = db.complaints.find_one({'id': complaint_id}, {'_id': 0})
    else:
        updated_doc = None
        for c in db_memory['complaints']:
            if c['id'] == complaint_id:
                c.update(update_fields)
                c['timeline'].append(timeline_entry)
                updated_doc = c
                break
        if not updated_doc:
            return jsonify({'error': 'Complaint not found'}), 404

    return jsonify({'complaint': updated_doc, 'message': 'Status updated successfully'})

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
