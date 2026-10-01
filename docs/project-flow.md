# Project Walkthrough & Primary Demonstration Scenario

## Primary "Wow Factor" Demonstration Scenario

Follow this exact sequence to demonstrate the full capabilities of the **Hospital Accreditation Intelligence** platform:

---

### Step 1: Secure Authentication
1. Navigate to the login screen (`/login`).
2. Click on the **Accreditation Officer** demo profile (`officer@hospital.org`).
3. Click **"Sign In to Command Center"**.

---

### Step 2: Executive Command Center Overview
1. Observe the **Overall Accreditation Risk Gauge** showing an elevated composite score.
2. Review the top KPI cards:
   - ICU Occupancy: **94.0%** (Surge State).
   - Pathway Conformance: **71.0%** (19% below the 90% accreditation threshold).
   - Emergency Average Waiting Time: **52.0 min** (Triage anomaly detected).
3. Inspect the **Historical Quality Trends** area chart tracking 6-month risk progression.

---

### Step 3: PM4Py Process Mining & Conformance Checking
1. Click **PM4Py Process Mining** in the sidebar (`/process-mining`).
2. Select **ICU** department.
3. Observe the **Directly Follows Graph (DFG)** showing the standard expected pathway vs actual clinical traces.
4. Click through the **Observed Patient Trajectory Variants**:
   - Variant #1: Full conformance (64% of cases).
   - Variant #2: **Medication Verification step skipped** (24% of cases) — Breaches **NABH-COP-01**.
5. Review the **Bottleneck Transition** between *Blood Culture & Lactate Test* and *Broad-Spectrum Antibiotics* (~48m delay).

---

### Step 4: Counterfactual Modeling
1. Click **Counterfactual Analysis** in the sidebar (`/counterfactual`).
2. Select *"Medication Verification Skipped"*.
3. Review the side-by-side comparison:
   - **Actual State**: 52m wait, 71% conformance, 82.5 Risk (Critical).
   - **Counterfactual State**: 31m wait, 92% conformance, 42.0 Risk (Moderate).
   - **Gains**: -21m waiting time reduction, -40.5 risk score reduction, ~4 preventable incidents.

---

### Step 5: SimPy Digital Twin Simulation
1. Click **SimPy Digital Twin** in the sidebar (`/digital-twin`).
2. Click the quick preset: **"ICU 100% Surge"** (or slide Target Occupancy to **100%**).
3. Click **"Execute What-If Simulation"**.
4. Observe the SimPy discrete-event simulation results:
   - Average waiting time surges from **24.5 min → 68.4 min**.
   - Nurse workload utilization escalates to **96.2%**.
   - Projected Accreditation Risk jumps to **89.5/100 (Critical)**.
   - Identified Bottlenecks: *Bed availability exhaustion* and *Nurse triage overload*.

---

### Step 6: Generative AI Copilot Interaction
1. Click **AI Copilot Assistant** in the sidebar (`/copilot`).
2. **Question 1**: Click or type:
   > *"What is causing the ICU accreditation risk?"*
   - **AI Action**: Gathers live telemetry, process deviations, and benchmarks.
   - **AI Response**: Explains the 71% conformance breach (NABH-COP-01), 94% occupancy, 3.8/1000 infection rate, and -13% peer gap.
3. **Question 2**: Click or type:
   > *"What happens if ICU occupancy reaches 100%?"*
   - **AI Action**: Triggers the SimPy digital twin simulation backend tool.
   - **AI Response**: Cites the exact simulated numbers (+43.9m delay, 96.2% nurse load) and explains the severe compliance risk.
4. **Question 3**: Click or type:
   > *"What should management prioritize right now?"*
   - **AI Action**: Formulates grounded, prioritized 24-48h and 1-2 week action plans based strictly on the verified system data.

---

### Step 7: Executive Report Generation
1. Click **Executive Reports** in the sidebar (`/reports`).
2. Review the complete dossier containing departmental risk matrices, accreditation violation tables, and executive recommendations.
3. Click **"Print / Export PDF"** to produce an official printable audit document.
