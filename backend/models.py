"""
CivicMap AI - Database Schemas and Validation for MongoDB (PyMongo)
"""

from datetime import datetime

def format_complaint_doc(data, user):
    """Formats and validates a complaint document for MongoDB insertion."""
    now = datetime.utcnow().isoformat()
    lat = float(data.get('latitude', 12.9716))
    lon = float(data.get('longitude', 77.5946))

    return {
        'id': data.get('id'),
        'title': data.get('title', '').strip(),
        'description': data.get('description', '').strip(),
        'category': data.get('category', 'other'),
        'priority': data.get('priority', 'medium'),
        'status': data.get('status', 'submitted'),
        'latitude': lat,
        'longitude': lon,
        'location': {
            'type': 'Point',
            'coordinates': [lon, lat]  # GeoJSON format: [longitude, latitude]
        },
        'address': data.get('address', '').strip(),
        'landmark': data.get('landmark', '').strip(),
        'imageUrl': data.get('imageUrl', ''),
        'resolvedImageUrl': data.get('resolvedImageUrl', ''),
        'department': data.get('department', 'General Citizen Services Bureau'),
        'assignedOfficer': data.get('assignedOfficer', ''),
        'userId': user.get('id', 'anonymous'),
        'userName': user.get('name', 'Anonymous Citizen'),
        'userEmail': user.get('email', ''),
        'createdAt': data.get('createdAt', now),
        'updatedAt': now,
        'resolvedAt': data.get('resolvedAt', None),
        'resolutionNotes': data.get('resolutionNotes', ''),
        'aiAnalysis': data.get('aiAnalysis', {}),
        'timeline': data.get('timeline', []),
        'upvotes': data.get('upvotes', 1),
        'isDuplicate': data.get('isDuplicate', False),
        'duplicateOfId': data.get('duplicateOfId', None)
    }

def format_user_doc(name, email, password_hash, role='citizen', ward='Ward 1'):
    """Formats a user document for MongoDB storage."""
    return {
        'name': name.strip(),
        'email': email.strip().lower(),
        'password': password_hash,
        'role': role,
        'ward': ward,
        'createdAt': datetime.utcnow().isoformat()
    }

def format_update_log(complaint_id, actor_name, action, details):
    """Formats an audit update record."""
    return {
        'complaintId': complaint_id,
        'actorName': actor_name,
        'action': action,
        'details': details,
        'timestamp': datetime.utcnow().isoformat()
    }
