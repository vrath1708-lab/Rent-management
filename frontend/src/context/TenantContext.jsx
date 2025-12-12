import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "./AuthContext";

export const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTenants = async () => {
    if (!user || user.role !== "admin") {
      // Tenant should not load this
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("/tenants"); // admin only
      setTenants(res.data);
    } catch (error) {
      console.error("Error loading tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTenant = async (data) => {
    const res = await api.post("/tenants", data);
    setTenants((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateTenant = async (id, data) => {
    const res = await api.put(`/tenants/${id}`, data);
    setTenants((prev) =>
      prev.map((t) => (t._id === id ? res.data : t))
    );
    return res.data;
  };

  const deleteTenant = async (id) => {
    await api.delete(`/tenants/${id}`);
    setTenants((prev) => prev.filter((t) => t._id !== id));
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadTenants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <TenantContext.Provider
      value={{
        tenants,
        loading,
        loadTenants,
        addTenant,
        updateTenant,
        deleteTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
