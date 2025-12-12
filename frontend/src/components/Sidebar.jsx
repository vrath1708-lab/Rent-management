import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Rent Management</div>

      <nav>
        <ul>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/tenants">Tenants</Link></li>
          <li><Link to="/add-tenant">Add Tenant</Link></li>
          <li><Link to="/rents">Rent Payments</Link></li>
          <li><Link to="/complaints">Complaints</Link></li>
          <li><Link to="/notices">Notices</Link></li>
        </ul>
      </nav>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
