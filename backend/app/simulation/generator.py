import random
import datetime
from typing import List, Dict

# Pune Bounding Box
PUNE_BBOX = {
    "min_lat": 18.40,
    "max_lat": 18.70,
    "min_lon": 73.70,
    "max_lon": 74.00
}

# Fixed weather stations
WEATHER_STATIONS = [
    {"id": "WS001", "name": "Shivajinagar Station", "lat": 18.53, "lon": 73.85},
    {"id": "WS002", "name": "Pashan Station", "lat": 18.54, "lon": 73.80},
    {"id": "WS003", "name": "Lohegaon Airport", "lat": 18.58, "lon": 73.91},
    {"id": "WS004", "name": "Hadapsar", "lat": 18.50, "lon": 73.93},
    {"id": "WS005", "name": "Katraj", "lat": 18.45, "lon": 73.85}
]

def generate_station_readings(scenario: str, current_time: datetime.datetime) -> List[Dict]:
    """Generates synthetic weather observations based on the scenario."""
    observations = []
    
    for station in WEATHER_STATIONS:
        if scenario == "extreme_rainfall":
            # High rainfall, high humidity, lower temp
            rainfall = round(random.uniform(20.0, 50.0), 2) # mm/hr
            temp = round(random.uniform(22.0, 25.0), 1)
            humidity = round(random.uniform(85.0, 98.0), 1)
        elif scenario == "normal":
            # Little to no rainfall
            rainfall = round(random.uniform(0.0, 2.0), 2)
            temp = round(random.uniform(27.0, 32.0), 1)
            humidity = round(random.uniform(50.0, 70.0), 1)
        else:
            # Default mild
            rainfall = round(random.uniform(2.0, 10.0), 2)
            temp = round(random.uniform(25.0, 28.0), 1)
            humidity = round(random.uniform(70.0, 85.0), 1)
            
        observations.append({
            "station_id": station["id"],
            "station_name": station["name"],
            "lat": station["lat"],
            "lon": station["lon"],
            "timestamp": current_time.isoformat(),
            "rainfall_mm": rainfall,
            "temperature_c": temp,
            "humidity_percent": humidity,
            "quality_score": round(random.uniform(0.9, 1.0), 2) # Adding a QC feature
        })
        
    return observations

def generate_gridded_rainfall(scenario: str) -> List[Dict]:
    """
    Simulates gridded satellite/radar data over the bounding box.
    Returns a list of grid cells with rainfall values.
    """
    grid = []
    lat_step = 0.05
    lon_step = 0.05
    
    lat = PUNE_BBOX["min_lat"]
    while lat <= PUNE_BBOX["max_lat"]:
        lon = PUNE_BBOX["min_lon"]
        while lon <= PUNE_BBOX["max_lon"]:
            
            # Base rainfall logic depending on scenario
            if scenario == "extreme_rainfall":
                # Create a spatial pattern (heavier rain in the center)
                center_lat, center_lon = 18.55, 73.85
                dist = ((lat - center_lat)**2 + (lon - center_lon)**2)**0.5
                intensity = max(0, 60 - (dist * 300)) + random.uniform(0, 15)
            else:
                intensity = random.uniform(0, 5)
                
            grid.append({
                "lat": round(lat, 3),
                "lon": round(lon, 3),
                "rainfall_mm": round(max(0, intensity), 2)
            })
            lon += lon_step
        lat += lat_step
        
    return grid
