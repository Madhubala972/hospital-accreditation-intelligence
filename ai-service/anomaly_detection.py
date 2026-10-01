"""
Hospital Accreditation Intelligence - Anomaly Detection Module
Uses Isolation Forest and multivariate statistical boundaries to detect operational anomalies.
"""

import os
import joblib
import numpy as np
import pandas as pd

ANOMALY_MODEL_CACHE = None

def get_anomaly_model():
    global ANOMALY_MODEL_CACHE
    if ANOMALY_MODEL_CACHE is None:
        model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "anomaly_model.pkl")
        if os.path.exists(model_path):
            ANOMALY_MODEL_CACHE = joblib.load(model_path)
    return ANOMALY_MODEL_CACHE

# Normal baseline operating envelopes
DEPARTMENT_BASELINES = {
    "ICU": {
        "avgWaitingTime": {"normalMin": 15.0, "normalMax": 30.0, "unit": "min"},
        "occupancyRate": {"normalMin": 70.0, "normalMax": 85.0, "unit": "%"},
        "infectionRate": {"normalMin": 0.5, "normalMax": 2.0, "unit": "per 1000 bed-days"},
        "pathwayConformance": {"normalMin": 85.0, "normalMax": 100.0, "unit": "%"},
        "incidentCount": {"normalMin": 0, "normalMax": 3, "unit": "incidents/mo"}
    },
    "Emergency": {
        "avgWaitingTime": {"normalMin": 15.0, "normalMax": 35.0, "unit": "min"},
        "occupancyRate": {"normalMin": 65.0, "normalMax": 82.0, "unit": "%"},
        "infectionRate": {"normalMin": 0.2, "normalMax": 1.5, "unit": "per 1000 bed-days"},
        "pathwayConformance": {"normalMin": 85.0, "normalMax": 100.0, "unit": "%"},
        "incidentCount": {"normalMin": 0, "normalMax": 4, "unit": "incidents/mo"}
    },
    "Cardiology": {
        "avgWaitingTime": {"normalMin": 15.0, "normalMax": 30.0, "unit": "min"},
        "occupancyRate": {"normalMin": 60.0, "normalMax": 80.0, "unit": "%"},
        "infectionRate": {"normalMin": 0.4, "normalMax": 1.8, "unit": "per 1000 bed-days"},
        "pathwayConformance": {"normalMin": 88.0, "normalMax": 100.0, "unit": "%"},
        "incidentCount": {"normalMin": 0, "normalMax": 2, "unit": "incidents/mo"}
    },
    "General Medicine": {
        "avgWaitingTime": {"normalMin": 15.0, "normalMax": 25.0, "unit": "min"},
        "occupancyRate": {"normalMin": 60.0, "normalMax": 78.0, "unit": "%"},
        "infectionRate": {"normalMin": 0.3, "normalMax": 1.2, "unit": "per 1000 bed-days"},
        "pathwayConformance": {"normalMin": 90.0, "normalMax": 100.0, "unit": "%"},
        "incidentCount": {"normalMin": 0, "normalMax": 2, "unit": "incidents/mo"}
    },
    "Surgery": {
        "avgWaitingTime": {"normalMin": 15.0, "normalMax": 30.0, "unit": "min"},
        "occupancyRate": {"normalMin": 65.0, "normalMax": 82.0, "unit": "%"},
        "infectionRate": {"normalMin": 0.5, "normalMax": 1.9, "unit": "per 1000 bed-days"},
        "pathwayConformance": {"normalMin": 88.0, "normalMax": 100.0, "unit": "%"},
        "incidentCount": {"normalMin": 0, "normalMax": 2, "unit": "incidents/mo"}
    }
}

