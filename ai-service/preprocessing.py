"""
Hospital Accreditation Intelligence - Preprocessing Module
Transforms and formats patient event logs and operational metrics.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def load_event_log_dataframe(raw_traces):
    """
    Transforms a list of trace JSON objects into a flat pandas DataFrame suitable for process mining.
    Expected trace structure:
    [
        {
            "caseId": "P-101",
            "events": [
                {"activity": "Registration", "timestamp": "2026-03-01T08:00:00Z", "resource": "Nurse-A", "duration": 10},
                ...
            ]
        }
    ]
    """
    records = []
    
    if not raw_traces:
        # Generate default synthetic event logs if empty
        return generate_synthetic_event_log()

    for trace in raw_traces:
        case_id = trace.get("caseId", f"CASE-{np.random.randint(1000, 9999)}")
        department = trace.get("department", "General")
        is_conformant = trace.get("isConformant", True)
        events = trace.get("events", [])
        
        for idx, ev in enumerate(events):
            ts = ev.get("timestamp")
            if not ts:
                ts = (datetime.utcnow() + timedelta(minutes=idx * 15)).isoformat()
            
            records.append({
                "case_id": str(case_id),
                "activity": str(ev.get("activity", "Unknown Activity")),
                "timestamp": pd.to_datetime(ts),
                "resource": str(ev.get("resource", "Unassigned")),
                "duration": float(ev.get("duration", 10.0)),
                "department": department,
                "is_conformant": bool(is_conformant)
            })

    if not records:
        return generate_synthetic_event_log()

    df = pd.DataFrame(records)
    df = df.sort_values(by=["case_id", "timestamp"]).reset_index(drop=True)
    return df

def generate_synthetic_event_log(num_cases=50, department="ICU"):
    """
    Generates realistic patient pathway event logs for testing and fallback.
    """
    standard_activities = [
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
    
    records = []
    base_time = datetime(2026, 3, 1, 8, 0, 0)
    
    for c in range(1, num_cases + 1):
        case_id = f"P-{department[:3].upper()}-{100 + c}"
        # 30% chance of deviation
        has_deviation = (c % 3 == 0)
        curr_time = base_time + timedelta(hours=c * 2, minutes=np.random.randint(0, 45))
        
        activities_for_case = list(standard_activities)
        if has_deviation:
            if c % 6 == 0 and "Medication Verification" in activities_for_case:
                activities_for_case.remove("Medication Verification")
            elif c % 9 == 0 and "Blood Culture & Lactate Test" in activities_for_case:
                activities_for_case.remove("Blood Culture & Lactate Test")
        
        for idx, act in enumerate(activities_for_case):
            duration = np.random.randint(8, 45)
            if act == "Continuous Hemodynamic Monitoring":
                duration = np.random.randint(90, 240)
            
            curr_time = curr_time + timedelta(minutes=int(duration))
            records.append({
                "case_id": case_id,
                "activity": act,
                "timestamp": curr_time,
                "resource": f"Staff-{(c % 5) + 1}",
                "duration": float(duration),
                "department": department,
                "is_conformant": not has_deviation
            })

    df = pd.DataFrame(records)
    df = df.sort_values(by=["case_id", "timestamp"]).reset_index(drop=True)
    return df

def extract_trace_sequences(df):
    """
    Extracts ordered list of activities for each case_id.
    """
    traces = {}
    for case_id, group in df.groupby("case_id"):
        sorted_events = group.sort_values("timestamp")["activity"].tolist()
        traces[case_id] = sorted_events
    return traces
