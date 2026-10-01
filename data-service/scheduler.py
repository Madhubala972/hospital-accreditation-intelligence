"""
Hospital Accreditation Intelligence - Data Service Scheduler
Periodically syncs peer benchmarks and logs updates.
"""

import time
import os
from external_fetcher import fetch_external_benchmarks

def run_sync_cycle():
    print("[Data Sync] Refreshing external peer benchmark feeds...")
    departments = ["ICU", "Emergency", "Cardiology", "Surgery", "General Medicine"]
    for dept in departments:
        res = fetch_external_benchmarks(dept)
        print(f"[Data Sync] Synced {len(res.get('benchmarks', []))} indicators for {dept}")
    print("[Data Sync] Cycle completed successfully.")

if __name__ == "__main__":
    run_sync_cycle()
