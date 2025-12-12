import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

export default function RentPayments() {
  const [rents, setRents] = useState([]);
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
      const res = await api.get("/rents");
      setRents(res.data);
    } catch (err) {
      console.error("Error loading rents:", err);
      setError("Failed to load rent payments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rent payment? This cannot be undone.")) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/rents/${id}`);
      setRents(rents.filter(r => r._id !== id));
      alert("Rent payment deleted successfully");
    } catch (err) {
      console.error("Error deleting rent:", err);
      setError(err.response?.data?.message || "Failed to delete rent payment");
    }
  };

  if (loading) return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h2>Rent Payments</h2>
        <div className="loading">Loading rent payments...</div>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h2>💰 Rent Payments</h2>

        {error && (
          <div style={{
            background: "#f8d7da",
            border: "2px solid #f5c6cb",
            color: "#721c24",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {rents.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#666", fontSize: "1.1em" }}>No rent payments yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fa", borderBottom: "2px solid #667eea" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Tenant</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Month</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Due Date</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Paid On</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rents.map(r => (
                  <tr key={r._id} style={{ borderBottom: "1px solid #e0e4e8", hover: { background: "#f9f9f9" } }}>
                    <td style={{ padding: "12px" }}>{r.tenant?.name}</td>
                    <td style={{ padding: "12px", fontWeight: "600", color: "#667eea" }}>₹{r.amount}</td>
                    <td style={{ padding: "12px" }}>{r.month}</td>
                    <td style={{ padding: "12px" }}>{new Date(r.dueDate).toLocaleDateString()}</td>
                    <td style={{ padding: "12px" }}>
                      <span className={`badge badge-${r.status}`}>
                        {r.status === "paid" ? "✅ PAID" : r.status === "late" ? "🔴 LATE" : "⏱️ PENDING"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {r.paidOn ? new Date(r.paidOn).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(r._id)}
                        style={{
                          padding: "6px 12px",
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.9em",
                          fontWeight: "600"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
