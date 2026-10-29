# Datastraw Smart Roster Intelligence System

Candidate Name: Deep Prakash Agre
Role: AI / Tech Intern Assessment 

---

## Approach Note
I architected this roster management tool as a modern, full-stack web application focusing on high-performance data generation and real-time operational flexibility. By decoupling a Python/FastAPI backend from a responsive React frontend, the system can dynamically validate thousands of monthly shift entries against live-updated agent leave constraints without requiring full-page reloads.

## Core Features Built
- Automated Monthly Roster Generation: Python-based scheduling engine iterating over multiple processes, pods, and client brands to output full monthly tables.
- Dynamic Conflict Engine: Real-time database scanning. If an agent is manually logged for a leave date where a shift is assigned, the backend immediately flags an overlap.
- Dashboard: Responsive, edge-to-edge dark UI featuring state-managed tabs, hover-triggered tooltip matrix navigation, and brand-level filtering.
- Relational Database Design: Normalized PostgreSQL schema for Brands, Employees, Pods, Processes, Leaves, and RosterEntries.

## Bonus Features Implemented (Beyond the Basics)
In alignment with Section 6 of the assessment guidelines, I prioritized reliable scheduling while implementing the following optional feature:
- Automatic Roster Validation After Availability Changes: When an operations manager logs an approved leave via the frontend, the system automatically scans the database and instantly regenerates the conflict status for the existing roster, highlighting overlaps without requiring a manual month-wide schedule rebuild.

## Architectural Thinking & Design Decisions (Assessment Q&A)

### 1. How did you model employees, brands, processes, pods, and their relationships?
I utilized a normalized PostgreSQL relational schema. Employees act as the central entity, containing foreign keys linking them to specific Pods and Brands. Processes were mapped to ensure that a single employee can be assigned to all processes for a single brand, or multiple employees can be linked to the same Brand ID but handle separate operational constraints.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
The FastAPI backend iterates through the target month's calendar, evaluating each day against brand-specific operating rules. It checks the active employee assignments and generates a RosterEntry for each working day. Constraints are validated retroactively: if a required shift is logged on a date matching an entry in the Leaves table, the engine updates that specific roster entry's conflict status to True.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
This was handled directly at the database mapping level. For single-resource brands (approx. 80% of the dataset), a single employee_id holds the sole mapping to a brand_id. For multi-resource brands, multiple employees share the same brand_id. The conflict engine groups coverage by brand_id, ensuring that if one employee takes leave, the system checks if the remaining mapped employees can fulfill the process coverage before flagging a critical gap.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
When the operations manager logs the approved leave via the frontend, the /leaves POST endpoint inserts the leave record and retroactively scans the RosterEntry table. Because no other employees are mapped to that brand to provide backup coverage, the system immediately flags the shift as a critical conflict. This instantly surfaces on the UI's Conflicts tab so the manager can manually intervene.

### 5. How does your system handle conflicting requirements or insufficient staffing?
Rather than silently failing, freezing, or mathematically forcing an invalid assignment, the application prioritizes visibility. It generates the required shift to ensure client coverage rules are represented, but flags it as an unresolvable conflict. This guarantees that operations managers are explicitly alerted to staffing deficits prior to roster publication.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
- Automated: Bulk schedule generation (creating 900+ monthly shift entries), overlap detection, and real-time conflict flagging.
- Human Control: Leave approval, final schedule publication, and backup resource assignment. 
- Why: Scheduling algorithms cannot account for sudden real-world nuances like emergencies or last-minute client demands. Automating the heavy data entry while leaving exception-handling to human judgment ensures flexibility and prevents algorithmic bottlenecks.

### 7. If the company doubled its team and brand count, what would you change about your solution?
I would optimize the backend architecture for scale. Specifically, I would implement database connection pooling (e.g., PgBouncer), add frontend matrix pagination to prevent DOM overload, and offload the bulk roster generation to a background task worker (like Celery and Redis) so the main FastAPI thread remains non-blocking during computation.

### 8. If you had one additional week to work on this, what would you improve first?
- Interactive Drag-and-Drop Editor: Upgrading the frontend matrix to allow operations managers to click, drag, and reassign backup shifts directly on the UI to resolve the flagged conflicts.
- Role-Based Access Control (RBAC): Implementing JWT Authentication so only Managers can trigger roster generations and approve leaves, while Agents can only view their personal schedules.
- Containerization: Wrapping the API, React app, and PostgreSQL database into Docker containers (docker-compose) for one-click environment setups across the engineering team.

## Local Setup Instructions

1. Clone the repository
```bash
git clone [https://github.com/DeepAgre/datastraw-roster-assessment.git](https://github.com/DeepAgre/datastraw-roster-assessment.git)
cd datastraw-roster-assessment