from datetime import date, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Employee, Brand, Process, Leave, RosterEntry

def generate_monthly_roster(year: int, month: int):
    db = SessionLocal()
    
    # Clear old roster entries for this month if re-generating
    # (Simplified for now: clear all roster entries)
    db.query(RosterEntry).delete()
    db.commit()

    employees = db.query(Employee).all()
    processes = db.query(Process).all()
    leaves = {leave.employee_id: leave.leave_date for leave in db.query(Leave).all()}

    # Determine start and end date of the given month
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)

    current_date = start_date
    roster_entries = []

    print(f"🗓️ Generating roster from {start_date} to {end_date}...")

    while current_date <= end_date:
        for emp in employees:
            # Find a process related to the employee's brand
            brand_processes = [p for p in processes if p.brand_id == emp.brand_id]
            if not brand_processes:
                continue
            
            assigned_process = brand_processes[0] # Assign first available process for simplicity

            # Check if employee is on leave on this date
            is_on_leave = (emp.id in leaves and leaves[emp.id] == current_date)
            
            conflict_detected = False
            if is_on_leave:
                conflict_detected = True  # Conflict: Employee scheduled while on leave!

            entry = RosterEntry(
                date=current_date,
                employee_id=emp.id,
                brand_id=emp.brand_id,
                process_id=assigned_process.id,
                is_conflict=conflict_detected
            )
            roster_entries.append(entry)

        current_date += timedelta(days=1)

    db.add_all(roster_entries)
    db.commit()
    db.close()
    print("✅ Roster generated successfully with conflict detection!")

if __name__ == "__main__":
    # Test generating roster for current year and month
    today = date.today()
    generate_monthly_roster(today.year, today.month)