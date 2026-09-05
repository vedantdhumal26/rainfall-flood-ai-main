import pandas as pd
import numpy as np

class FloodPredictor:
    def __init__(self):
        """
        Initializes the Inundation model.
        In a real scenario, this uses high-res DEM (Digital Elevation Models), soil type,
        and drainage network data to calculate hydrodynamic routing.
        For the prototype, it uses a simplified vulnerability score based on coordinates
        (mocking low-elevation areas) and predicted rainfall accumulation.
        """
        self.model_loaded = True
        self.version = "v1.0-prototype"

    def predict(self, predictions_df: pd.DataFrame) -> pd.DataFrame:
        """
        Predicts flood risk, water depth, and arrival time.
        """
        if predictions_df.empty:
            return pd.DataFrame()
            
        flood_df = predictions_df.copy()
        
        # Mocking an Elevation/Vulnerability proxy based on Latitude/Longitude.
        # Let's assume the river passes through the center of our bounding box (lat 18.55).
        # Cells closer to 18.55 have a higher vulnerability score (lower elevation).
        
        distance_to_river = np.abs(flood_df['lat'] - 18.55)
        vulnerability = np.clip(1.0 - (distance_to_river * 10), 0.1, 1.0)
        
        # Calculate Flood Probability based on 3h predicted accumulation and vulnerability
        # E.g., > 40mm in 3h in a vulnerable area -> High Probability
        base_prob = (flood_df['pred_3h_mm'] / 100.0) * vulnerability
        flood_df['flood_probability'] = np.clip(base_prob, 0.0, 1.0)
        
        # Calculate estimated water depth (meters)
        # Only meaningful if probability > 0.4
        flood_df['water_depth_m'] = np.where(
            flood_df['flood_probability'] > 0.4,
            (flood_df['pred_3h_mm'] / 50.0) * vulnerability * np.random.uniform(0.8, 1.5, size=len(flood_df)),
            0.0
        )
        
        # Calculate Risk Level Categorization
        conditions = [
            (flood_df['flood_probability'] < 0.3),
            (flood_df['flood_probability'] >= 0.3) & (flood_df['flood_probability'] < 0.6),
            (flood_df['flood_probability'] >= 0.6) & (flood_df['flood_probability'] < 0.8),
            (flood_df['flood_probability'] >= 0.8)
        ]
        choices = ['Low', 'Moderate', 'High', 'Severe']
        flood_df['risk_level'] = np.select(conditions, choices, default='Low')
        
        # Cleanup rounding
        flood_df['flood_probability'] = flood_df['flood_probability'].round(2)
        flood_df['water_depth_m'] = flood_df['water_depth_m'].round(2)
        
        return flood_df

flood_model = FloodPredictor()
