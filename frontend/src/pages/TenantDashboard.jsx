import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TenantDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [tenantRes, rentsRes] = await Promise.all([
        api.get("/tenants/me"),
        api.get("/rents")
      ]);
      
      setTenant(tenantRes.data);
      const tenantRents = rentsRes.data.filter(r => r.tenant._id === tenantRes.data._id);
      setRents(tenantRents.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)));
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!tenant) return <div className="text-danger text-center mt-30">Tenant data not found</div>;

  const pendingRents = rents.filter(r => r.status !== "paid");
  const totalDue = pendingRents.reduce((sum, r) => sum + r.amount + (r.lateFee || 0), 0);
  const isLeaseActive = tenant.leaseEnd ? new Date(tenant.leaseEnd) > new Date() : false;

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "30px",
      background: "#f5f7fa",
      minHeight: "100vh"
    }}>
      {/* Header with Logout */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px",
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2em" }}>Welcome, {tenant.name}! 👋</h1>
          <p style={{ color: "#666", margin: "5px 0 0 0" }}>{tenant.email}</p>
        </div>
        <button 
          onClick={logout}
          style={{
            padding: "10px 20px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid">
        <div className="stat-card">
          <h3>Total Due</h3>
          <div className="value">₹{totalDue.toLocaleString()}</div>
          <p style={{ marginTop: "10px", opacity: 0.9 }}>{pendingRents.length} pending</p>
        </div>

        <div className="stat-card">
          <h3>Lease Status</h3>
          <div className="value" style={{ fontSize: "1.8em" }}>
            {isLeaseActive ? "✅ Active" : tenant.leaseStart ? "⏳ Starting" : "📋 Pending"}
          </div>
          <p style={{ marginTop: "10px", opacity: 0.9 }}>
            {tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString() : "Not set"}
          </p>
        </div>

        <div className="stat-card">
          <h3>Room Number</h3>
          <div className="value" style={{ fontSize: "2em" }}>
            {tenant.roomNumber || "Not assigned"}
          </div>
          <p style={{ marginTop: "10px", opacity: 0.9 }}>Monthly: ₹{tenant.rentAmount || 0}</p>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingRents.length > 0 && (
        <div style={{
          background: "#fff3cd",
          border: "2px solid #f39c12",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px"
        }}>
          <h3 style={{ color: "#856404", margin: "0 0 10px 0" }}>⚠️ Pending Payments</h3>
          <p style={{ color: "#856404", margin: "0 0 15px 0" }}>
            You have {pendingRents.length} pending rent payment(s) totaling ₹{totalDue.toLocaleString()}
          </p>
          <button
            onClick={() => navigate("/tenant-rent-payments")}
            style={{
              background: "#f39c12",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1em"
            }}
          >
            Pay Now →
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid">
        {/* Personal Details Card */}
        <div className="card">
          <h2>👤 Personal Details</h2>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Email</p>
            <p style={{ margin: "0", fontWeight: "600", fontSize: "1.05em" }}>{tenant.email}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Phone</p>
            <p style={{ margin: "0", fontWeight: "600", fontSize: "1.05em" }}>{tenant.phone || "Not provided"}</p>
          </div>
          {tenant.notes && (
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e0e4e8" }}>
              <p style={{ margin: "0 0 8px 0", color: "#666" }}>Notes</p>
              <p style={{ margin: "0", fontWeight: "500" }}>{tenant.notes}</p>
            </div>
          )}
        </div>

        {/* Room & Lease Card */}
        <div className="card">
          <h2>🏠 Room & Lease Info</h2>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Room Number</p>
            <p style={{ margin: "0", fontWeight: "600", fontSize: "1.05em" }}>{tenant.roomNumber || "Not assigned"}</p>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Lease Start</p>
            <p style={{ margin: "0", fontWeight: "600", fontSize: "1.05em" }}>{tenant.leaseStart ? new Date(tenant.leaseStart).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Lease End</p>
            <p style={{ margin: "0", fontWeight: "600", fontSize: "1.05em" }}>{tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString() : "-"}</p>
          </div>
        </div>

        {/* Rent Card */}
        <div className="card">
          <h2>💰 Rent Details</h2>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Monthly Rent</p>
            <p style={{ margin: "0", fontWeight: "600", fontSize: "1.3em", color: "#667eea" }}>₹{tenant.rentAmount}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Security Deposit</p>
            <p style={{ margin: "0", fontWeight: "600", fontSize: "1.3em", color: "#667eea" }}>₹{tenant.securityDeposit}</p>
          </div>
        </div>

        {/* Lease Status Card */}
        <div className="card">
          <h2>📋 Lease Status</h2>
          {isLeaseActive ? (
            <div style={{ padding: "15px", background: "#d4edda", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "1.5em", color: "#155724", fontWeight: "700" }}>✅ ACTIVE</p>
              <p style={{ margin: "8px 0 0 0", color: "#155724" }}>
                Until {new Date(tenant.leaseEnd).toLocaleDateString()}
              </p>
            </div>
          ) : tenant.leaseStart ? (
            <div style={{ padding: "15px", background: "#e2e3e5", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "1.5em", color: "#383d41", fontWeight: "700" }}>⏳ STARTING SOON</p>
              <p style={{ margin: "8px 0 0 0", color: "#383d41" }}>
                From {new Date(tenant.leaseStart).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div style={{ padding: "15px", background: "#cfe2ff", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "1.5em", color: "#084298", fontWeight: "700" }}>📋 PENDING</p>
              <p style={{ margin: "8px 0 0 0", color: "#084298" }}>Waiting for admin to set lease dates</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      {rents.length > 0 && (
        <div className="card">
          <h2>📊 Recent Rent Activity</h2>
          
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Paid On</th>
                </tr>
              </thead>
              <tbody>
                {rents.slice(0, 6).map(rent => (
                  <tr key={rent._id}>
                    <td style={{ fontWeight: "600" }}>{rent.month}</td>
                    <td>₹{rent.amount}</td>
                    <td>{new Date(rent.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${rent.status}`}>
                        {rent.status === "paid" ? "✅ PAID" : rent.status === "late" ? "🔴 LATE" : "⏱️ PENDING"}
                      </span>
                    </td>
                    <td>{rent.paidOn ? new Date(rent.paidOn).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rents.length > 6 && (
            <button
              onClick={() => navigate("/tenant-rent-payments")}
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "12px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              View All Payments →
            </button>
          )}
        </div>
      )}

      {/* Complaints Section */}
      <div className="card">
        <h2>⚠️ File a Complaint</h2>
        <p style={{ color: "#666", marginBottom: "15px" }}>
          Have a maintenance issue or concern? File a complaint with the admin.
        </p>
        <button
          onClick={() => navigate("/tenant-complaints")}
          style={{
            padding: "12px 24px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Go to Complaints →
        </button>
      </div>
    </div>
  );
}
