import { useContext } from "react";
import { TenantContext } from "../context/TenantContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Tenants() {
  const { tenants, loading, deleteTenant } = useContext(TenantContext);
  const navigate = useNavigate();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete tenant ${name}?`)) {
      try {
        await deleteTenant(id);
        alert("Tenant deleted successfully");
      } catch (error) {
        alert("Error deleting tenant");
        console.error(error);
      }
    }
  };

  if (loading) return <h2>Loading tenants...</h2>;

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content container">
        <h2>Tenants</h2>

        <div className="card">
          <div className="table-responsive">
            <table border="1" width="100%" cellPadding="10">
            <thead>
              <tr>
                <th>Name</th>
                <th>Room</th>
                <th>Rent</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tenants.length === 0 && (
                <tr>
                  <td colSpan="6">No tenants found</td>
                </tr>
              )}

              {tenants.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.roomNumber}</td>
                  <td>{t.rentAmount}</td>
                  <td>{t.email}</td>
                  <td>{t.phone}</td>
                  <td>
                    <button 
                      onClick={() => navigate(`/edit-tenant/${t._id}`)}
                      style={{ 
                        marginRight: "5px", 
                        background: "#007bff",
                        padding: "5px 10px"
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(t._id, t.name)}
                      style={{ 
                        background: "#dc3545",
                        padding: "5px 10px"
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
        </div>
      </div>
    </div>
  );
}
