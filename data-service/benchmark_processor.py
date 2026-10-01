"""
Hospital Accreditation Intelligence - Benchmark Statistical Processor
Calculates gap analysis, z-scores, percentile distribution, and risk weighting.
"""

import numpy as np

def calculate_benchmark_metrics(your_val, peer_avg, reg_bench, nat_bench, higher_is_better=True):
    """
    Computes gap, percentile estimate, and risk contribution.
    """
    if higher_is_better:
        gap = round(your_val - peer_avg, 1)
        # Percentile approximation
        if peer_avg > 0:
            ratio = your_val / peer_avg
            percentile = max(5, min(99, int(50 + (ratio - 1.0) * 80)))
        else:
            percentile = 50
    else:
        gap = round(peer_avg - your_val, 1)  # If lower is better (e.g. infection rate), lower your_val is positive
        if peer_avg > 0:
            ratio = peer_avg / max(0.1, your_val)
            percentile = max(5, min(99, int(50 + (ratio - 1.0) * 80)))
        else:
            percentile = 50

    if gap < -10:
        risk = "Critical"
    elif gap < 0:
        risk = "High"
    elif gap < 5:
        risk = "Moderate"
    else:
        risk = "Low"

    return {
        "yourHospital": your_val,
        "peerAverage": peer_avg,
        "regionalBenchmark": reg_bench,
        "nationalBenchmark": nat_bench,
        "gap": gap,
        "percentile": percentile,
        "riskContribution": risk
    }
