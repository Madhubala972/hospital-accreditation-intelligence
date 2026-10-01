"""
Hospital Accreditation Intelligence - Python AI & Analytics Flask Service
Exposes REST endpoints for Process Mining, Conformance Checking, Counterfactual Modeling,
Risk Prediction, Anomaly Detection, and Digital Twin Simulation.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from process_mining import analyze_process_logs
from conformance_checker import check_pathway_conformance
from counterfactual_model import analyze_counterfactual_scenario
from risk_prediction import predict_hospital_risk
from anomaly_detection import detect_operational_anomalies
from digital_twin import run_digital_twin_simulation

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Hospital Accreditation Intelligence AI Analytics Service",
        "version": "1.0.0"
    })

@app.route("/process-mine", methods=["POST"])
def process_mine_endpoint():
    data = request.get_json() or {}
    raw_traces = data.get("traces", [])
    department = data.get("department", "ICU")
    result = analyze_process_logs(raw_traces=raw_traces, department=department)
    return jsonify(result)

@app.route("/conformance-check", methods=["POST"])
def conformance_check_endpoint():
    data = request.get_json() or {}
    expected_steps = data.get("expectedSteps", [])
    actual_traces = data.get("actualTraces", [])
    department = data.get("department", "ICU")
    pathway_name = data.get("pathwayName", "Care Pathway")
    result = check_pathway_conformance(expected_steps, actual_traces, department, pathway_name)
    return jsonify(result)

@app.route("/counterfactual", methods=["POST"])
def counterfactual_endpoint():
    data = request.get_json() or {}
    deviation_type = data.get("deviationType", "Medication Verification Skipped")
    actual_metrics = data.get("actualMetrics", None)
    department = data.get("department", "ICU")
    result = analyze_counterfactual_scenario(deviation_type, actual_metrics, department)
    return jsonify(result)

@app.route("/predict-risk", methods=["POST"])
def predict_risk_endpoint():
    data = request.get_json() or {}
    department = data.get("department", "ICU")
    result = predict_hospital_risk(data, department)
    return jsonify(result)

@app.route("/detect-anomaly", methods=["POST"])
def detect_anomaly_endpoint():
    data = request.get_json() or {}
    department = data.get("department", "ICU")
    result = detect_operational_anomalies(data, department)
    return jsonify(result)

@app.route("/simulate", methods=["POST"])
def simulate_endpoint():
    data = request.get_json() or {}
    department = data.get("department", "ICU")
    result = run_digital_twin_simulation(data, department)
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting Hospital Accreditation AI Service on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
