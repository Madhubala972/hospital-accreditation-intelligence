# REST API Documentation: Hospital Accreditation Intelligence

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/login`
Authenticates a user and returns a JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "officer@hospital.org",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "name": "Dr. Sarah Jenkins",
      "email": "officer@hospital.org",
      "role": "Accreditation Officer",
      "department": "Quality & Accreditation"
    }
  }
  ```

### `GET /auth/demo-accounts`
Returns available demo accounts for testing without registration.

---

## 2. Hospital Operational Metrics Endpoints

### `GET /metrics`
Retrieves current telemetry for all hospital departments (ICU, Emergency, Cardiology, Surgery, General Medicine).

### `GET /metrics/:department`
Retrieves telemetry for a specific department.

### `GET /metrics/summary/kpis`
Retrieves aggregate KPIs: average occupancy rate, average waiting time, overall conformance, and quality index.

### `GET /metrics/trends/historical`
Retrieves 6-month historical progression for risk, conformance, waiting times, and infection rates.

---

## 3. Process Mining & Conformance Endpoints

### `GET /pathways`
Returns all monitored clinical pathways and standard step definitions.

### `POST /pathways/analyze`
Triggers PM4Py Directly Follows Graph (DFG) discovery, bottleneck detection, and variant extraction.

### `POST /pathways/conformance-check`
Compares actual patient event traces against expected standard clinical steps.
- **Response**:
  ```json
  {
    "conformanceScore": 71.0,
    "totalTracesAnalyzed": 50,
    "complianceStatus": "NON_COMPLIANT",
    "deviations": [
      {
        "type": "Missing Step (Skipped)",
        "activity": "Medication Verification",
        "frequency": 28,
        "impact": "High Risk - Increases medication adverse event likelihood."
      }
    ]
  }
  ```

### `POST /pathways/counterfactual`
Computes what-if outcome deltas if a specific pathway deviation had been prevented.

---

## 4. Digital Twin Simulation Endpoints

### `POST /simulation/run`
Executes a SimPy discrete-event queue simulation comparing baseline vs what-if capacity constraints.
- **Request Body**:
  ```json
  {
    "department": "ICU",
    "targetOccupancy": 100,
    "patientVolumePerDay": 650,
    "nursesOnDuty": 14,
    "doctorsOnDuty": 4,
    "bedCapacity": 30
  }
  ```
- **Response**:
  ```json
  {
    "baseline": { "occupancyRate": 85, "avgWaitingTimeMinutes": 24.5, "projectedRiskScore": 58.0 },
    "simulated": { "occupancyRate": 100, "avgWaitingTimeMinutes": 68.4, "projectedRiskScore": 89.5 },
    "comparison": { "waitingTimeDeltaMinutes": 43.9, "riskScoreDelta": 31.5 },
    "bottlenecks": ["ICU Bed Capacity Exhaustion (Occupancy >= 95%)", "Severe Nursing Staff Overload"],
    "accreditationImpact": "CRITICAL ACCREDITATION RISK - Violates NABH Safe Staffing ratio."
  }
  ```

---

## 5. Risk & Accreditation Standards Endpoints

### `GET /risk/overall`
Returns overall hospital accreditation risk score (0-100), severity band, and department rankings.

### `GET /risk/department/:department`
Returns detailed risk score breakdown, ML feature importance, and non-compliant indicators.

### `GET /risk/standards`
Returns compliance status against NABH, JCI, and TJC standard indicator thresholds.

---

## 6. Generative AI Copilot Endpoints

### `POST /ai/chat`
Submits a query to the AI Copilot with automated RAG context retrieval and tool calling.
- **Request Body**:
  ```json
  {
    "query": "What is causing the ICU accreditation risk?",
    "department": "ICU"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "answer": "### 🚨 Root Cause Analysis: ICU Accreditation Risk\n\nThe ICU is currently operating at a **CRITICAL Risk Score of 82.5/100**...\n1. Clinical Pathway Deviations (71% Conformance vs 90% Target)...\n2. Capacity Saturation (94% Bed Occupancy)...",
    "engine": "Google Gemini Pro / Flash API (Live AI Engine)",
    "groundedDataSources": ["Process Mining Event Logs", "Random Forest Risk Engine", "CDC & CMS Benchmarks", "SimPy Digital Twin"]
  }
  ```
