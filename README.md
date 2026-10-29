# Datastraw Smart Roster Intelligence System

![System Status](https://img.shields.io/badge/Status-Complete-success)
![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688)
![Database](https://img.shields.io/badge/Database-PostgreSQL-316192)

**Candidate Name:** Deep Prakash Agre  
**Role:** AI / Tech Intern Assessment 

---

## 📌 Approach Note
I architected this roster management tool as a modern, full-stack web application focusing on high-performance data generation and real-time operational flexibility. By decoupling a high-speed Python/FastAPI backend from a responsive, edge-to-edge React frontend, the system can dynamically validate thousands of monthly shift entries against live-updated agent leave constraints without requiring full-page reloads.

## 🚀 Core Features Built
* **Automated Monthly Roster Generation:** Python-based scheduling engine iterating over multiple processes, pods, and client brands to output full monthly tables.
* **Dynamic Conflict Engine:** Real-time database scanning. If an agent is manually logged for a leave date where a shift is assigned, the backend immediately flags an overlap.
* **Luxury "Obsidian" Dashboard:** Fully responsive, edge-to-edge dark UI featuring state-managed tabs, hover-triggered tooltip matrix navigation, and brand-level filtering.
* **Relational Database Design:** Normalized PostgreSQL schema (`Brands`, `Employees`, `Pods`, `Processes`, `Leaves`, `RosterEntries`).

## 🏗️ Technical Architecture & Design Decisions

### 1. Why FastAPI for the Backend?
FastAPI was chosen for its asynchronous capabilities and automatic OpenAPI (Swagger) documentation. When generating a full month's roster (900+ entries) or retroactively scanning for conflicts, FastAPI + SQLAlchemy handles the bulk database inserts efficiently, returning clean JSON to the frontend in milliseconds.

### 2. Why React + Vite for the Frontend?
Vite provides a lightning-fast development environment. The UI relies heavily on conditional rendering and state arrays (`roster`, `conflicts`). By using React, the "Manage Operations" tab can push a new leave to the database and instantly re-render the conflict matrix without fetching unnecessary DOM elements.

### 3. Handling Manual Changes (Operational Flexibility)
The system is built to mimic real-world operational changes. Instead of forcing a full roster rebuild every time an agent takes sick leave, the `/leaves` endpoint creates a constraint and uses SQLAlchemy to retroactively validate existing `RosterEntry` records, flipping `is_conflict` to `True` where overlaps occur. 

## 🔮 Future Roadmap (If given one additional week)
If I had one more week to expand this system for Datastraw, I would implement:
1. **Interactive Drag-and-Drop Editor:** Upgrading the frontend matrix to allow operations managers to click, drag, and reassign shifts directly on the UI using `react-beautiful-dnd`.
2. **Role-Based Access Control (RBAC):** Implementing JWT Authentication so only "Managers" can trigger roster generations and approve leaves, while "Agents" can only view their personal schedule.
3. **Containerization:** Wrapping the API, React app, and PostgreSQL database into Docker containers (`docker-compose`) for one-click environment setups across the engineering team.

## 🛠️ Local Setup Instructions

**1. Clone the repository**
```bash
git clone [https://github.com/DeepAgre/datastraw-roster-assessment.git](https://github.com/DeepAgre/datastraw-roster-assessment.git)
cd datastraw-roster-assessment