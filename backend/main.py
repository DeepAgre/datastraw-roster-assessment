from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from database import SessionLocal, engine
import models
from scheduler import generate_monthly_roster

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Datastraw Smart Roster API")

# Enable CORS so your React frontend can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Datastraw Smart Roster API is running successfully!"}

@app.post("/roster/generate")
def trigger_roster_generation(year: int, month: int):
    try:
        generate_monthly_roster(year, month)
        return {"status": "success", "message": f"Roster generated for {year}-{month:02d}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/roster")
def get_roster_entries(db: Session = Depends(get_db)):
    entries = db.query(models.RosterEntry).all()
    return entries

@app.get("/conflicts")
def get_conflict_entries(db: Session = Depends(get_db)):
    # This directly answers Datastraw's core requirement: clear conflict detection!
    conflicts = db.query(models.RosterEntry).filter(models.RosterEntry.is_conflict == True).all()
    return conflicts

# --- NEW: Leave Management & Dynamic Conflict Validation ---

class LeaveCreate(BaseModel):
    employee_id: int
    leave_date: date

@app.post("/leaves")
def create_leave(leave: LeaveCreate, db: Session = Depends(get_db)):
    # 1. Add the new leave record to the database
    new_leave = models.Leave(employee_id=leave.employee_id, leave_date=leave.leave_date)
    db.add(new_leave)
    
    # 2. Retroactively scan the roster and flag a conflict if they are already scheduled
    overlapping_entry = db.query(models.RosterEntry).filter(
        models.RosterEntry.employee_id == leave.employee_id,
        models.RosterEntry.date == leave.leave_date
    ).first()
    
    if overlapping_entry:
        overlapping_entry.is_conflict = True
        
    db.commit()
    return {"message": f"Leave recorded for Agent {leave.employee_id}. Conflicts dynamically updated."}