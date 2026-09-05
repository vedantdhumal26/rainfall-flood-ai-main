import sqlite3
import json
import os
import datetime
from typing import Dict, List, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rainshield.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'officer',
        created_at TEXT NOT NULL
    )
    """)

    # Weather observations table (Station data)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weather_observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        station_name TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        rainfall_mm REAL NOT NULL,
        temperature_c REAL NOT NULL,
        humidity_percent REAL NOT NULL,
        quality_score REAL NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # Gridded rainfall table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rainfall_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        rainfall_mm REAL NOT NULL,
        intensity_category TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # Predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        scenario TEXT NOT NULL,
        location TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        flood_probability REAL NOT NULL,
        water_depth_m REAL NOT NULL,
        inundation_area_sqkm REAL NOT NULL,
        arrival_time_mins INTEGER NOT NULL,
        population_at_risk INTEGER NOT NULL,
        infrastructure_at_risk INTEGER NOT NULL,
        confidence_score REAL NOT NULL,
        forecast_horizon TEXT NOT NULL,
        model_version TEXT NOT NULL,
        prediction_time TEXT NOT NULL
    )
    """)

    # Risk zones (GeoJSON FeatureCollection storage)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        flood_probability REAL NOT NULL,
        water_depth_m REAL NOT NULL,
        geometry_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        level TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        region TEXT NOT NULL,
        eta TEXT NOT NULL,
        status TEXT NOT NULL,
        approved_by TEXT,
        approved_at TEXT,
        broadcasted_at TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        reported_at TEXT NOT NULL
    )
    """)

    # Infrastructure table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS infrastructure (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        count INTEGER NOT NULL,
        at_risk INTEGER NOT NULL,
        status TEXT NOT NULL
    )
    """)

    # Response teams table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS response_teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        members_count INTEGER NOT NULL,
        status TEXT NOT NULL,
        assigned_zone TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        contact TEXT NOT NULL
    )
    """)

    # Shelters table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shelters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        capacity INTEGER NOT NULL,
        occupancy INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        distance_km REAL NOT NULL,
        travel_time_mins INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'open'
    )
    """)

    # Data sources table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS data_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        last_sync TEXT NOT NULL,
        coverage_pct REAL NOT NULL
    )
    """)

    # AI insights table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        summary TEXT NOT NULL,
        risk_factors_json TEXT NOT NULL,
        recommendations_json TEXT NOT NULL,
        model_version TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        size TEXT NOT NULL
    )
    """)

    # Simulation state tracker table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS simulation_state (
        id INTEGER PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        phase_index INTEGER NOT NULL,
        is_running INTEGER NOT NULL,
        progress REAL NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    conn.commit()
    seed_db(cursor, conn)
    conn.close()

