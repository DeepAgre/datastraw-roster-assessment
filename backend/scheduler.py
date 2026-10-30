from datetime import date, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Employee, Brand, Process, Leave, RosterEntry, Pod

def seed_initial_data(db: Session):
    # Check if data already exists
    if db.query(Employee.id).first():
        return  # Already seeded

    print("🌱 Seeding initial database records...")

    
    pods = [
        Pod(id=1, name="Alpha Pod"),
        Pod(id=2, name="Beta Pod"),
        Pod(id=3, name="Gamma Pod")
    ]
    db.add_all(pods)
    db.commit()

    brands = [
        Brand(id=1, name="Alpha Corp"),
        Brand(id=2, name="Beta Retail"),
        Brand(id=3, name="Gamma Tech")
    ]
    db.add_all(brands)
    db.commit()

   
    processes = [
        Process(id=1, name="Voice Support", brand_id=1),
        Process(id=2, name="Live Chat", brand_id=1),
        Process(id=3, name="Voice Support", brand_id=2),
        Process(id=4, name="Live Chat", brand_id=2),
        Process(id=5, name="Voice Support", brand_id=3),
        Process(id=6, name="Live Chat", brand_id=3),
    ]
    db.add_all(processes)
    db.commit()

    
    employees = []
    for i in range(1, 31):
        pod_id = 1 if i <= 10 else (2 if i <= 20 else 3)
        brand_id = (i % 3) + 1  # Distribute across brands 1, 2, 3
        emp = Employee(id=i, name=f"Agent {i}", pod_id=pod_id, brand_id=brand_id)
        employees.append(emp)
    
    db.add_all(employees)
    db.commit()
    print("✅ Initial data seeded successfully!")

def generate_monthly_roster(year: int, month: int):
    db = SessionLocal()
    
    seed_initial_data(db)

    db.query(RosterEntry).delete()
    db.commit()

    employees = db.query(Employee).all()
    processes = db.query(Process).all()
    leaves = {leave.employee_id: leave.leave_date for leave in db.query(Leave).all()}

    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)

    current_date = start_date
    roster_entries = []

    print(f"🗓️ Generating roster from {start_date} to {end_date} for {len(employees)} employees...")

    while current_date <= end_date:
        for emp in employees:
            brand_processes = [p for p in processes if p.brand_id == emp.brand_id]
            if not brand_processes:
                continue
            
            assigned_process = brand_processes[0] 

            is_on_leave = (emp.id in leaves and leaves[emp.id] == current_date)
            
            conflict_detected = False
            if is_on_leave:
                conflict_detected = True  

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
    today = date.today()
    generate_monthly_roster(today.year, today.month)