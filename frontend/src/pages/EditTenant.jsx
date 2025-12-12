import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { TenantContext } from "../context/TenantContext";
import api from "../utils/api";

export default function EditTenant() {
  const { id } = useParams();
  const { updateTenant } = useContext(TenantContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    roomNumber: "",
    rentAmount: "",
    leaseStart: "",
    leaseEnd: "",
    securityDeposit: "",
    notes: ""
  });

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      const res = await api.get(`/tenants/${id}`);
      setForm(res.data);
    } catch (error) {
      console.error("Error loading tenant:", error);
      alert("Failed to load tenant");
    }
  };

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await updateTenant(id, form);
      alert("Tenant updated!");
      window.location.href = "/tenants";
    } catch (error) {
      console.error(error);
      alert("Failed to update tenant");
    }
  };

  return (
    <div className="page-shell">
      <Sidebar />

      <div className="page-content container">
        <h2>Edit Tenant</h2>

        <div className="card">
          <form onSubmit={submit}>
            <input name="name" value={form.name} onChange={change} placeholder="Name" required />
            <input name="email" value={form.email} onChange={change} placeholder="Email" />
            <input name="phone" value={form.phone} onChange={change} placeholder="Phone" />

            <input name="roomNumber" value={form.roomNumber} onChange={change} placeholder="Room Number" required />
            <input name="rentAmount" value={form.rentAmount} onChange={change} placeholder="Rent Amount" type="number" required />

            <input name="leaseStart" type="date"
              value={form.leaseStart ? form.leaseStart.slice(0, 10) : ""}
              onChange={change}
            />

            <input name="leaseEnd" type="date"
              value={form.leaseEnd ? form.leaseEnd.slice(0, 10) : ""}
              onChange={change}
            />

            <input name="securityDeposit" value={form.securityDeposit} onChange={change} placeholder="Security Deposit" type="number" />
            <input name="notes" value={form.notes} onChange={change} placeholder="Notes" />

            <button type="submit">Update Tenant</button>
          </form>
        </div>
      </div>
    </div>
  );
}
