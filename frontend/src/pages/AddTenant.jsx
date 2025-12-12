import { useState, useContext } from "react";
import { TenantContext } from "../context/TenantContext";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

export default function AddTenant() {
  const { addTenant } = useContext(TenantContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roomNumber: "",
    rentAmount: "",
    leaseStart: "",
    leaseEnd: "",
    securityDeposit: "",
    notes: ""
  });

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      // First create a user account for the tenant
      const userRes = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "tenant"
      });

      // Then create tenant record with userId
      await addTenant({
        userId: userRes.data._id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        roomNumber: form.roomNumber,
        rentAmount: form.rentAmount,
        leaseStart: form.leaseStart,
        leaseEnd: form.leaseEnd,
        securityDeposit: form.securityDeposit,
        notes: form.notes
      });

      alert("Tenant added successfully!");
      window.location.href = "/tenants";
    } catch (err) {
      alert(err.response?.data?.message || "Error adding tenant");
      console.error(err);
    }
  };

  return (
    <div className="page-shell">
      <Sidebar />

      <div className="page-content container">
        <h2>Add Tenant</h2>

        <div className="card">
          <form onSubmit={submit}>
            <input name="name" placeholder="Name" value={form.name} onChange={change} required />
            <input name="email" placeholder="Email" type="email" value={form.email} onChange={change} required />
            <input name="password" placeholder="Password (for tenant login)" type="password" value={form.password} onChange={change} required />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={change} />
            <input name="roomNumber" placeholder="Room Number" value={form.roomNumber} onChange={change} required />
            <input name="rentAmount" placeholder="Rent Amount" type="number" value={form.rentAmount} onChange={change} required />
            <input name="leaseStart" type="date" value={form.leaseStart} onChange={change} />
            <input name="leaseEnd" type="date" value={form.leaseEnd} onChange={change} />
            <input name="securityDeposit" placeholder="Security Deposit" type="number" value={form.securityDeposit} onChange={change} />
            <input name="notes" placeholder="Notes" value={form.notes} onChange={change} />

            <button type="submit">Add Tenant</button>
          </form>
        </div>
      </div>
    </div>
  );
}
