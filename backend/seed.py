from datetime import date, timedelta
from database import SessionLocal
from models import Brand, Pod, Process, Employee, Leave, RosterEntry

def seed_database():
    db = SessionLocal()

    # Clear existing data in correct order (child tables first, parent tables last)
    db.query(RosterEntry).delete()
    db.query(Leave).delete()
    db.query(Employee).delete()
    db.query(Process).delete()
    db.query(Pod).delete()
    db.query(Brand).delete()
    db.commit()

    print("🌱 Seeding Brands...")
    brand1 = Brand(name="Alpha Corp", requires_365_support=True)
    brand2 = Brand(name="Beta Retail", requires_365_support=False)
    brand3 = Brand(name="Gamma Tech", requires_365_support=True)
    db.add_all([brand1, brand2, brand3])
    db.commit()

    print("🌱 Seeding Pods & Pod Leads...")
    pod1 = Pod(name="Support Pod A", pod_lead="Aarav Sharma", brand_id=brand1.id)
    pod2 = Pod(name="Retail Pod B", pod_lead="Priya Mehta", brand_id=brand2.id)
    pod3 = Pod(name="Tech Pod C", pod_lead="Rohan Verma", brand_id=brand3.id)
    db.add_all([pod1, pod2, pod3])
    db.commit()

    print("🌱 Seeding Processes...")
    processes = [
        Process(name="Customer Support", brand_id=brand1.id),
        Process(name="Technical Escalations", brand_id=brand1.id),
        Process(name="Order Processing", brand_id=brand2.id),
        Process(name="Live Chat", brand_id=brand3.id),
    ]
    db.add_all(processes)
    db.commit()

    print("🌱 Seeding 30 Employees across Pods...")
    pods = [pod1, pod2, pod3]
    employees = []
    
    for i in range(1, 31):
        assigned_pod = pods[i % len(pods)]
        emp = Employee(name=f"Agent {i}", brand_id=assigned_pod.brand_id, pod_id=assigned_pod.id)
        employees.append(emp)

    db.add_all(employees)
    db.commit()

    print("🌱 Seeding Sample Leaves...")
    tomorrow = date.today() + timedelta(days=1)
    leave1 = Leave(employee_id=1, leave_date=tomorrow)
    leave2 = Leave(employee_id=2, leave_date=tomorrow)
    db.add_all([leave1, leave2])
    db.commit()

    db.close()
    print("✅ Database successfully seeded with Pods, Pod Leads, and 30 employees!")

if __name__ == "__main__":
    seed_database()