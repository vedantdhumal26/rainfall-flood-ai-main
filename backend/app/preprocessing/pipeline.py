import pandas as pd
import numpy as np
import random
from typing import List, Dict

def clean_station_data(observations: List[Dict]) -> pd.DataFrame:
    """
    Cleans raw weather station observations.
    - Handles missing values.
    - Removes outliers.
    """
    if not observations:
        return pd.DataFrame()
        
    df = pd.DataFrame(observations)
    
    # 1. Fill missing values (Simulated imputation)
    if 'rainfall_mm' in df.columns:
        df['rainfall_mm'] = df['rainfall_mm'].fillna(0.0)
    
    if 'temperature_c' in df.columns:
        df['temperature_c'] = df['temperature_c'].fillna(df['temperature_c'].mean())
        
    # 2. Outlier detection (Cap extremely impossible values)
    # Rainfall caps (e.g., > 200mm/hr is highly unlikely, cap it)
    df.loc[df['rainfall_mm'] > 200, 'rainfall_mm'] = 200.0
    df.loc[df['rainfall_mm'] < 0, 'rainfall_mm'] = 0.0
    
    # Temp caps
    df.loc[df['temperature_c'] > 55, 'temperature_c'] = 55.0
    df.loc[df['temperature_c'] < -10, 'temperature_c'] = -10.0
    
    # Flag data with low quality scores (QC Flagging)
    df['qc_flag'] = np.where(df['quality_score'] < 0.7, 'POOR', 'GOOD')
    
    return df

def clean_gridded_data(gridded_data: List[Dict]) -> pd.DataFrame:
    """
    Cleans spatial grid data (radar/satellite).
    """
    if not gridded_data:
        return pd.DataFrame()
        
    df = pd.DataFrame(gridded_data)
    
    # Remove negative rainfall
    df.loc[df['rainfall_mm'] < 0, 'rainfall_mm'] = 0.0
    
    return df

def fuse_data(stations_df: pd.DataFrame, grid_df: pd.DataFrame) -> pd.DataFrame:
    """
    Fuses station data and gridded data onto the uniform grid.
    For this prototype, we'll assign the nearest station's temperature and humidity
    to each grid cell, and use a weighted average of station rainfall and grid rainfall.
    """
    if grid_df.empty:
        return pd.DataFrame()
        
    if stations_df.empty:
        # If no stations, just return the grid with empty weather features
        grid_df['temperature_c'] = 25.0
        grid_df['humidity_percent'] = 70.0
        grid_df['fused_rainfall'] = grid_df['rainfall_mm']
        return grid_df
        
    fused_rows = []
    
    # Simplified spatial fusion (Nearest Neighbor approach for prototype)
    for _, grid_cell in grid_df.iterrows():
        g_lat, g_lon = grid_cell['lat'], grid_cell['lon']
        
        # Calculate distances to all stations
        distances = np.sqrt((stations_df['lat'] - g_lat)**2 + (stations_df['lon'] - g_lon)**2)
        nearest_idx = distances.idxmin()
        nearest_station = stations_df.loc[nearest_idx]
        
        # Weighted rainfall (e.g. 60% radar/grid, 40% ground station)
        fused_rain = (grid_cell['rainfall_mm'] * 0.6) + (nearest_station['rainfall_mm'] * 0.4)
        
        fused_rows.append({
            "lat": g_lat,
            "lon": g_lon,
            "fused_rainfall": round(fused_rain, 2),
            "temperature_c": nearest_station['temperature_c'],
            "humidity_percent": nearest_station['humidity_percent'],
            "nearest_station": nearest_station['station_id']
        })
        
    return pd.DataFrame(fused_rows)

def extract_features(fused_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates ML features from the fused grid.
    """
    if fused_df.empty:
        return fused_df
        
    # Feature 1: Categorize intensity
    conditions = [
        (fused_df['fused_rainfall'] == 0),
        (fused_df['fused_rainfall'] > 0) & (fused_df['fused_rainfall'] <= 2.5),
        (fused_df['fused_rainfall'] > 2.5) & (fused_df['fused_rainfall'] <= 15.5),
        (fused_df['fused_rainfall'] > 15.5) & (fused_df['fused_rainfall'] <= 64.5),
        (fused_df['fused_rainfall'] > 64.5)
    ]
    choices = ['None', 'Light', 'Moderate', 'Heavy', 'Extreme']
    fused_df['intensity_category'] = np.select(conditions, choices, default='None')
    
    # In a real scenario, we'd calculate rolling 6h/24h sums here using historical DB data.
    # For the prototype pipeline, we'll mock a 'rolling_24h_accumulation' feature based on current intensity
    fused_df['mock_24h_accumulation'] = fused_df['fused_rainfall'] * random.uniform(5.0, 15.0)
    
    return fused_df

def run_pipeline(observations: List[Dict], gridded_data: List[Dict]) -> List[Dict]:
    """
    Executes the full preprocessing pipeline.
    """
    clean_stations = clean_station_data(observations)
    clean_grid = clean_gridded_data(gridded_data)
    
    fused = fuse_data(clean_stations, clean_grid)
    features = extract_features(fused)
    
    # Convert NaNs to None for JSON serialization
    features = features.replace({np.nan: None})
    return features.to_dict(orient="records")
