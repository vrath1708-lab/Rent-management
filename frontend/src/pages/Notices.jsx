import { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function Notices() {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    visibleTo: "all",
    publishDate: new Date().toISOString().split('T')[0],
    expireDate: ""
  });

  useEffect(() => {
    load();
    // Refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    try {
      setError(null);
      const res = await api.get("/notices");
      setNotices(res.data || []);
    } catch (err) {
      console.error("Error loading notices:", err);
      setError("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      setError("Title and body are required");
      return;
    }

    try {
      setError(null);
      const res = await api.post("/notices", formData);
      setNotices([res.data, ...notices]);
      setFormData({
        title: "",
        body: "",
        visibleTo: "all",
        publishDate: new Date().toISOString().split('T')[0],
        expireDate: ""
      });
      setShowForm(false);
      alert("Notice published successfully!");
    } catch (err) {
      console.error("Error creating notice:", err);
      setError(err.response?.data?.message || "Failed to create notice");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
      alert("Notice deleted successfully");
    } catch (err) {
      console.error("Error deleting notice:", err);
      setError(err.response?.data?.message || "Failed to delete notice");
    }
  };

  if (loading) return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h2>Notices</h2>
        <div className="loading">Loading notices...</div>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <div className="page-header" style={{ marginBottom: "30px" }}>
          <h1>📢 Notices</h1>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "10px 20px",
                background: showForm ? "#e74c3c" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              {showForm ? "Cancel" : "+ New Notice"}
            </button>
          )}
        </div>

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

        {/* Create Notice Form - Admin Only */}
        {user?.role === "admin" && showForm && (
          <div className="card" style={{ marginBottom: "30px", background: "#f0f4ff", border: "2px solid #667eea" }}>
            <h2>Create New Notice</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g., Maintenance work on 5th floor"
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Description</label>
                <textarea
                  placeholder="Enter the full notice content..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows="6"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Visible To</label>
                  <select
                    value={formData.visibleTo}
                    onChange={(e) => setFormData({ ...formData, visibleTo: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "1em"
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="tenants">Tenants Only</option>
                    <option value="admin">Admin Only</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Publish Date</label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "1em"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Expire Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expireDate}
                    onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "1em"
                    }}
                  />
                </div>
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
                Publish Notice
              </button>
            </form>
          </div>
        )}

        {/* Notices List */}
        {notices.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#666", fontSize: "1.1em" }}>📭 No notices yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {notices.map(n => (
              <div className="card" key={n._id} style={{
                borderTop: "4px solid #667eea",
                position: "relative"
              }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#667eea" }}>{n.title}</h3>
                <p style={{ color: "#666", margin: "8px 0", fontSize: "0.95em", lineHeight: "1.5" }}>{n.body}</p>
                
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e0e4e8" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "0.85em", color: "#888" }}>
                    📅 Published: {new Date(n.publishDate).toLocaleDateString()}
                  </p>
                  {n.expireDate && (
                    <p style={{ margin: "0 0 5px 0", fontSize: "0.85em", color: "#888" }}>
                      ⏰ Expires: {new Date(n.expireDate).toLocaleDateString()}
                    </p>
                  )}
                  <p style={{ margin: "0", fontSize: "0.85em", color: "#888" }}>
                    👥 Visible to: <span style={{ textTransform: "capitalize" }}>{n.visibleTo}</span>
                  </p>
                </div>

                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(n._id)}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "8px",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9em",
                      fontWeight: "600"
                    }}
                  >
                    Delete Notice
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
