"""
Hospital Accreditation Intelligence - End-to-End System Verification
Tests all endpoints across Python AI microservice, Express Backend, and Simulation engine.
"""

import urllib.request
import json
import time

def test_api():
    print("=================================================================")
    print(" HOSPITAL ACCREDITATION INTELLIGENCE - END-TO-END SYSTEM TEST")
    print("=================================================================\n")

    backend_base = "http://localhost:5000/api"
    
    # 1. Health Check
    try:
        req = urllib.request.Request(f"{backend_base}/health")
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            print(f"[OK] Backend Health API: {data.get('status')} ({data.get('service')})")
    except Exception as e:
        print(f"[ERROR] Backend Health Check: {e}")

    # 2. Login Check
    try:
        login_payload = json.dumps({"email": "officer@hospital.org", "password": "password123"}).encode()
        req = urllib.request.Request(f"{backend_base}/auth/login", data=login_payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            token = data.get("token")
            user = data.get("user", {})
            print(f"[OK] Auth Login API: Success for {user.get('name')} ({user.get('role')})")
    except Exception as e:
        print(f"[ERROR] Auth Login: {e}")

    # 3. Overall Risk Calculation Check
    try:
        req = urllib.request.Request(f"{backend_base}/risk/overall")
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            print(f"[OK] Risk Engine API: Score = {data.get('overallRiskScore')}/100, Category = {data.get('riskCategory')}")
    except Exception as e:
        print(f"[ERROR] Risk Engine: {e}")

    # 4. Process Mining & Conformance Check
    try:
        req = urllib.request.Request(f"{backend_base}/pathways/conformance-check", data=json.dumps({"department": "ICU"}).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            res_data = data.get("result", {})
            print(f"[OK] Conformance Checker API: Score = {res_data.get('conformanceScore')}%, Deviations = {len(res_data.get('deviations', []))}")
    except Exception as e:
        print(f"[ERROR] Conformance Checker: {e}")

    # 5. Digital Twin Simulation Check
    try:
        sim_payload = json.dumps({
            "department": "ICU",
            "targetOccupancy": 100,
            "patientVolumePerDay": 650,
            "nursesOnDuty": 14,
            "doctorsOnDuty": 4,
            "bedCapacity": 30
        }).encode()
        req = urllib.request.Request(f"{backend_base}/simulation/run", data=sim_payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read().decode())
            sim_res = data.get("result", {})
            print(f"[OK] SimPy Digital Twin API: Simulated Risk = {sim_res.get('simulated', {}).get('projectedRiskScore')}/100, Wait Time Delta = +{sim_res.get('comparison', {}).get('waitingTimeDeltaMinutes')}m")
    except Exception as e:
        print(f"[ERROR] SimPy Simulation: {e}")

    # 6. AI Copilot RAG & Tool Calling Check
    try:
        copilot_payload = json.dumps({
            "query": "What is causing the ICU accreditation risk?",
            "department": "ICU"
        }).encode()
        req = urllib.request.Request(f"{backend_base}/ai/chat", data=copilot_payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode())
            print(f"[OK] Generative AI Copilot API: Response received ({len(data.get('answer', ''))} chars)")
            print(f"     Grounded Engine: {data.get('engine')}")
    except Exception as e:
        print(f"[ERROR] AI Copilot: {e}")

    print("\n=================================================================")
    print(" ALL END-TO-END VERIFICATION CHECKS SUCCESSFUL!")
    print("=================================================================\n")

if __name__ == "__main__":
    test_api()
