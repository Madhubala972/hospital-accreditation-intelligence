# Accreditation Standards & Indicator Formulations

## 1. Supported Accreditation Frameworks

The platform actively maps telemetry and clinical pathway adherence against three major international and national accreditation systems:

1. **NABH (National Accreditation Board for Hospitals & Healthcare Providers - 5th Edition)**
   - *Care of Patients (COP)*: Continuous clinical pathway conformance & emergency response times.
   - *Hospital Infection Control (HIC)*: Central line, surgical site, and urinary catheter infection rates.
   - *Patient Safety & Quality (PSQ)*: Medication error reporting & adverse event surveillance.
2. **JCI (Joint Commission International - 7th Edition)**
   - *International Patient Safety Goals (IPSG)*: Two-identifier verification & critical laboratory notification timeframes.
3. **The Joint Commission (TJC)**
   - *Leadership (LD)*: Nurse-to-patient staffing adequacy ratios in critical care units.

---

## 2. Multi-Factor Composite Risk Formulation

The overall department and hospital accreditation risk score ($R \in [0, 100]$) is computed through a weighted combination:

$$R = w_1 \cdot \text{ML}_{\text{Risk}} + w_2 \cdot \text{Conf}_{\text{Gap}} + w_3 \cdot \text{Anom}_{\text{Score}} + w_4 \cdot \text{Bench}_{\text{Gap}} + w_5 \cdot \text{Std}_{\text{NonCompliance}}$$

Where:
- $\text{ML}_{\text{Risk}}$ (Weight $w_1 = 0.25$): Random Forest Regressor prediction trained on multi-department telemetry.
- $\text{Conf}_{\text{Gap}}$ (Weight $w_2 = 0.25$): Penalty proportional to $(90.0\% - \text{Pathway Conformance})$.
- $\text{Anom}_{\text{Score}}$ (Weight $w_3 = 0.15$): Isolation Forest outlier severity and statistical baseline violations.
- $\text{Bench}_{\text{Gap}}$ (Weight $w_4 = 0.15$): Penalty proportional to negative gap against regional/national peer averages.
- $\text{Std}_{\text{NonCompliance}}$ (Weight $w_5 = 0.20$): Cumulative count of breached accreditation indicator thresholds.

### Risk Severity Tiers:
- **0 – 30**: LOW Risk (Green) — Compliant operations with comfortable resource margins.
- **31 – 60**: MODERATE Risk (Amber) — Minor non-conformances requiring departmental review.
- **61 – 80**: HIGH Risk (Orange) — Substantial compliance deficits; corrective actions mandated.
- **81 – 100**: CRITICAL Risk (Red) — Imminent risk of accreditation condition or conditional downgrade.

---

## 3. Disclaimers & Safety Rules
- The accreditation risk score is strictly an administrative and operational decision-support tool.
- All figures represent synthetic demo metrics for educational and administrative evaluation.