def detect_operational_anomalies(metrics_dict, department="ICU"):
    """
    Evaluates telemetry against Isolation Forest and departmental baselines to surface anomalies.
    """
    pkg = get_anomaly_model()
    
    raw_vals = {
        "occupancyRate": float(metrics_dict.get("occupancyRate", 85.0)),
        "avgWaitingTime": float(metrics_dict.get("avgWaitingTime", 35.0)),
        "infectionRate": float(metrics_dict.get("infectionRate", 2.0)),
        "pathwayConformance": float(metrics_dict.get("pathwayConformance", 80.0)),
        "staffingLevel": float(metrics_dict.get("staffingLevel", 85.0)),
        "incidentCount": float(metrics_dict.get("incidentCount", 3.0)),
        "benchmarkGap": float(metrics_dict.get("benchmarkGap", -4.0))
    }

    input_df = pd.DataFrame([raw_vals])
    
    # Isolation Forest prediction: -1 = anomaly, 1 = normal
    is_ml_anomaly = False
    anomaly_score = 0.0
    if pkg and "model" in pkg:
        pred = pkg["model"].predict(input_df)[0]
        score = pkg["model"].decision_function(input_df)[0]
        is_ml_anomaly = bool(pred == -1)
        anomaly_score = round(float(score), 4)

    # Telemetry checks against departmental envelope
    baselines = DEPARTMENT_BASELINES.get(department, DEPARTMENT_BASELINES["ICU"])
    detected_anomalies = []

    # Check Waiting Time
    wt_val = raw_vals["avgWaitingTime"]
    wt_base = baselines["avgWaitingTime"]
    if wt_val > wt_base["normalMax"]:
        delta = wt_val - wt_base["normalMax"]
        detected_anomalies.append({
            "metric": "Average Waiting Time",
            "currentValue": f"{wt_val} min",
            "expectedRange": f"{wt_base['normalMin']} - {wt_base['normalMax']} min",
            "severity": "CRITICAL" if wt_val > wt_base["normalMax"] * 1.6 else "HIGH",
            "deviation": f"+{round(delta, 1)} min over maximum baseline",
            "explanation": f"Average waiting time ({wt_val}m) is abnormally high for {department}. Normal baseline is {wt_base['normalMin']}-{wt_base['normalMax']}m."
        })

    # Check Infection Rate
    inf_val = raw_vals["infectionRate"]
    inf_base = baselines["infectionRate"]
    if inf_val > inf_base["normalMax"]:
        delta = inf_val - inf_base["normalMax"]
        detected_anomalies.append({
            "metric": "Hospital Infection Rate",
            "currentValue": f"{inf_val} / 1000",
            "expectedRange": f"{inf_base['normalMin']} - {inf_base['normalMax']} / 1000",
            "severity": "CRITICAL" if inf_val > inf_base["normalMax"] * 1.5 else "HIGH",
            "deviation": f"+{round(delta, 2)} above baseline ceiling",
            "explanation": f"Healthcare-associated infection rate ({inf_val}/1000 bed days) exceeds the standard safe threshold of {inf_base['normalMax']}."
        })

    # Check Occupancy
    occ_val = raw_vals["occupancyRate"]
    occ_base = baselines["occupancyRate"]
    if occ_val > occ_base["normalMax"]:
        delta = occ_val - occ_base["normalMax"]
        detected_anomalies.append({
            "metric": "Bed Occupancy Rate",
            "currentValue": f"{occ_val}%",
            "expectedRange": f"{occ_base['normalMin']} - {occ_base['normalMax']}%",
            "severity": "CRITICAL" if occ_val >= 94 else "HIGH",
            "deviation": f"+{round(delta, 1)}% surge over optimal operating capacity",
            "explanation": f"Department is operating near saturation ({occ_val}%), creating severe bottleneck risks."
        })

    # Check Conformance
    conf_val = raw_vals["pathwayConformance"]
    conf_base = baselines["pathwayConformance"]
    if conf_val < conf_base["normalMin"]:
        delta = conf_base["normalMin"] - conf_val
        detected_anomalies.append({
            "metric": "Pathway Conformance",
            "currentValue": f"{conf_val}%",
            "expectedRange": f"{conf_base['normalMin']} - {conf_base['normalMax']}%",
            "severity": "CRITICAL" if conf_val < 72 else "HIGH",
            "deviation": f"-{round(delta, 1)}% below required accreditation threshold",
            "explanation": f"Clinical care pathway conformance ({conf_val}%) has dropped below standard quality guidelines ({conf_base['normalMin']}%)."
        })

    has_anomaly = bool(len(detected_anomalies) > 0 or is_ml_anomaly)

    return {
        "department": str(department),
        "hasAnomaly": bool(has_anomaly),
        "isIsolationForestOutlier": bool(is_ml_anomaly),
        "anomalyScore": float(anomaly_score),
        "anomalyCount": int(len(detected_anomalies)),
        "detectedAnomalies": detected_anomalies,
        "status": "ANOMALY_DETECTED" if has_anomaly else "NORMAL"
    }
