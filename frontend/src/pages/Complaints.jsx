import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

export default function Complaints() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
    // Refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    try {
      setError(null);
      const res = await api.get("/complaints");
      setList(res.data || []);
    } catch (err) {
      console.error("Error loading complaints:", err);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      setError(null);
      const res = await api.put(`/complaints/${id}/resolve`);
      // Update the complaint in list
      setList(list.map(c => c._id === id ? res.data.complaint : c));
      alert("Complaint marked as fixed!");
    } catch (err) {
      console.error("Error resolving complaint:", err);
      setError(err.response?.data?.message || "Failed to mark as resolved");
    }
  };

  if (loading) return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h2>Complaints</h2>
        <div className="loading">Loading complaints...</div>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h2>⚠️ Complaints</h2>
        
        {error && (
          <div style={{
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {list.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#666", fontSize: "1.1em" }}>✅ No complaints yet</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {list.map(c => (
              <div className="card" key={c._id} style={{
                borderLeft: c.status === "resolved" ? "4px solid #27ae60" : c.status === "pending" ? "4px solid #f39c12" : "4px solid #e74c3c"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                  <h4 style={{ margin: "0", flex: 1 }}>{c.title}</h4>
                  <span className={`badge badge-${c.status}`} style={{ whiteSpace: "nowrap" }}>
                    {c.status === "pending" ? "⏳ Pending" : c.status === "in-progress" ? "🔧 In Progress" : "✅ Resolved"}
                  </span>
                </div>
                <p style={{ color: "#666", margin: "8px 0", fontSize: "0.95em" }}>{c.description}</p>
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e0e4e8" }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.9em", color: "#666" }}>Tenant: <strong>{c.tenant?.name || "Unknown"}</strong></p>
                  <p style={{ margin: "0", fontSize: "0.9em", color: "#666" }}>Room: <strong>{c.tenant?.roomNumber || "N/A"}</strong></p>
                </div>

                {/* Mark as Resolved Button */}
                {c.status !== "resolved" && (
                  <button
                    onClick={() => handleMarkResolved(c._id)}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "8px",
                      background: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9em",
                      fontWeight: "600"
                    }}
                  >
                    ✅ Mark as Fixed
                  </button>
                )}
                {c.status === "resolved" && (
                  <div style={{
                    marginTop: "12px",
                    padding: "8px",
                    background: "#d4edda",
                    color: "#155724",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "0.9em"
                  }}>
                    ✅ Marked as Fixed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
