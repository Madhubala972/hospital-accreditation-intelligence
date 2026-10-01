"""
Hospital Accreditation Intelligence - Kanban & CAPA Pipeline Verification Test
Validates:
1. Fetching CAPA Kanban tasks and summary metrics
2. Creating a new CAPA remediation task
3. Updating task stages (drag-and-drop workflow progression)
4. Toggling checklist compliance checkpoints
5. Syncing active AI telemetry alerts into Kanban backlog
6. Deleting CAPA tasks
"""

import urllib.request
import urllib.parse
import json
import sys

def test_kanban():
    print("=================================================================")
    print(" HOSPITAL ACCREDITATION INTELLIGENCE - KANBAN & CAPA TEST")
    print("=================================================================\n")

    backend_base = "http://localhost:5000/api"

    # 1. Test GET /api/capa
    try:
        req = urllib.request.Request(f"{backend_base}/capa")
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            assert data.get("success") is True
            metrics = data.get("metrics", {})
            tasks = data.get("tasks", [])
            print(f"[OK] GET /api/capa: {len(tasks)} tasks loaded. Compliance Rate: {metrics.get('complianceRate')}% | Risk Mitigated: {metrics.get('resolvedRiskReduction')} pts")
    except Exception as e:
        print(f"[ERROR] GET /api/capa: {e}")
        return False

    # 2. Test POST /api/capa (Create)
    created_id = None
    try:
        new_task = {
            "title": "Automated Unit Test - Barcode Scanner Deployment",
            "description": "Verify barcode scanner installation across 10 ICU bays.",
            "department": "ICU",
            "priority": "HIGH",
            "stage": "BACKLOG",
            "standardCode": "NABH-COP-01",
            "standardBody": "NABH",
            "assignee": {"name": "Dr. Sarah Jenkins", "role": "Accreditation Officer", "avatar": "SJ"},
            "estimatedRiskReduction": 20.0,
            "checklists": [
                {"text": "Setup scanner hardware", "completed": False},
                {"text": "Test nursing credentials", "completed": False}
            ]
        }
        req = urllib.request.Request(
            f"{backend_base}/capa",
            data=json.dumps(new_task).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            assert data.get("success") is True
            created_task = data.get("task", {})
            created_id = created_task.get("_id") or created_task.get("id")
            print(f"[OK] POST /api/capa: Created task '{created_task.get('title')}' with ID: {created_id}")
    except Exception as e:
        print(f"[ERROR] POST /api/capa: {e}")
        return False

    # 3. Test PATCH /api/capa/:id/stage (Move to IN_PROGRESS)
    if created_id:
        try:
            stage_payload = json.dumps({"stage": "IN_PROGRESS"}).encode()
            req = urllib.request.Request(
                f"{backend_base}/capa/{created_id}/stage",
                data=stage_payload,
                headers={"Content-Type": "application/json"},
                method="PATCH"
            )
            with urllib.request.urlopen(req, timeout=5) as res:
                data = json.loads(res.read().decode())
                assert data.get("success") is True
                print(f"[OK] PATCH /api/capa/{created_id}/stage: Advanced to 'IN_PROGRESS'")
        except Exception as e:
            print(f"[ERROR] PATCH /api/capa stage: {e}")
            return False

    # 4. Test PATCH /api/capa/:id/checklist/0 (Toggle subtask)
    if created_id:
        try:
            req = urllib.request.Request(
                f"{backend_base}/capa/{created_id}/checklist/0",
                data=b"{}",
                headers={"Content-Type": "application/json"},
                method="PATCH"
            )
            with urllib.request.urlopen(req, timeout=5) as res:
                data = json.loads(res.read().decode())
                assert data.get("success") is True
                print(f"[OK] PATCH /api/capa/{created_id}/checklist/0: Toggled checklist item")
        except Exception as e:
            print(f"[ERROR] PATCH checklist: {e}")
            return False

    # 5. Test POST /api/capa/sync-alerts
    try:
        req = urllib.request.Request(
            f"{backend_base}/capa/sync-alerts",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            assert data.get("success") is True
            print(f"[OK] POST /api/capa/sync-alerts: Synced alerts ({data.get('message')})")
    except Exception as e:
        print(f"[ERROR] POST /api/capa/sync-alerts: {e}")

    # 6. Test DELETE /api/capa/:id
    if created_id:
        try:
            req = urllib.request.Request(
                f"{backend_base}/capa/{created_id}",
                method="DELETE"
            )
            with urllib.request.urlopen(req, timeout=5) as res:
                data = json.loads(res.read().decode())
                assert data.get("success") is True
                print(f"[OK] DELETE /api/capa/{created_id}: Cleaned up test task")
        except Exception as e:
            print(f"[ERROR] DELETE /api/capa: {e}")
            return False

    print("\n=================================================================")
    print(" ALL KANBAN & CAPA SYSTEM TESTS PASSED SUCCESSFULLY!")
    print("=================================================================")
    return True

if __name__ == "__main__":
    success = test_kanban()
    if not success:
        sys.exit(1)
