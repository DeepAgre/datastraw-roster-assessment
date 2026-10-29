from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from database import Base, engine

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    requires_365_support = Column(Boolean)

class Pod(Base):
    __tablename__ = "pods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # e.g., "Pod Alpha"
    pod_lead = Column(String)  # e.g., "Manager John"
    brand_id = Column(Integer, ForeignKey("brands.id"))

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    pod_id = Column(Integer, ForeignKey("pods.id"), nullable=True)

class Process(Base):
    __tablename__ = "processes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    brand_id = Column(Integer, ForeignKey("brands.id"))

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_date = Column(Date)

class RosterEntry(Base):
    __tablename__ = "roster_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    brand_id = Column(Integer, ForeignKey("brands.id"))
    process_id = Column(Integer, ForeignKey("processes.id"))
    is_conflict = Column(Boolean, default=False)

Base.metadata.create_all(bind=engine)