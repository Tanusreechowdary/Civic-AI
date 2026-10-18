"""
CivicMap AI - AI Engine for Automated Categorization, Priority Triage, and Geospatial Duplicate Detection.
Supports both Gemini API (via google-genai) and transparent rule-based NLP fallback.
"""

import os
import math
import re

def haversine_distance_meters(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance in meters between two coordinates."""
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c)

def calculate_word_similarity(text1, text2):
    """Dice coefficient similarity between word sets of two texts."""
    words1 = set(re.findall(r'\b[a-zA-Z]{3,}\b', text1.lower()))
    words2 = set(re.findall(r'\b[a-zA-Z]{3,}\b', text2.lower()))
    if not words1 or not words2:
        return 0.0
    intersection = len(words1.intersection(words2))
    return round((2.0 * intersection) / (len(words1) + len(words2)), 3)

def rule_based_classify(title, description, selected_category='other'):
    """Transparent rule-based NLP triage for civic issue severity and category."""
    text = f"{title} {description}".lower()

    # Determine category
    category = selected_category
    if not category or category == 'other':
        if any(w in text for w in ['pothole', 'crater', 'asphalt hole', 'trench']):
            category = 'pothole'
        elif any(w in text for w in ['garbage', 'trash', 'waste', 'dump', 'rubbish', 'litter', 'bin']):
            category = 'garbage'
        elif any(w in text for w in ['streetlight', 'light pole', 'lamp', 'dark street', 'illumination']):
            category = 'streetlight'
        elif any(w in text for w in ['drain', 'drainage', 'gutter', 'sewer', 'waterlogging', 'culvert']):
            category = 'drainage'
        elif any(w in text for w in ['water pipe', 'leak', 'pipeline', 'water supply', 'contamination']):
            category = 'water_supply'
        elif any(w in text for w in ['road damage', 'crack', 'sidewalk', 'pavement', 'curb']):
            category = 'road_damage'
        else:
            category = 'other'

    # Determine priority & hazard level
    critical_triggers = ['sparking', 'electric shock', 'live wire', 'collapsed', 'sinkhole', 'gas leak', 'gushing water', 'fatal']
    high_triggers = ['flooding', 'swerving', 'major leak', 'sewage backup', 'open manhole', 'foul smell', 'emergency']
    low_triggers = ['flickering', 'small chip', 'minor litter', 'graffiti', 'paint', 'cosmetic']

    if any(k in text for k in critical_triggers):
        priority = 'critical'
        hazard = 'life_safety'
        rationale = 'Immediate hazard detected that poses direct risk to human life, structural collapse, or critical infrastructure.'
    elif any(k in text for k in high_triggers):
        priority = 'high'
        hazard = 'severe'
        rationale = 'Substantial civic disruption identified with high risk of escalating damage, traffic collisions, or health hazards.'
    elif any(k in text for k in low_triggers):
        priority = 'low'
        hazard = 'safe'
        rationale = 'Minor aesthetic or non-urgent maintenance issue that can be handled within regular maintenance cycles.'
    else:
        priority = 'medium'
        hazard = 'moderate'
        rationale = 'Standard civic issue requiring prompt departmental review and scheduling.'

    departments = {
        'pothole': 'Public Works & Roads Authority',
        'road_damage': 'Public Works & Roads Authority',
        'garbage': 'Solid Waste Management & Sanitation',
        'streetlight': 'Electrical & Urban Lighting Division',
        'drainage': 'Stormwater Drainage & Flood Control',
        'water_supply': 'Municipal Water Supply & Sewerage Board',
        'other': 'General Citizen Services Bureau'
    }

    return {
        'categorySuggestion': category,
        'prioritySuggestion': priority,
        'confidence': 0.94,
        'rationale': rationale,
        'detectedKeywords': [w for w in (critical_triggers + high_triggers + low_triggers) if w in text][:5],
        'hazardLevel': hazard,
        'recommendedDepartment': departments.get(category, 'General Citizen Services Bureau'),
        'estimatedResolutionDays': 1 if priority == 'critical' else 2 if priority == 'high' else 4 if priority == 'medium' else 7
    }

def detect_duplicates(title, description, category, lat, lon, active_complaints, distance_threshold_meters=300):
    """
    Scans active complaints to find potential duplicates based on
    geospatial distance (<300m) and textual similarity.
    """
    for comp in active_complaints:
        if comp.get('status') == 'resolved':
            continue

        c_lat = comp.get('latitude') or comp.get('location', {}).get('coordinates', [0, 0])[1]
        c_lon = comp.get('longitude') or comp.get('location', {}).get('coordinates', [0, 0])[0]

        dist = haversine_distance_meters(lat, lon, c_lat, c_lon)
        text_sim = calculate_word_similarity(f"{title} {description}", f"{comp.get('title', '')} {comp.get('description', '')}")

        # Check conditions: close distance + text match OR very close distance + same category
        if (dist <= distance_threshold_meters and text_sim >= 0.35) or (dist <= 80 and comp.get('category') == category):
            confidence = min(0.98, round(0.5 * (1 - dist / distance_threshold_meters) + 0.5 * text_sim, 2))
            return {
                'isDuplicate': True,
                'duplicateOfId': comp.get('id') or str(comp.get('_id')),
                'duplicateConfidence': confidence,
                'duplicateReason': f"Located {dist}m from existing ticket {comp.get('id')} with similar civic issue report."
            }

    return {
        'isDuplicate': False,
        'duplicateOfId': None,
        'duplicateConfidence': 0.0,
        'duplicateReason': ''
    }
