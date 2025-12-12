import { useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function TenantRentPayment() {
  const { logout } = useContext(AuthContext);
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    month: new Date().toISOString().slice(0, 7),
    method: "online",
    notes: ""
  });

  useEffect(() => {
    loadRents();
  }, []);

  const loadRents = async () => {
    try {
      // First get tenant info to get tenant ID
      const tenantRes = await api.get("/tenants/me");
      // Then get all rents and filter by tenant ID
      const rentsRes = await api.get("/rents");
      const tenantRents = rentsRes.data.filter(r => r.tenant._id === tenantRes.data._id);
      setRents(tenantRents.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)));
    } catch (error) {
      console.error("Error loading rents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (rentId) => {
    const method = paymentForm[rentId] || "online";
    
    if (!method) {
      alert("Please select a payment method");
      return;
    }

    setProcessingId(rentId);
    try {
      const response = await api.put(`/rents/${rentId}/pay`, { method });
      console.log("Payment response:", response.data);
      alert("Payment recorded successfully!");
      setPaymentForm({ ...paymentForm, [rentId]: "" });
      loadRents();
    } catch (error) {
      console.error("Payment error:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      alert("Error processing payment: " + errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const addPayment = async (e) => {
    e.preventDefault();
    if (!newPayment.amount) {
      alert("Please enter amount");
      return;
    }
    setProcessingId("new");
    try {
      await api.post("/rents/self", {
        amount: Number(newPayment.amount),
        month: newPayment.month,
        method: newPayment.method,
        notes: newPayment.notes
      });
      alert("Payment added successfully");
      setNewPayment({
        amount: "",
        month: new Date().toISOString().slice(0, 7),
        method: "online",
        notes: ""
      });
      loadRents();
    } catch (error) {
      console.error("Add payment error:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message;
      alert("Error adding payment: " + errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="loading">Loading rent details...</div>;

  const pendingRents = rents.filter(r => r.status !== "paid");
  const paidRents = rents.filter(r => r.status === "paid");
  const totalDue = pendingRents.reduce((sum, r) => sum + r.amount + (r.lateFee || 0), 0);

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
        <h1 style={{ margin: 0 }}>💰 Rent Payments</h1>
        <button 
          onClick={logout}
          style={{
            padding: "10px 20px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95em"
          }}
        >
          Logout
        </button>
      </div>

      {/* Add Payment Manually */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h2>➕ Add Monthly Payment</h2>
        <form onSubmit={addPayment} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            required
          />
          <input
            type="month"
            name="month"
            value={newPayment.month}
            onChange={(e) => setNewPayment({ ...newPayment, month: e.target.value })}
            required
          />
          <select
            name="method"
            value={newPayment.method}
            onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
          >
            <option value="online">💳 Online</option>
            <option value="bank">🏦 Bank Transfer</option>
            <option value="cash">💵 Cash</option>
            <option value="cheque">📄 Cheque</option>
          </select>
          <input
            name="notes"
            placeholder="Notes (optional)"
            value={newPayment.notes}
            onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
          />
          <button type="submit" disabled={processingId === "new"} style={{ padding: "10px", fontWeight: 700 }}>
            {processingId === "new" ? "Saving..." : "Add Payment"}
          </button>
        </form>
        <p style={{ marginTop: "8px", color: "#666" }}>This creates a paid entry for the selected month and shows in your history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid" style={{ marginBottom: "30px" }}>
        <div className="stat-card">
          <h3>Total Due</h3>
          <div className="value">₹{totalDue.toLocaleString()}</div>
          <p style={{ marginTop: "10px", opacity: 0.9 }}>Including late fees</p>
        </div>

        <div className="stat-card">
          <h3>Pending Payments</h3>
          <div className="value">{pendingRents.length}</div>
          <p style={{ marginTop: "10px", opacity: 0.9 }}>Awaiting payment</p>
        </div>

        <div className="stat-card">
          <h3>Paid Rents</h3>
          <div className="value">{paidRents.length}</div>
          <p style={{ marginTop: "10px", opacity: 0.9 }}>Completed payments</p>
        </div>
      </div>

      {/* Pending Rents */}
      {pendingRents.length > 0 && (
        <div className="card">
          <h2>⏳ Pending Payments</h2>
          
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Late Fee</th>
                  <th>Total Due</th>
                  <th>Payment Method</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRents.map(rent => (
                  <tr key={rent._id} style={{ background: rent.status === "late" ? "#fff5f5" : "white" }}>
                    <td style={{ fontWeight: "600" }}>{rent.month}</td>
                    <td>₹{rent.amount}</td>
                    <td>{new Date(rent.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${rent.status}`}>
                        {rent.status === "late" ? "🔴 LATE" : "⏱️ PENDING"}
                      </span>
                    </td>
                    <td style={{ color: rent.lateFee > 0 ? "#e74c3c" : "#27ae60" }}>
                      ₹{rent.lateFee || 0}
                    </td>
                    <td style={{ fontWeight: "600", color: "#e74c3c" }}>
                      ₹{rent.amount + (rent.lateFee || 0)}
                    </td>
                    <td>
                      <select
                        value={paymentForm[rent._id] || ""}
                        onChange={(e) => setPaymentForm({ ...paymentForm, [rent._id]: e.target.value })}
                        style={{ width: "100%" }}
                      >
                        <option value="">Select method...</option>
                        <option value="online">💳 Online</option>
                        <option value="bank">🏦 Bank Transfer</option>
                        <option value="cash">💵 Cash</option>
                        <option value="cheque">📄 Cheque</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handlePayment(rent._id)}
                        disabled={processingId === rent._id}
                        style={{
                          padding: "8px 16px",
                          background: processingId === rent._id ? "#ccc" : "#27ae60",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: processingId === rent._id ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "0.85em"
                        }}
                      >
                        {processingId === rent._id ? "Processing..." : "Pay Now"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paid Rents */}
      {paidRents.length > 0 && (
        <div className="card">
          <h2>✅ Payment History</h2>
          
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Paid On</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidRents.map(rent => (
                  <tr key={rent._id} style={{ background: "#f0f9ff" }}>
                    <td style={{ fontWeight: "600" }}>{rent.month}</td>
                    <td>₹{rent.amount}</td>
                    <td>{rent.paidOn ? new Date(rent.paidOn).toLocaleDateString() : "-"}</td>
                    <td>
                      <span style={{
                        background: "#d4edda",
                        color: "#155724",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85em",
                        fontWeight: "600",
                        textTransform: "capitalize"
                      }}>
                        {rent.method}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: "#27ae60",
                        fontWeight: "600"
                      }}>
                        ✅ PAID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rents.length === 0 && (
        <div className="card text-center">
          <h3>No rent records found</h3>
          <p style={{ color: "#666", marginTop: "10px" }}>Contact admin to set up your rental agreement</p>
        </div>
      )}
    </div>
  );
}
