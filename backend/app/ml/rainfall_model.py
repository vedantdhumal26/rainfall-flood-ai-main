import pandas as pd
import numpy as np

class RainfallPredictor:
    def __init__(self):
        """
        Initializes the ML model.
        In a real scenario, this would load a serialized .pkl file (e.g., Random Forest or XGBoost).
        For the prototype, we implement heuristic logic that mimics a trained model's output
        based on current intensity and atmospheric conditions.
        """
        self.model_loaded = True
        self.version = "v1.0-prototype"

    def predict(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Predicts future rainfall (Nowcasting 1h, 3h, 6h).
        """
        if features_df.empty:
            return pd.DataFrame()
            
        predictions = features_df.copy()
        
        # Simulated ML inference logic:
        # High humidity + High current rainfall -> Likely to continue or increase
        # We calculate a 'storm_momentum' factor.
        
        momentum = (predictions['humidity_percent'] / 100.0) * 1.2
        
        # 1-hour horizon prediction
        predictions['pred_1h_mm'] = np.where(
            predictions['fused_rainfall'] > 0,
            predictions['fused_rainfall'] * momentum * np.random.uniform(0.8, 1.3, size=len(predictions)),
            np.where(predictions['humidity_percent'] > 90, np.random.uniform(0, 5, size=len(predictions)), 0)
        )
        
        # 3-hour horizon prediction (accumulation)
        predictions['pred_3h_mm'] = predictions['pred_1h_mm'] * np.random.uniform(2.5, 3.5, size=len(predictions))
        
        # 6-hour horizon prediction (accumulation)
        predictions['pred_6h_mm'] = predictions['pred_3h_mm'] * np.random.uniform(1.5, 2.5, size=len(predictions))
        
        # Calculate Confidence Score (0 to 1)
        predictions['confidence_score'] = np.where(
            predictions['fused_rainfall'] > 20, 
            np.random.uniform(0.85, 0.95, size=len(predictions)),
            np.random.uniform(0.60, 0.85, size=len(predictions))
        )
        
        # Cleanup rounding
        predictions['pred_1h_mm'] = predictions['pred_1h_mm'].round(2)
        predictions['pred_3h_mm'] = predictions['pred_3h_mm'].round(2)
        predictions['pred_6h_mm'] = predictions['pred_6h_mm'].round(2)
        predictions['confidence_score'] = predictions['confidence_score'].round(2)
        
        return predictions

rainfall_model = RainfallPredictor()
