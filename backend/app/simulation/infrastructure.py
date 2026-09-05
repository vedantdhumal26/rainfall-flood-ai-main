import random

def get_demo_infrastructure():
    """
    Returns simulated GeoJSON-like infrastructure data for Pune.
    """
    return {
        "hospitals": [
            {"id": "H1", "name": "Sassoon Hospital", "lat": 18.528, "lon": 73.874},
            {"id": "H2", "name": "Deenanath Mangeshkar Hospital", "lat": 18.500, "lon": 73.823},
            {"id": "H3", "name": "Ruby Hall Clinic", "lat": 18.535, "lon": 73.882},
        ],
        "safe_locations": [
            {"id": "S1", "name": "Pune Municipal School 1", "lat": 18.515, "lon": 73.860, "capacity": 500},
            {"id": "S2", "name": "Community Center Kothrud", "lat": 18.508, "lon": 73.805, "capacity": 300},
            {"id": "S3", "name": "Government Polytechnic Pune", "lat": 18.541, "lon": 73.829, "capacity": 1000},
        ],
        "vulnerable_zones": [
            {"id": "V1", "name": "Sinhagad Road Low Lying Area", "lat": 18.485, "lon": 73.825, "risk": "High"},
            {"id": "V2", "name": "Mula-Mutha River Bank", "lat": 18.538, "lon": 73.885, "risk": "High"},
            {"id": "V3", "name": "Patil Estate Slums", "lat": 18.532, "lon": 73.850, "risk": "Severe"},
        ]
    }
