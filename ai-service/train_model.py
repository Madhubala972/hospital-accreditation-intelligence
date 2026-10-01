"""
Hospital Accreditation Intelligence - ML Training Script
Trains a Random Forest Regressor/Classifier for accreditation risk prediction
and an Isolation Forest for operational anomaly detection.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def generate_training_data(n_samples=1200):
    """
    Generates synthetic but statistically realistic hospital operations telemetry.
    Features:
    - occupancyRate (40 - 100%)
    - avgWaitingTime (10 - 90 min)
    - infectionRate (0.2 - 6.0 per 1000 bed days)
    - pathwayConformance (50 - 100%)
    - staffingLevel (60 - 100%)
    - incidentCount (0 - 15)
    - benchmarkGap (-25.0 to +15.0)
    """
    np.random.seed(42)
    
    occupancy = np.random.uniform(50.0, 98.0, n_samples)
    waiting_time = np.random.uniform(15.0, 75.0, n_samples)
    infection_rate = np.random.uniform(0.5, 4.5, n_samples)
    conformance = np.random.uniform(60.0, 98.0, n_samples)
    staffing = np.random.uniform(70.0, 98.0, n_samples)
    incidents = np.random.poisson(3.0, n_samples)
    benchmark_gap = np.random.uniform(-15.0, 10.0, n_samples)

    # Risk Formula calculation for ground truth training target (0 to 100)
    # Higher occupancy, waiting time, infection, incidents, and negative benchmark gap INCREASE risk.
    # Higher conformance and staffing DECREASE risk.
    base_risk = (
        (occupancy * 0.22) +
        (waiting_time * 0.25) +
        (infection_rate * 6.5) +
        ((100.0 - conformance) * 0.35) +
        ((100.0 - staffing) * 0.20) +
        (incidents * 2.2) +
        (np.maximum(0, -benchmark_gap) * 0.8) +
        np.random.normal(0, 2.5, n_samples)
    )

    # Scale to 0-100 bounds
    risk_score = np.clip((base_risk - 15) * 1.1, 5.0, 98.0)

    df = pd.DataFrame({
        "occupancyRate": occupancy,
        "avgWaitingTime": waiting_time,
        "infectionRate": infection_rate,
        "pathwayConformance": conformance,
        "staffingLevel": staffing,
        "incidentCount": incidents,
        "benchmarkGap": benchmark_gap,
        "riskScore": risk_score
    })
    
    return df

def train_and_save_models():
    print("Generating synthetic hospital training dataset...")
    df = generate_training_data(1500)
    
    features = [
        "occupancyRate",
        "avgWaitingTime",
        "infectionRate",
        "pathwayConformance",
        "staffingLevel",
        "incidentCount",
        "benchmarkGap"
    ]
    
    X = df[features]
    y = df["riskScore"]

    print("Training Random Forest Risk Prediction Model...")
    rf_model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    rf_model.fit(X, y)

    print("Training Isolation Forest Anomaly Detection Model...")
    iso_model = IsolationForest(contamination=0.08, random_state=42)
    iso_model.fit(X)

    output_dir = os.path.dirname(os.path.abspath(__file__))
    rf_path = os.path.join(output_dir, "risk_model.pkl")
    iso_path = os.path.join(output_dir, "anomaly_model.pkl")

    joblib.dump({"model": rf_model, "features": features}, rf_path)
    joblib.dump({"model": iso_model, "features": features}, iso_path)

    print(f"Risk model successfully saved to {rf_path}")
    print(f"Anomaly model successfully saved to {iso_path}")
    print(f"Random Forest Feature Importances:")
    for feat, imp in zip(features, rf_model.feature_importances_):
        print(f"  - {feat}: {imp:.4f}")

if __name__ == "__main__":
    train_and_save_models()
