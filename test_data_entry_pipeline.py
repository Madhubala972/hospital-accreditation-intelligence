import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:5000/api"

def test_pipeline():
    print("=================================================================")
    print("Hospital Accreditation Intelligence - Data Entry Pipeline Tests")
    print("=================================================================\n")

    # 1. Test POST /api/metrics (User enters new telemetry for Cardiology)
    print("1. Testing User Telemetry Entry & Dynamic ML Risk Recalculation...")
    metric_payload = {
        "department": "Cardiology",
        "bedOccupancy": 92.5,
        "avgWaitTime": 55.0,
        "conformanceRate": 74.0,
        "nurseToPatientRatio": 1.1,
        "infectionRate": 3.2,
        "mortalityRate": 2.8,
        "readmissionRate": 9.5,
        "budgetVariance": 6.8,
        "patientThroughput": 180,
        "incidentCount": 4
    }
    r = requests.post(f"{BASE_URL}/metrics", json=metric_payload)
    print(f"   Status: {r.status_code}")
    assert r.status_code == 200, f"Failed to save metrics: {r.text}"
    metric_res = r.json()
    assert metric_res["success"] is True
    recalc_risk = metric_res["metric"].get("riskScore")
    risk_cat = metric_res["metric"].get("riskCategory")
    print(f"   ✅ Successfully saved Cardiology telemetry!")
    print(f"   Dynamic ML Risk Recalculation: Score = {recalc_risk}, Category = {risk_cat}\n")

    # 2. Test POST /api/pathways/traces (User logs a patient pathway trace)
    print("2. Testing Patient Trace Logger & PM4Py Process Mining DFG Re-mining...")
    trace_payload = {
        "caseId": "CASE-TEST-999",
        "department": "Cardiology",
        "protocolName": "Acute Coronary Syndrome Protocol",
        "activities": [
            "Arrival with Chest Pain",
            "12-Lead ECG <= 10m",
            "Delayed Cardiology Consult",
            "Aspirin / Heparin Initiation",
            "Cath Lab Activation",
            "PCI Intervention"
        ],
        "totalDurationMinutes": 210,
        "isCompliant": False,
        "deviations": ["Delayed Cardiology Consult by 40m"]
    }
    r = requests.post(f"{BASE_URL}/pathways/traces", json=trace_payload)
    print(f"   Status: {r.status_code}")
    assert r.status_code == 201, f"Failed to add patient trace: {r.text}"
    trace_res = r.json()
    assert trace_res["success"] is True
    mining = trace_res.get("miningResult") or {}
    print(f"   ✅ Ingested Patient Trace {trace_payload['caseId']} into Cardiology!")
    print(f"   Updated Pathway Total Cases: {mining.get('totalCases')}, Conformance: {mining.get('conformanceRate')}%\n")

    # 3. Test POST /api/benchmarks (User enters/updates a peer benchmark)
    print("3. Testing Peer Benchmark Ingestion & Percentile Computation...")
    benchmark_payload = {
        "department": "Cardiology",
        "metric": "Door-to-Balloon PCI Time",
        "hospitalValue": 78.0,
        "regionalPeer": 65.0,
        "nationalBenchmark": 60.0,
        "top10Benchmark": 45.0,
        "unit": "min",
        "higherIsBetter": False
    }
    r = requests.post(f"{BASE_URL}/benchmarks", json=benchmark_payload)
    print(f"   Status: {r.status_code}")
    assert r.status_code == 200, f"Failed to save benchmark: {r.text}"
    bm_res = r.json()
    assert bm_res["success"] is True
    percentile = bm_res["benchmark"].get("percentileRank")
    gap = bm_res["benchmark"].get("gapPercentage")
    print(f"   ✅ Successfully saved Peer Benchmark for 'Door-to-Balloon PCI Time'!")
    print(f"   Computed Percentile Rank: {percentile}th percentile, Gap: {gap}%\n")

    # 4. Test POST /api/risk/standards (User creates an accreditation standard)
    print("4. Testing Accreditation Standard Definition & Compliance Evaluator...")
    standard_payload = {
        "code": "COP-CARD-02",
        "category": "Interventional Cardiology",
        "description": "Door-to-Balloon time for STEMI patients <= 90 minutes",
        "department": "Cardiology",
        "targetThreshold": 90.0,
        "actualValue": 78.0,
        "operator": "<=",
        "mandatory": True,
        "riskWeight": "HIGH"
    }
    r = requests.post(f"{BASE_URL}/risk/standards", json=standard_payload)
    print(f"   Status: {r.status_code}")
    assert r.status_code == 200, f"Failed to save accreditation standard: {r.text}"
    std_res = r.json()
    assert std_res["success"] is True
    print(f"   ✅ Saved Standard {std_res['standard'].get('code')}!")
    print(f"   Evaluated Compliance Status: {std_res['standard'].get('status')}\n")

    # 5. Test POST /api/alerts (User creates custom hospital alert)
    print("5. Testing Real-time Alert Creation & Dispatch...")
    alert_payload = {
        "title": "Cath Lab Backlog Critical Alert",
        "severity": "CRITICAL",
        "department": "Cardiology",
        "category": "PROCESS_BOTTLENECK",
        "reason": "Cath lab sterilization turnover delay exceeded 45 minutes.",
        "recommendedAction": "Activate auxiliary catheterization lab suite 2."
    }
    r = requests.post(f"{BASE_URL}/alerts", json=alert_payload)
    print(f"   Status: {r.status_code}")
    assert r.status_code == 201, f"Failed to dispatch alert: {r.text}"
    alert_res = r.json()
    assert alert_res["success"] is True
    print(f"   ✅ Broadcast Alert '{alert_res['alert'].get('title')}' (Status: {alert_res['alert'].get('status')})\n")

    # 6. Test AI Copilot Chat synthesis with updated user data
    print("6. Testing AI Copilot Intelligence Synthesis with newly entered data...")
    chat_payload = {
        "message": "What is the latest accreditation risk and patient process conformance for Cardiology following our recent data updates?",
        "department": "Cardiology"
    }
    r = requests.post(f"{BASE_URL}/ai/chat", json=chat_payload)
    print(f"   Status: {r.status_code}")
    assert r.status_code == 200, f"AI Copilot failed: {r.text}"
    chat_res = r.json()
    assert chat_res["success"] is True
    print(f"   ✅ AI Copilot Response:\n   \"{chat_res.get('reply', '')[:250]}...\"\n")

    print("=================================================================")
    print("🎉 ALL DATA ENTRY & RECALCULATION ENDPOINTS VERIFIED SUCCESSFULLY!")
    print("=================================================================")

if __name__ == "__main__":
    test_pipeline()
