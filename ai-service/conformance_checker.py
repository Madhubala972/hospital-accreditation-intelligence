"""
Hospital Accreditation Intelligence - Conformance Checking Module
Performs sequence alignment, missing activity detection, and ordering violation checks
between expected clinical standard pathways and actual patient event traces.
"""

import numpy as np

def check_pathway_conformance(expected_steps, actual_traces, department="ICU", pathway_name="Care Pathway"):
    """
    Evaluates actual event traces against standard accredited steps.
    
    expected_steps: ["Patient Admission", "Triage & Vital Signs", "Blood Culture", ...]
    actual_traces: [
        {
            "caseId": "P-ICU-101",
            "events": [{"activity": "Patient Admission"}, ...]
        }
    ]
    """
    if not expected_steps:
        expected_steps = [
            "Patient Admission",
            "Triage & Vital Signs",
            "Blood Culture & Lactate Test",
            "Broad-Spectrum Antibiotics",
            "IV Fluid Resuscitation",
            "Medication Verification",
            "Continuous Hemodynamic Monitoring",
            "Consultant Review",
            "ICU Step-down / Discharge"
        ]

    if not actual_traces:
        # Generate default traces if none provided
        actual_traces = [
            {
                "caseId": "P-101",
                "events": [{"activity": s} for s in expected_steps if s != "Medication Verification"]
            },
            {
                "caseId": "P-102",
                "events": [{"activity": s} for s in expected_steps]
            }
        ]

    trace_results = []
    missing_activity_counts = {}
    unexpected_activity_counts = {}
    order_violations_count = 0
    total_alignment_scores = []

    for trace in actual_traces:
        case_id = trace.get("caseId", "Unknown-Case")
        events = trace.get("events", [])
        actual_seq = [e.get("activity") for e in events if e.get("activity")]

        # Sequence alignment & deviation detection
        missing = [step for step in expected_steps if step not in actual_seq]
        unexpected = [step for step in actual_seq if step not in expected_steps]
        
        # Check ordering violations among shared activities
        shared_expected_order = [s for s in expected_steps if s in actual_seq]
        shared_actual_order = [s for s in actual_seq if s in expected_steps]
        is_order_violation = (shared_expected_order != shared_actual_order)
        
        if is_order_violation:
            order_violations_count += 1

        for m in missing:
            missing_activity_counts[m] = missing_activity_counts.get(m, 0) + 1
        for u in unexpected:
            unexpected_activity_counts[u] = unexpected_activity_counts.get(u, 0) + 1

        # Calculate Levenshtein-style alignment score
        m_len = max(len(expected_steps), len(actual_seq))
        matches = sum(1 for a, b in zip(expected_steps, actual_seq) if a == b)
        penalty = len(missing) * 1.5 + len(unexpected) * 1.0 + (2.0 if is_order_violation else 0.0)
        score = max(0.0, min(100.0, round(((m_len - penalty) / max(1, m_len)) * 100, 1)))
        
        total_alignment_scores.append(score)
        
        trace_results.append({
            "caseId": case_id,
            "alignmentScore": score,
            "isConformant": score >= 85.0 and len(missing) == 0 and not is_order_violation,
            "missingActivities": missing,
            "unexpectedActivities": unexpected,
            "hasOrderingViolation": is_order_violation,
            "actualLength": len(actual_seq),
            "expectedLength": len(expected_steps)
        })

    # Overall Summary
    avg_conformance = round(float(np.mean(total_alignment_scores)), 1) if total_alignment_scores else 0.0
    
    # Top Deviations Summary
    deviations_summary = []
    for act, cnt in sorted(missing_activity_counts.items(), key=lambda x: x[1], reverse=True):
        deviations_summary.append({
            "type": "Missing Step (Skipped)",
            "activity": act,
            "frequency": cnt,
            "severity": "CRITICAL" if "Verification" in act or "Antibiotic" in act or "Consent" in act else "HIGH",
            "impact": f"Step was omitted in {cnt} analyzed patient pathways, breaching accreditation standard."
        })

    for act, cnt in sorted(unexpected_activity_counts.items(), key=lambda x: x[1], reverse=True):
        deviations_summary.append({
            "type": "Unscheduled Activity",
            "activity": act,
            "frequency": cnt,
            "severity": "MODERATE",
            "impact": f"Unplanned intervention occurred in {cnt} cases, increasing overall length of stay."
        })

    if order_violations_count > 0:
        deviations_summary.append({
            "type": "Ordering Violation",
            "activity": "Care Sequence Reversal",
            "frequency": order_violations_count,
            "severity": "HIGH",
            "impact": f"Sequence inversion detected in {order_violations_count} cases."
        })

    return {
        "department": department,
        "pathwayName": pathway_name,
        "conformanceScore": avg_conformance,
        "totalTracesAnalyzed": len(actual_traces),
        "conformantTracesCount": sum(1 for t in trace_results if t["isConformant"]),
        "deviatingTracesCount": sum(1 for t in trace_results if not t["isConformant"]),
        "complianceStatus": "COMPLIANT" if avg_conformance >= 85.0 else ("AT_RISK" if avg_conformance >= 70.0 else "NON_COMPLIANT"),
        "expectedSteps": expected_steps,
        "deviations": deviations_summary,
        "traceBreakdown": trace_results[:10]  # First 10 for payload size
    }
