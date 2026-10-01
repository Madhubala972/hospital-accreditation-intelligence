"""
Hospital Accreditation Intelligence - Counterfactual Modeling Module
Estimates what operational and accreditation metrics would have been
if specific clinical pathway deviations had NOT occurred.

DISCLAIMER: Counterfactual results are synthetic statistical estimates for
operational decision support and do not represent proven clinical causality.
"""

def analyze_counterfactual_scenario(deviation_type, actual_metrics=None, department="ICU"):
    """
    Computes baseline vs counterfactual outcome based on observed pathway deviations.
    """
    if actual_metrics is None:
        actual_metrics = {
            "avgWaitingTime": 52.0,
            "pathwayConformance": 71.0,
            "infectionRate": 3.8,
            "occupancyRate": 94.0,
            "riskScore": 82.5,
            "incidentCount": 7
        }

    actual_wait = actual_metrics.get("avgWaitingTime", 50.0)
    actual_conf = actual_metrics.get("pathwayConformance", 70.0)
    actual_risk = actual_metrics.get("riskScore", 80.0)
    actual_inf = actual_metrics.get("infectionRate", 3.0)

    # Counterfactual adjustments based on correcting specific deviations
    if "Medication Verification" in deviation_type or "verification" in deviation_type.lower():
        cf_wait = max(20.0, actual_wait - 8.0)
        cf_conf = min(98.0, actual_conf + 18.0)
        cf_risk = max(25.0, actual_risk - 28.0)
        cf_inf = actual_inf
        impact_summary = (
            "Enforcing double-check medication verification prevents downstream dispensing "
            "delays and reduces adverse incident probability by ~40%."
        )
        preventable_incidents = 4
    elif "Antibiotic" in deviation_type or "Delay" in deviation_type:
        cf_wait = max(20.0, actual_wait - 21.0)
        cf_conf = min(98.0, actual_conf + 22.0)
        cf_risk = max(22.0, actual_risk - 32.0)
        cf_inf = max(1.0, actual_inf - 1.2)
        impact_summary = (
            "Administering broad-spectrum antibiotics within 1 hour of sepsis recognition "
            "significantly lowers ICU length of stay and reduces infection escalation."
        )
        preventable_incidents = 5
    elif "ECG" in deviation_type or "Triage" in deviation_type:
        cf_wait = max(15.0, actual_wait - 24.0)
        cf_conf = min(98.0, actual_conf + 25.0)
        cf_risk = max(20.0, actual_risk - 35.0)
        cf_inf = actual_inf
        impact_summary = (
            "Executing door-to-ECG within the 10-minute threshold prevents triage bottlenecks "
            "and satisfies NABH Emergency care standards."
        )
        preventable_incidents = 6
    else:
        # Generic counterfactual adjustment
        cf_wait = max(25.0, actual_wait - 15.0)
        cf_conf = min(95.0, actual_conf + 15.0)
        cf_risk = max(30.0, actual_risk - 22.0)
        cf_inf = max(1.2, actual_inf - 0.8)
        impact_summary = (
            "Full pathway adherence eliminates secondary review delays and restores target conformance."
        )
        preventable_incidents = 3

    return {
        "department": department,
        "deviationEvaluated": deviation_type,
        "disclaimer": "Counterfactual results are synthetic statistical estimates for decision support, not proven clinical causality.",
        "actualOutcome": {
            "waitingTimeMinutes": round(actual_wait, 1),
            "conformanceRate": round(actual_conf, 1),
            "infectionRate": round(actual_inf, 1),
            "riskScore": round(actual_risk, 1),
            "riskCategory": "CRITICAL" if actual_risk > 80 else ("HIGH" if actual_risk > 60 else "MODERATE")
        },
        "counterfactualOutcome": {
            "waitingTimeMinutes": round(cf_wait, 1),
            "conformanceRate": round(cf_conf, 1),
            "infectionRate": round(cf_inf, 1),
            "riskScore": round(cf_risk, 1),
            "riskCategory": "CRITICAL" if cf_risk > 80 else ("HIGH" if cf_risk > 60 else ("MODERATE" if cf_risk > 30 else "LOW"))
        },
        "delta": {
            "waitingTimeReductionMinutes": round(actual_wait - cf_wait, 1),
            "conformanceImprovementPercent": round(cf_conf - actual_conf, 1),
            "riskScoreReduction": round(actual_risk - cf_risk, 1),
            "estimatedPreventableIncidents": preventable_incidents
        },
        "impactSummary": impact_summary,
        "accreditationBenefit": "Restores department compliance with NABH / JCI care standard benchmarks."
    }
