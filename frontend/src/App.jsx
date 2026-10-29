import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

function App() {
  const [roster, setRoster] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("matrix");
  
  // Multi-level View States
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedPod, setSelectedPod] = useState("all");
  const [selectedProcess, setSelectedProcess] = useState("all");
  
  const [tooltip, setTooltip] = useState({ visible: false, empId: "", date: "", x: 0, y: 0, status: "", isConflict: false });
  
  // Management States
  const [leaveEmpId, setLeaveEmpId] = useState("1");
  const [leaveDate, setLeaveDate] = useState("");
  
  const [editEmpId, setEditEmpId] = useState("1");
  const [editDate, setEditDate] = useState("");
  const [editBrandId, setEditBrandId] = useState("1");

  const fetchRosterData = async () => {
    try {
      const rosterRes = await axios.get(`${API_URL}/roster`);
      setRoster(rosterRes.data);
      const conflictRes = await axios.get(`${API_URL}/conflicts`);
      setConflicts(conflictRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#090d16";
    document.body.style.fontFamily = "'Inter', sans-serif";
    fetchRosterData();
  }, []);

  const handleGenerateRoster = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/roster/generate?year=2026&month=10`);
      alert("Monthly roster generated successfully.");
      fetchRosterData();
      setActiveTab("matrix");
    } catch (error) {
      alert("Failed to generate roster");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate) return alert("Please select a valid date.");
    try {
      await axios.post(`${API_URL}/leaves`, { employee_id: parseInt(leaveEmpId), leave_date: leaveDate });
      alert(`Leave recorded! Schedule dynamically validated.`);
      fetchRosterData();
      setActiveTab("conflicts");
    } catch (error) {
      alert("Error recording leave.");
    }
  };

  const handleEditShift = async (e) => {
    e.preventDefault();
    if (!editDate) return alert("Please select a valid date.");
    try {
      await axios.put(`${API_URL}/roster/edit`, { 
        employee_id: parseInt(editEmpId), 
        shift_date: editDate, 
        new_brand_id: parseInt(editBrandId) 
      });
      alert(`Shift successfully reassigned. Conflict cleared.`);
      fetchRosterData();
      setActiveTab("matrix");
    } catch (error) {
      alert("Error editing shift. Ensure the shift exists on this date.");
    }
  };

  const uniqueDates = [...new Set(roster.map(entry => entry.date))].sort();
  const allAgents = Array.from({length: 30}, (_, i) => i + 1);

  // Dynamic Filtering Logic (Company, Pod, Brand, Process Views)
  const filteredRoster = roster.filter(entry => {
    const brandMatch = selectedBrand === "all" || entry.brand_id.toString() === selectedBrand;
    // Simulated DB mapping for Pods (1-10: Alpha Pod, 11-20: Beta Pod, 21-30: Gamma Pod)
    const empPod = entry.employee_id <= 10 ? "1" : (entry.employee_id <= 20 ? "2" : "3");
    const podMatch = selectedPod === "all" || empPod === selectedPod;
    // Simulated DB mapping for Processes (Evens = Voice, Odds = Chat)
    const empProcess = entry.employee_id % 2 === 0 ? "voice" : "chat";
    const processMatch = selectedProcess === "all" || empProcess === selectedProcess;
    
    return brandMatch && podMatch && processMatch;
  });

  // Extract unique employees from the *filtered* data to dynamically hide empty rows
  const uniqueEmployees = [...new Set(filteredRoster.map(entry => entry.employee_id))].sort((a, b) => a - b);
  const brandTextMap = { "1": "Alpha Corp", "2": "Beta Retail", "3": "Gamma Tech" };

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#090d16", color: "#f8fafc", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      
      {/* Top Header */}
      <header style={{ backgroundColor: "#0e1626", borderBottom: "1px solid #1e293b", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0, color: "#ffffff", letterSpacing: "-0.01em" }}>Datastraw Roster Intelligence</h1>
        
        {/* Global Multi-View Filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select value={selectedPod} onChange={(e) => setSelectedPod(e.target.value)} style={{ backgroundColor: "#111827", color: "#cbd5e1", border: "1px solid #334155", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
            <option value="all">Company View (All Pods)</option>
            <option value="1">Pod 1 (Agents 1-10)</option>
            <option value="2">Pod 2 (Agents 11-20)</option>
            <option value="3">Pod 3 (Agents 21-30)</option>
          </select>
          
          <select value={selectedProcess} onChange={(e) => setSelectedProcess(e.target.value)} style={{ backgroundColor: "#111827", color: "#cbd5e1", border: "1px solid #334155", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
            <option value="all">All Processes</option>
            <option value="voice">Voice Support</option>
            <option value="chat">Live Chat</option>
          </select>

          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} style={{ backgroundColor: "#111827", color: "#cbd5e1", border: "1px solid #334155", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
            <option value="all">All Brands</option>
            <option value="1">Alpha Corp</option>
            <option value="2">Beta Retail</option>
            <option value="3">Gamma Tech</option>
          </select>

          <button onClick={handleGenerateRoster} disabled={loading} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}>
            {loading ? "Processing..." : "Generate Roster"}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ padding: "24px 32px", width: "100%", boxSizing: "border-box", flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px", width: "100%" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setActiveTab("matrix")} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", backgroundColor: activeTab === "matrix" ? "#2563eb" : "#111827", color: activeTab === "matrix" ? "white" : "#94a3b8" }}>
              Schedule Matrix ({uniqueEmployees.length} Agents)
            </button>
            <button onClick={() => setActiveTab("conflicts")} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", backgroundColor: activeTab === "conflicts" ? "#dc2626" : "#111827", color: activeTab === "conflicts" ? "white" : "#94a3b8" }}>
              <span>Conflicts</span>
              <span style={{ backgroundColor: activeTab === "conflicts" ? "rgba(255,255,255,0.2)" : "#dc2626", color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{conflicts.length}</span>
            </button>
            <button onClick={() => setActiveTab("manage")} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", backgroundColor: activeTab === "manage" ? "#10b981" : "#111827", color: activeTab === "manage" ? "white" : "#94a3b8" }}>
              ⚙️ Manage Operations
            </button>
          </div>

          <div style={{ display: "flex", gap: "20px", fontSize: "0.85rem", color: "#94a3b8", backgroundColor: "#111827", padding: "8px 20px", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <span>Displayed Entries: <strong style={{ color: "#60a5fa" }}>{filteredRoster.length}</strong></span>
            <span>•</span>
            <span>System Status: <strong style={{ color: conflicts.length > 0 ? "#f87171" : "#4ade80" }}>{conflicts.length > 0 ? `${conflicts.length} Conflicts` : "Optimized"}</strong></span>
          </div>
        </div>

        {/* Content Area - Matrix */}
        {activeTab === "matrix" && (
          <div style={{ backgroundColor: "#111827", borderRadius: "12px", border: "1px solid #1f2937", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)", width: "100%", overflow: "hidden", boxSizing: "border-box", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 20px", backgroundColor: "#161e2e", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "#f1f5f9" }}>Dynamic Working Schedule</span>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Scroll horizontally to view full month</span>
            </div>
            <div style={{ overflowX: "auto", width: "100%", maxHeight: "650px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#161e2e", borderBottom: "2px solid #1f2937", color: "#94a3b8" }}>
                    <th style={{ padding: "12px 16px", position: "sticky", left: 0, backgroundColor: "#161e2e", zIndex: 2, textAlign: "left", minWidth: "130px", borderRight: "1px solid #1f2937" }}>Employee</th>
                    {uniqueDates.map(date => <th key={date} style={{ padding: "12px 8px", minWidth: "90px", fontWeight: "600" }}>{formatDate(date)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {uniqueEmployees.map(empId => {
                    return (
                      <tr key={empId} style={{ borderBottom: "1px solid #1f2937" }}>
                        <td style={{ padding: "10px 16px", position: "sticky", left: 0, backgroundColor: "#111827", zIndex: 1, textAlign: "left", fontWeight: "600", color: "#f8fafc", borderRight: "1px solid #1f2937" }}>Agent {empId}</td>
                        {uniqueDates.map(date => {
                          const entry = filteredRoster.find(r => r.employee_id === empId && r.date === date);
                          const isConflict = entry && entry.is_conflict;
                          const cellStatus = entry ? (isConflict ? "Leave Conflict" : brandTextMap[entry.brand_id].split(" ")[0]) : "Off";

                          return (
                            <td key={date} style={{ padding: "6px 4px", cursor: "default" }} onMouseMove={(e) => setTooltip({ visible: true, empId, date: formatDate(date), x: e.clientX, y: e.clientY, status: cellStatus, isConflict })} onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}>
                              {entry ? (
                                <div style={{ backgroundColor: isConflict ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: isConflict ? "#f87171" : "#34d399", padding: "6px 4px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", border: `1px solid ${isConflict ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}` }}>
                                  {cellStatus}
                                </div>
                              ) : <span style={{ color: "#374155" }}>-</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Area - Conflicts */}
        {activeTab === "conflicts" && (
          <div style={{ backgroundColor: "#111827", borderRadius: "12px", border: "1px solid #1f2937", padding: "24px", width: "100%", boxSizing: "border-box" }}>
            <h3 style={{ marginTop: 0, color: "#f87171", fontSize: "1rem", fontWeight: "700" }}>Active Shift Conflicts</h3>
            {conflicts.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#34d399", fontWeight: "600", fontSize: "0.85rem" }}>No active conflicts detected. All schedules respect leave constraints.</div>
            ) : (
              <div style={{ overflowX: "auto", width: "100%", marginTop: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#161e2e", borderBottom: "2px solid #1f2937", color: "#94a3b8" }}>
                      <th style={{ padding: "12px" }}>Conflict ID</th><th style={{ padding: "12px" }}>Date</th><th style={{ padding: "12px" }}>Employee</th><th style={{ padding: "12px" }}>Brand</th><th style={{ padding: "12px" }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conflicts.map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #1f2937" }}>
                        <td style={{ padding: "14px", color: "#94a3b8" }}>#{c.id}</td><td style={{ padding: "14px", fontWeight: "600", color: "#f8fafc" }}>{formatDate(c.date)}</td><td style={{ padding: "14px", fontWeight: "600", color: "#f8fafc" }}>Agent {c.employee_id}</td><td style={{ padding: "14px", color: "#cbd5e1" }}>{brandTextMap[c.brand_id]}</td><td style={{ padding: "14px", color: "#f87171", fontWeight: "600" }}>Assigned shift during approved leave.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Content Area - Manage Operations */}
        {activeTab === "manage" && (
          <div style={{ backgroundColor: "#111827", borderRadius: "12px", border: "1px solid #1f2937", padding: "32px", width: "100%", boxSizing: "border-box" }}>
            <h3 style={{ marginTop: 0, color: "#f8fafc", fontSize: "1.15rem", fontWeight: "700" }}>Manage Assignments & Operations</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "32px", maxWidth: "800px" }}>
              Use this panel to simulate operational changes. Adding leave triggers conflict validation. Reassigning a shift allows you to resolve active conflicts by moving an agent to a different brand or process.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
              
              {/* Form 1: Log Leave */}
              <div style={{ backgroundColor: "#161e2e", padding: "24px", borderRadius: "10px", border: "1px solid #1f2937" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#10b981", fontSize: "1rem" }}>1. Log Approved Leave</h4>
                <form onSubmit={handleAddLeave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>Select Employee</label>
                    <select value={leaveEmpId} onChange={e => setLeaveEmpId(e.target.value)} style={{ width: "100%", backgroundColor: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "10px", borderRadius: "6px", outline: "none" }}>
                      {allAgents.map(id => <option key={id} value={id}>Agent {id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>Leave Date</label>
                    <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} style={{ width: "100%", backgroundColor: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "10px", borderRadius: "6px", outline: "none", colorScheme: "dark", boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", marginTop: "10px" }}>
                    Submit & Validate
                  </button>
                </form>
              </div>

              {/* Form 2: Reassign Shift */}
              <div style={{ backgroundColor: "#161e2e", padding: "24px", borderRadius: "10px", border: "1px solid #1f2937" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#3b82f6", fontSize: "1rem" }}>2. Reassign Shift (Resolve Conflict)</h4>
                <form onSubmit={handleEditShift} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>Employee</label>
                      <select value={editEmpId} onChange={e => setEditEmpId(e.target.value)} style={{ width: "100%", backgroundColor: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "10px", borderRadius: "6px", outline: "none" }}>
                        {allAgents.map(id => <option key={id} value={id}>Agent {id}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>Date</label>
                      <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ width: "100%", backgroundColor: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "10px", borderRadius: "6px", outline: "none", colorScheme: "dark", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>New Assignment</label>
                    <select value={editBrandId} onChange={e => setEditBrandId(e.target.value)} style={{ width: "100%", backgroundColor: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "10px", borderRadius: "6px", outline: "none" }}>
                      <option value="1">Alpha Corp</option>
                      <option value="2">Beta Retail</option>
                      <option value="3">Gamma Tech</option>
                    </select>
                  </div>
                  <button type="submit" style={{ backgroundColor: "#3b82f6", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", marginTop: "10px" }}>
                    Update Shift Assignment
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Global Floating Tooltip */}
      {tooltip.visible && (
        <div style={{ position: "fixed", top: tooltip.y + 15, left: tooltip.x + 15, backgroundColor: "#1e293b", padding: "10px 14px", borderRadius: "8px", border: "1px solid #334155", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)", zIndex: 9999, pointerEvents: "none", color: "#f8fafc", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ color: "#94a3b8", fontWeight: "600" }}>{tooltip.date}</span>
          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>
            Agent {tooltip.empId} <span style={{ color: "#475569", margin: "0 6px" }}>|</span> 
            <span style={{ color: tooltip.status === "Off" ? "#94a3b8" : (tooltip.isConflict ? "#f87171" : "#34d399") }}>{tooltip.status}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default App;