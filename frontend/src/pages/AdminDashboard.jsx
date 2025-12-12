import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTenants: 0,
    pendingRents: 0,
    totalRentDue: 0,
    newTenants: [],
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tenantsRes, rentsRes] = await Promise.all([
        api.get("/tenants"),
        api.get("/rents")
      ]);

      const tenants = tenantsRes.data;
      const rents = rentsRes.data;

      // Get new tenants (not fully registered)
      const newTenants = tenants.filter(t => !t.isRegistered).slice(0, 5);

      // Get pending rents
      const pendingRents = rents.filter(r => r.status === "pending" || r.status === "late");
      const totalDue = pendingRents.reduce((sum, r) => sum + r.amount, 0);

      // Get recent payments
      const recentPayments = rents.filter(r => r.status === "paid").slice(0, 5);

      setStats({
        totalTenants: tenants.length,
        pendingRents: pendingRents.length,
        totalRentDue: totalDue,
        newTenants,
        recentPayments
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h1>Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid">
          <div className="stat-card">
            <h3>Total Tenants</h3>
            <div className="value">{stats.totalTenants}</div>
          </div>

          <div className="stat-card">
            <h3>Pending Rent Payments</h3>
            <div className="value">{stats.pendingRents}</div>
          </div>

          <div className="stat-card">
            <h3>Total Due</h3>
            <div className="value">₹{stats.totalRentDue.toLocaleString()}</div>
          </div>
        </div>

        {/* New Tenants Section */}
        {stats.newTenants.length > 0 && (
          <div className="card">
            <h2>🆕 New Tenant Registrations</h2>
            <p style={{ color: "#666", marginBottom: "15px" }}>Recently registered tenants - click to update details</p>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {stats.newTenants.map(tenant => (
                <div key={tenant._id} style={{
                  background: "#f0f4ff",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "2px solid #667eea",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => navigate(`/edit-tenant/${tenant._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, color: "#667eea" }}>{tenant.name}</h4>
                    <span className="badge badge-new">NEW</span>
                  </div>
                  <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#555" }}>
                    <strong>Email:</strong> {tenant.email}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#555" }}>
                    <strong>Room:</strong> {tenant.roomNumber || "Not assigned"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#555" }}>
                    <strong>Rent:</strong> ₹{tenant.rentAmount || "Not set"}
                  </p>
                  <button style={{ 
                    width: "100%", 
                    marginTop: "10px", 
                    padding: "8px",
                    fontSize: "0.9em"
                  }}>
                    Update Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Payments Section */}
        {stats.recentPayments.length > 0 && (
          <div className="card">
            <h2>✅ Recent Payments</h2>
            
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.tenant?.name}</td>
                    <td className="text-success">₹{payment.amount}</td>
                    <td><span className="badge badge-paid">{payment.method}</span></td>
                    <td>{new Date(payment.paidOn).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid" style={{ marginTop: "30px" }}>
          <div className="card text-center" style={{ cursor: "pointer" }} onClick={() => navigate("/tenants")}>
            <h3>👥 Manage Tenants</h3>
            <p style={{ color: "#666" }}>View, edit, or delete tenants</p>
          </div>

          <div className="card text-center" style={{ cursor: "pointer" }} onClick={() => navigate("/rents")}>
            <h3>💰 Rent Payments</h3>
            <p style={{ color: "#666" }}>Track all rent transactions</p>
          </div>

          <div className="card text-center" style={{ cursor: "pointer" }} onClick={() => navigate("/complaints")}>
            <h3>⚠️ Complaints</h3>
            <p style={{ color: "#666" }}>Handle tenant complaints</p>
          </div>
        </div>
      </div>
    </div>
  );
}