def seed_db(cursor, conn):
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] > 0:
        return

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Seed users
    cursor.execute("""
    INSERT INTO users (id, username, password_hash, name, role, created_at) VALUES
    ('u1', 'officer', 'officer123', 'Disaster Management Officer', 'officer', ?),
    ('u2', 'admin', 'admin123', 'System Administrator', 'admin', ?)
    """, (now, now))

    # Seed initial prediction
    cursor.execute("""
    INSERT INTO predictions (
        id, scenario, location, risk_level, flood_probability, water_depth_m,
        inundation_area_sqkm, arrival_time_mins, population_at_risk,
        infrastructure_at_risk, confidence_score, forecast_horizon, model_version, prediction_time
    ) VALUES (
        'pred-init', 'normal', 'Pune Metropolitan Region', 'low', 8.0, 0.12,
        0.5, 0, 0, 0, 0.91, '0-6 hours', 'RainShield-v1.0', ?
    )
    """, (now,))

    # Seed initial alerts
    alerts_data = [
        ('a1', 'red', 'RED ALERT — SEVERE FLOOD RISK', 'Extreme rainfall (92mm) and rapid inundation predicted. Flood arrival expected within 42 minutes.', 'Pune Region', '42 minutes', 'approved', 'Disaster Control Officer', now, now, now),
        ('a2', 'orange', 'ORANGE ALERT — HIGH FLOOD RISK', 'Heavy rainfall detected, flood risk rising in low-lying riverbank catchments.', 'Pune Region', '65 minutes', 'broadcasted', 'Disaster Control Officer', now, now, now),
        ('a3', 'yellow', 'YELLOW ALERT — WEATHER WATCH', 'Rainfall increasing over Mula-Mutha river basin, monitoring stations active.', 'Pune Region', '90 minutes', 'broadcasted', 'IMD Officer', now, now, now),
        ('a4', 'green', 'GREEN ALERT — ALL CLEAR', 'Baseline conditions nominal across all sub-districts.', 'Pune Region', '—', 'archived', 'System Automator', now, now, now)
    ]
    cursor.executemany("""
    INSERT INTO alerts (id, level, title, description, region, eta, status, approved_by, approved_at, broadcasted_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, alerts_data)

    # Seed shelters
    shelters_data = [
        ('s1', 'Emergency Shelter A — Shivaji Nagar', 'Shivaji Nagar Community Hall, Pune', 18.5320, 73.8440, 500, 120, 'low', 2.4, 8, 'open'),
        ('s2', 'Shelter B — Kothrud', 'Kothrud Sports Complex, Pune', 18.5070, 73.8080, 800, 200, 'low', 3.1, 11, 'open'),
        ('s3', 'Shelter C — Baner', 'Baner IT Park Community Hall, Pune', 18.5590, 73.7760, 1200, 350, 'low', 4.8, 16, 'open'),
        ('s4', 'Shelter D — Hadapsar', 'Hadapsar Relief Center, Pune', 18.5080, 73.9290, 600, 80, 'moderate', 5.6, 19, 'open')
    ]
    cursor.executemany("""
    INSERT INTO shelters (id, name, address, lat, lon, capacity, occupancy, risk_level, distance_km, travel_time_mins, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, shelters_data)

    # Seed infrastructure
    infra_data = [
        ('h1', 'Sassoon General Hospital', 'hospital', 18.5308, 73.8758, 3, 1, 'operational'),
        ('h2', 'Deenanath Mangeshkar Hospital', 'hospital', 18.5000, 73.8230, 2, 0, 'operational'),
        ('h3', 'Ruby Hall Clinic', 'hospital', 18.5350, 73.8820, 1, 0, 'operational'),
        ('s_school1', 'Delhi Public School', 'school', 18.5150, 73.8400, 12, 4, 'shelter_ready'),
        ('b1', 'Mula River Bridge', 'bridge', 18.5250, 73.8500, 7, 3, 'monitored'),
        ('r1', 'Aundh Road Low Corridor', 'road', 18.5400, 73.8700, 21, 8, 'risk_of_waterlogging')
    ]
    cursor.executemany("""
    INSERT INTO infrastructure (id, name, type, lat, lon, count, at_risk, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, infra_data)

    # Seed response teams
    teams_data = [
        ('t1', 'NDRF Unit 5 - Rapid Rescue', 'NDRF', 35, 'deployed', 'Zone 1 - Riverbank', 18.5300, 73.8500, '+91-20-26123456'),
        ('t2', 'SDRF Quick Response Alpha', 'SDRF', 24, 'active', 'Zone 2 - Lowlands', 18.5150, 73.8400, '+91-20-26123457'),
        ('t3', 'Pune Fire Brigade Rescue Wing', 'Fire', 40, 'standby', 'Zone 3 - Urban Core', 18.5204, 73.8567, '101 / 112'),
        ('t4', 'Emergency Medical Corps', 'Medical', 18, 'active', 'Central Hospitals', 18.5280, 73.8740, '108')
    ]
    cursor.executemany("""
    INSERT INTO response_teams (id, name, type, members_count, status, assigned_zone, lat, lon, contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, teams_data)

    # Seed data sources
    sources_data = [
        ('insat', 'INSAT-3DR Satellite', 'Satellite', 'online', '1 min ago', 98.4),
        ('imdradar', 'IMD Doppler Radar (Pune)', 'Radar', 'online', '2 min ago', 95.0),
        ('aws', 'Automatic Weather Stations Network', 'Observation', 'online', '1 min ago', 92.8),
        ('wrf', 'WRF NWP Model (IMD-NCMRWF)', 'NWP', 'online', '12 min ago', 88.0),
        ('gpm', 'GPM Core Observatory', 'Satellite', 'degraded', '18 min ago', 71.5),
        ('river', 'CWC River Gauge Network', 'Observation', 'online', '3 min ago', 84.2)
    ]
    cursor.executemany("""
    INSERT INTO data_sources (id, name, type, status, last_sync, coverage_pct)
    VALUES (?, ?, ?, ?, ?, ?)
    """, sources_data)

    # Seed risk zones (GeoJSON Polygons)
    z1_coords = [
        [73.845, 18.515], [73.855, 18.518], [73.862, 18.522], [73.868, 18.528],
        [73.865, 18.535], [73.858, 18.538], [73.850, 18.536], [73.842, 18.530],
        [73.840, 18.522], [73.845, 18.515]
    ]
    z2_coords = [
        [73.835, 18.510], [73.845, 18.513], [73.852, 18.516], [73.848, 18.525],
        [73.838, 18.528], [73.830, 18.522], [73.828, 18.515], [73.835, 18.510]
    ]
    z3_coords = [
        [73.870, 18.540], [73.880, 18.543], [73.885, 18.548], [73.882, 18.555],
        [73.875, 18.558], [73.868, 18.553], [73.865, 18.545], [73.870, 18.540]
    ]
    zones_data = [
        ('z1', 'Mula River Inundation Plain', 'severe', 89.0, 1.42, json.dumps({"type": "Polygon", "coordinates": [z1_coords]}), now),
        ('z2', 'Pawana-Mula Confluence Lowland', 'high', 67.0, 0.85, json.dumps({"type": "Polygon", "coordinates": [z2_coords]}), now),
        ('z3', 'Sinhagad Road Riverbank Fringe', 'moderate', 31.0, 0.45, json.dumps({"type": "Polygon", "coordinates": [z3_coords]}), now)
    ]
    cursor.executemany("""
    INSERT INTO risk_zones (id, name, risk_level, flood_probability, water_depth_m, geometry_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, zones_data)

    # Seed AI Insights
    insights_factors = json.dumps([
        {"factor": "Rainfall Intensity (>50mm/hr)", "contribution": 38},
        {"factor": "Soil Saturation & Runoff Index", "contribution": 26},
        {"factor": "River Level Elevation Proximity", "contribution": 21},
        {"factor": "Urban Drainage Capacity Limit", "contribution": 15}
    ])
    insights_recs = json.dumps([
        "Activate NDRF teams along Mula River basin corridors immediately.",
        "Issue citizen alerts to Patil Estate Slums and low-lying riverbank settlements.",
        "Divert traffic from inundated arterial roadways (Sinhagad Road, Aundh low bridge).",
        "Pre-position mobile pumps at Sassoon Hospital and Deenanath Mangeshkar substations."
    ])
    cursor.execute("""
    INSERT INTO ai_insights (id, summary, risk_factors_json, recommendations_json, model_version, created_at)
    VALUES ('ins-1', 'Heavy convective storm cell centered over Pune Metropolitan Region. Flood probability peaked at 89% in central riverbank sectors with expected water depth reaching 1.42m.', ?, ?, 'RainShield-AI-v1.0', ?)
    """, (insights_factors, insights_recs, now))

    # Seed Reports
    reports_data = [
        ('r1', 'Heavy Rainfall & Flood Assessment Report', 'Weather', '2026-09-05', 'ready', '2.8 MB'),
        ('r2', 'Critical Inundation Risk Map & Population Impact', 'Prediction', '2026-09-05', 'ready', '4.3 MB'),
        ('r3', 'Emergency Response Activation & Deployment Log', 'Response', '2026-09-05', 'generating', '—'),
        ('r4', 'Evacuation Shelter Capacity & Routing Status', 'Response', '2026-09-04', 'ready', '1.9 MB'),
        ('r5', 'AI Nowcasting & Inundation Model Metrics', 'AI', '2026-09-03', 'ready', '3.5 MB')
    ]
    cursor.executemany("""
    INSERT INTO reports (id, title, type, date, status, size)
    VALUES (?, ?, ?, ?, ?, ?)
    """, reports_data)

    # Seed simulation state
    cursor.execute("""
    INSERT INTO simulation_state (id, scenario_id, phase_index, is_running, progress, updated_at)
    VALUES (1, 'extreme', 3, 0, 100.0, ?)
    """, (now,))

    conn.commit()

# Run init on module load
init_db()
