import math
from typing import Dict, List, Tuple
from app.simulation.infrastructure import get_demo_infrastructure

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km using Haversine formula."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def find_nearest_safe_location(lat: float, lon: float) -> Dict:
    """Finds the nearest safe shelter for evacuation."""
    infra = get_demo_infrastructure()
    safe_locations = infra["safe_locations"]
    
    nearest = None
    min_dist = float('inf')
    
    for safe in safe_locations:
        dist = calculate_distance(lat, lon, safe["lat"], safe["lon"])
        if dist < min_dist:
            min_dist = dist
            nearest = safe
            
    # Include distance in result
    if nearest:
        nearest = nearest.copy()
        nearest["distance_km"] = round(min_dist, 2)
        
    return nearest

def generate_evacuation_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float) -> List[Tuple[float, float]]:
    """
    Generates a simulated evacuation route.
    Instead of a straight line, it creates a 3-point polyline to simulate road traversal
    and avoiding the central flood zones.
    """
    # Midpoint with an offset to simulate avoiding a flooded main road
    mid_lat = (start_lat + end_lat) / 2
    mid_lon = ((start_lon + end_lon) / 2) + 0.015 # offset east
    
    return [
        [start_lat, start_lon],
        [mid_lat, mid_lon],
        [end_lat, end_lon]
    ]

def get_evacuation_plan(lat: float, lon: float) -> Dict:
    """Orchestrates finding a safe place and routing to it."""
    nearest = find_nearest_safe_location(lat, lon)
    if not nearest:
        return {"status": "error", "message": "No safe locations found."}
        
    route = generate_evacuation_route(lat, lon, nearest["lat"], nearest["lon"])
    
    return {
        "status": "success",
        "origin": {"lat": lat, "lon": lon},
        "destination": nearest,
        "route_coordinates": route,
        "estimated_travel_time_mins": int(nearest["distance_km"] * 15) # Assume 15 mins per km in evacuation traffic
    }
