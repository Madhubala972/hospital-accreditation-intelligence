# System Architecture: Hospital Accreditation Intelligence

## 1. High-Level Architecture Overview

The **Hospital Accreditation Intelligence** system is an enterprise-grade, multi-tier decision-support and accreditation surveillance platform. It bridges continuous hospital telemetry, process mining algorithms, digital twin queuing models, machine learning risk engines, and Generative AI to proactively detect compliance violations and guide hospital leadership.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      React.js Single-Page Frontend                      │
│     (Command Center, DFG Process Miner, Digital Twin, AI Copilot)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / JSON REST
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Node.js / Express.js Backend API                      │
│    ├── JWT Auth & Role Security                                         │
│    ├── Accreditation Risk Engine (0 - 100 Composite Scoring)            │
│    ├── Benchmark Aggregation & Percentile Processor                     │
│    └── Generative AI Orchestrator (RAG Context & Tool Dispatcher)       │
└──────────────────┬─────────────────────────────────┬────────────────────┘
                   │                                 │
                   ▼                                 ▼
┌─────────────────────────────────────┐  ┌────────────────────────────────┐
│          MongoDB Database           │  │   Python AI/Analytics Service  │
│  ├── Users & Roles                  │  │   ├── PM4Py Process Mining     │
│  ├── Operational Metrics            │  │   ├── Conformance Checking     │
│  ├── Patient Pathway Event Logs     │  │   ├── SimPy Digital Twin       │
│  ├── Accreditation Standards        │  │   ├── Random Forest Risk Model │
│  ├── Peer Benchmarks                │  │   ├── Isolation Forest Anomaly │
│  └── Simulation Baselines           │  │   └── Counterfactual Estimator │
└─────────────────────────────────────┘  └────────────────────────────────┘
```

---

## 2. Core Service Components

### A. Frontend Layer (React.js + Tailwind CSS)
- **Framework**: React 18 with React Router v6, Tailwind CSS, Lucide React icons, and Recharts.
- **State Management**: React Context (`AuthContext`) for JWT authentication and department scoping.
- **Visual Process Flow**: PM4Py Directly Follows Graph (DFG) sequence rendering with variant inspection.
- **Real-time Digital Twin**: Interactive simulation console with parameter sliders for instant what-if feedback.
- **AI Copilot**: Slide-over drawer and full-screen ChatGPT-style interface with tool-calling transparency.

### B. Backend API Layer (Node.js + Express + MongoDB)
- **Architecture**: Controller-Service-Repository pattern.
- **Security**: Helmet, CORS, JWT authentication with role-based access control (`Admin`, `Accreditation Officer`, `Quality Manager`, `Analyst`), bcryptjs password hashing.
- **Composite Risk Engine (`riskService.js`)**: Evaluates 6 dimensions:
  1. Process Mining Conformance (25%)
  2. Operational Metric Envelope (20%)
  3. Machine Learning Risk Prediction (20%)
  4. Multivariate Anomalies (15%)
  5. Peer Benchmark Gap (10%)
  6. Accreditation Indicator Compliance (10%)
- **Resilient Fallback**: If MongoDB or Python service is temporarily offline, the backend seamlessly routes calculations through deterministic in-process engines and local JSON registry stores without failing.

### C. Analytics & ML Engine (Python Flask Service)
- **PM4Py**: Directly Follows Graph discovery, sequence alignment, trace variant extraction, bottleneck detection.
- **SimPy**: Discrete-event queuing model simulating patient arrivals, nurse triage, bed allocation, and doctor treatment under variable capacity constraints.
- **Scikit-Learn Random Forest**: Multi-feature regression model predicting composite accreditation risk with feature importance explainability.
- **Scikit-Learn Isolation Forest**: Unsupervised multivariate anomaly detection for waiting times, infection rates, and bed occupancy spikes.
- **Counterfactual Estimator**: What-if statistical delta model answering *"What would operational metrics look like if specific process deviations had NOT occurred?"*.

### D. Generative AI Layer (Gemini API with RAG & Tool Calling)
- **Architecture**: RAG + Function Calling Context Injection.
- **Safety**: Strict backend-only key isolation, prompt guardrails prohibiting clinical diagnoses/prescriptions, and non-hallucinatory grounding on live database numbers.

---

## 3. Data Flow Diagram

```
Hospital Event Logs ──► Preprocessing ──► PM4Py DFG Discovery ──► Conformance Score
                                                                        │
Operational Telemetry ──► ML Random Forest & Isolation Forest ──────────┼──► Risk Engine
                                                                        │    (0-100 Score)
Peer Registries (CMS/CDC) ──► Benchmark Gap Calculator ─────────────────┤          │
                                                                        ▼          ▼
User Question ──────────► Backend RAG Orchestrator ────────────► Gemini AI ──► Copilot Output
```
