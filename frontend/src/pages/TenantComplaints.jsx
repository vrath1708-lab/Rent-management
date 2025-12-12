import { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function TenantComplaints() {
  const { logout } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });

  useEffect(() => {
    loadComplaints();
    // Refresh every 30 seconds
    const interval = setInterval(loadComplaints, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadComplaints = async () => {
    try {
      setError(null);
      const res = await api.get("/complaints/my/complaints");
      setComplaints(res.data || []);
    } catch (err) {
      console.error("Error loading complaints:", err);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const res = await api.post("/complaints", {
        title: formData.title,
        description: formData.description
      });
      setComplaints([res.data, ...complaints]);
      setFormData({ title: "", description: "" });
      setSuccess("Complaint submitted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error submitting complaint:", err);
      setError(err.response?.data?.message || "Failed to submit complaint");
    }
  };

  if (loading) return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h2>My Complaints</h2>
        <div className="loading">Loading complaints...</div>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h1 style={{ marginBottom: "30px" }}>📝 My Complaints</h1>

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

        {success && (
          <div style={{
            background: "#d4edda",
            border: "2px solid #c3e6cb",
            color: "#155724",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            ✅ {success}
          </div>
        )}

        {/* File Complaint Card */}
        <div className="card" style={{ marginBottom: "30px" }}>
          <h2>⚠️ File a New Complaint</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: "15px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Leaky tap in bathroom"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "1em",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Description
              </label>
              <textarea
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="5"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "1em",
                  boxSizing: "border-box",
                  fontFamily: "Arial, sans-serif"
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1em"
              }}
            >
              Submit Complaint
            </button>
          </form>
        </div>

        {/* Complaints List */}
        <div>
          <h2 style={{ marginBottom: "20px" }}>📋 Your Complaints</h2>
          {complaints.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#666", fontSize: "1.1em" }}>✅ No complaints filed yet</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px"
            }}>
              {complaints.map(c => (
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
                    <p style={{ margin: "0", fontSize: "0.85em", color: "#888" }}>
                      Filed on: {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
