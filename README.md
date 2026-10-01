# Hospital Accreditation Intelligence Platform

> **An Intelligent Healthcare Accreditation Surveillance, Process Mining, and Clinical Decision-Support System.**

[![Node.js](https://img.shields.io/badge/Node.js-v22.18-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-yellow.svg)](https://python.org/)
[![PM4Py](https://img.shields.io/badge/PM4Py-Process%20Mining-purple.svg)](https://pm4py.fit.fraunhofer.de/)
[![SimPy](https://img.shields.io/badge/SimPy-Digital%20Twin-orange.svg)](https://simpy.readthedocs.io/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Random%20Forest-red.svg)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-cyan.svg)](https://tailwindcss.com/)

---

## 1. Project Overview

**Hospital Accreditation Intelligence** is an enterprise-grade hospital quality and accreditation monitoring platform designed for hospital administrators, accreditation officers, and clinical quality managers.

The platform bridges continuous hospital telemetry, **PM4Py process mining**, **conformance checking**, **SimPy digital twin queuing simulation**, **Random Forest machine learning risk prediction**, **Isolation Forest anomaly detection**, **peer quality benchmarking (CMS / CDC NHSN / NABH)**, and a **Generative AI Copilot (Gemini API with RAG & Tool Calling)** into a unified hospital command center.

### Core Value Flow:
$$\text{Hospital Event Telemetry} \longrightarrow \text{PM4Py Process Mining} \longrightarrow \text{Multi-Factor Risk Engine} \longrightarrow \text{SimPy Digital Twin} \longrightarrow \text{Peer Benchmarking} \longrightarrow \text{Accreditation Impact} \longrightarrow \text{Generative AI Explanation}$$

---

## 2. Key Features

1. **Executive Accreditation Command Center**: Real-time composite risk gauge (0–100), KPI telemetry cards, 6-month historical area trends, and department severity matrix.
2. **PM4Py Clinical Process Mining**: Directly Follows Graph (DFG) discovery, trace variant analysis, execution frequencies, and bottleneck transition delays.
3. **Conformance Checking**: Token and sequence alignment comparing accredited standard pathways vs actual patient event logs; detects missing activities, skipped verifications, and ordering violations.
4. **Counterfactual Decision Modeling**: Evaluates *"What would hospital metrics and risk look like if specific process deviations had NOT occurred?"*.
5. **SimPy Discrete-Event Digital Twin**: Virtual hospital operational laboratory with interactive sliders for patient volume, nursing staff, doctors, and bed occupancy.
6. **Live Peer Benchmark Radar**: Multivariate radar charts comparing hospital performance against regional and national quality registries with percentile rankings.
7. **Accreditation Standards Engine**: Mappings for **NABH (5th Edition)**, **JCI (7th Edition)**, and **The Joint Commission (TJC)** indicators.
8. **Generative AI Accreditation Copilot**: Backend-only Gemini API integration with automatic tool calling, RAG telemetry injection, and grounded non-hallucinatory explanations.
9. **Automated Alert Console & Printable Dossier**: Severity-filtered alert management and one-click printable executive audit reports.
10. **Accreditation CAPA & Remediation Kanban Board**: Real-time interactive drag-and-drop workflow tracker for corrective actions, protocol checkpoints, risk mitigation scores, and one-click AI alert synchronization.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Tailwind CSS, Recharts, Lucide React, Axios |
| **Backend API** | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Helmet, CORS, dotenv |
| **AI & Analytics** | Python 3.12, Flask, Pandas, NumPy, Scikit-Learn, PM4Py, SimPy, Joblib |
| **Generative AI** | Google Gemini 1.5 Flash / Pro API (with RAG & function-calling context pipeline) |
| **Registries** | CMS Hospital Compare, CDC NHSN, NABH Quality Indicators (Mock & Live feeds) |

---

## 4. Project Structure

```
hospital-accreditation-intelligence/
├── frontend/                     # React Single Page Application
│   ├── public/                   # HTML Template & Assets
│   ├── src/
│   │   ├── components/           # UI Cards, Gauges, DFG Charts, AI Assistant
│   │   ├── pages/                # Command Center, Process Mining, Digital Twin, etc.
│   │   ├── services/             # Axios API Clients
│   │   ├── context/              # AuthContext & State
│   │   ├── utils/                # Risk Helpers & Formatters
│   │   ├── App.js & index.js     # Router & Root Entrypoints
│   └── package.json
│
├── backend/                      # Node.js Express REST API
│   ├── config/                   # MongoDB & External API configurations
│   ├── models/                   # Mongoose Schemas (User, Metric, Pathway, etc.)
│   ├── routes/                   # REST Route Definitions
│   ├── controllers/              # Business Logic & Orchestrators
│   ├── middleware/               # JWT Auth, Role Verification, Error Handlers
│   ├── services/                 # Risk Engine, Benchmark & LLM RAG Service
│   ├── utils/                    # Logger, Validators, Database Seeder
│   ├── server.js                 # Main Express Entrypoint
│   └── package.json
│
├── ai-service/                   # Python Analytics & ML Microservice
│   ├── app.py                    # Flask API Entrypoint (Port 5001)
│   ├── process_mining.py         # PM4Py DFG & Variant Analyzer
│   ├── conformance_checker.py    # Sequence Alignment & Deviation Detector
│   ├── counterfactual_model.py   # Statistical What-If Trajectory Estimator
│   ├── risk_prediction.py        # Random Forest Regressor & Feature Explainability
│   ├── anomaly_detection.py      # Isolation Forest Anomaly Engine
│   ├── digital_twin.py           # SimPy Discrete-Event Queue Simulation
│   ├── train_model.py            # Model Training Script
│   └── requirements.txt
│
├── data-service/                 # External Registry Fetcher & Schedulers
│   ├── external_fetcher.py       # Benchmark Registry Bridge
│   ├── benchmark_processor.py    # Percentile & Gap Calculators
│   └── data_sources.json         # CMS / CDC / NABH Registry Configs
│
├── database/                     # Seed JSON Fixtures
│   ├── accreditation_standards.json
│   ├── sample_metrics.json
│   ├── sample_pathways.json
│   ├── sample_benchmarks.json
│   └── sample_simulations.json
│
├── docs/                         # System Documentation
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── accreditation-standards.md
│   └── project-flow.md
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Getting Started (Windows Quickstart)

### Prerequisites
- **Node.js**: v18+ (tested on v22.18)
- **Python**: 3.10+ (tested on Python 3.12)
- **MongoDB**: Local Community Server (Running on `mongodb://127.0.0.1:27017`)

---

### Step 1: Clone and Configure Environment Variables

```powershell
# Copy the environment template
Copy-Item .env.example backend/.env
```

Edit `backend/.env` if you wish to attach a live Google Gemini API key:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hospital_accreditation
JWT_SECRET=super_secret_hospital_intelligence_jwt_key_2026
PYTHON_AI_URL=http://127.0.0.1:5001
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: The platform runs seamlessly even **without** an API key by using its internal grounded deterministic decision-support synthesizer.

---

### Step 2: Seed the Database

Seed demo users, multi-department telemetry, patient pathway event logs, benchmarks, and accreditation standards into MongoDB:

```powershell
cd d:\HA\backend
npm.cmd run seed
```

---

### Step 3: Start the 3 Services

Open 3 terminal windows to launch the system:

#### Terminal 1: Start Python AI & Analytics Service (Port 5001)
```powershell
cd d:\HA\ai-service
python app.py
```

#### Terminal 2: Start Express.js Backend API (Port 5000)
```powershell
cd d:\HA\backend
node server.js
```

#### Terminal 3: Start React.js Frontend (Port 3000)
```powershell
cd d:\HA\frontend
npm.cmd start
```

The web application will automatically open at `http://localhost:3000`.

---

## 6. Demo Testing Accounts

Use any of these pre-seeded demo accounts on the `/login` screen:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Accreditation Officer** | `officer@hospital.org` | `password123` | Full Accreditation & AI Copilot Suite |
| **Executive Admin** | `admin@hospital.org` | `password123` | Full System Administration |
| **Quality Manager** | `quality@hospital.org` | `password123` | Process Mining & Conformance Audits |
| **Data Analyst** | `analyst@hospital.org` | `password123` | Digital Twin & Telemetry Analytics |

---

## 7. Primary Demonstration Walkthrough

Follow this step-by-step scenario to demonstrate the full capabilities of the platform:

1. **Sign In**: Login as **Accreditation Officer** (`officer@hospital.org`).
2. **Review Command Center**: Observe the **Overall Accreditation Risk Gauge (47.1/100)** and note that **ICU** is in a Critical Risk state (82.5/100).
3. **Inspect PM4Py Process Mining (`/process-mining`)**:
   - Select **ICU** to inspect the Sepsis Resuscitation Pathway.
   - Observe **Variant #2** showing **Medication Verification step skipped** in 28 traces, breaching **NABH-COP-01**.
4. **Evaluate Counterfactual Outcome (`/counterfactual`)**:
   - Select *"Medication Verification Skipped"*.
   - Note that eliminating this deviation reduces average waiting time by **-21 minutes** and lowers risk by **-40.5 points**.
5. **Run Digital Twin What-If Simulation (`/digital-twin`)**:
   - Slide **Target Occupancy** from **85% → 100%**.
   - Click **"Execute What-If Simulation"**.
   - Observe SimPy queue results: Average wait increases to **68.4 min**, nurse utilization hits **96.2%**, and projected accreditation risk jumps to **89.5/100 (Critical)**.
6. **Engage AI Copilot Assistant (`/copilot`)**:
   - Ask: *"What is causing the ICU accreditation risk?"* → AI explains the 71% conformance breach, 94% occupancy, and -13% peer gap.
   - Ask: *"What happens if ICU occupancy reaches 100%?"* → AI triggers the digital twin simulation and cites exact simulated metrics.
   - Ask: *"What should management prioritize right now?"* → AI provides prioritized 24-48h and 1-2 week action items.
7. **Export Printable Audit Dossier (`/reports`)**:
   - Open Executive Reports and click **"Print / Export PDF"** to produce an official printable report.

---

## 8. Technology Attribution & Novelty

This system does not claim to have invented PM4Py, SimPy, Random Forest, or Large Language Models. 

**The Core Novelty is the seamless clinical and operational integration**:
$$\text{PM4Py Process Mining} + \text{Conformance Checking} + \text{SimPy Digital Twin} + \text{Multi-Factor Risk Engine} + \text{Generative AI Copilot}$$
specifically tailored for healthcare quality governance and accreditation surveillance.

---

## 9. Safety & Privacy Disclaimers

> [!IMPORTANT]
> - **Zero Real Patient Data**: All patient IDs, event traces, and operational metrics in this project are strictly synthetic.
> - **Administrative Decision Support Only**: This platform is designed solely for hospital quality, capacity, and accreditation governance. It does **not** diagnose patients, prescribe pharmaceuticals, or make individual clinical medical decisions.
> - **Simulation Estimates**: All counterfactual and digital twin predictions are statistical estimates and do not represent proven clinical causality.

---

## 10. License

Developed for Academic and Healthcare Intelligence Demonstration under the MIT License.
