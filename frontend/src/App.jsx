import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import Tenants from "./pages/Tenants";
import AddTenant from "./pages/AddTenant";
import EditTenant from "./pages/EditTenant";
import RentPayments from "./pages/RentPayments";
import Complaints from "./pages/Complaints";
import Notices from "./pages/Notices";
import TenantDashboard from "./pages/TenantDashboard";
import TenantRentPayment from "./pages/TenantRentPayment";
import TenantComplaints from "./pages/TenantComplaints";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tenants"
          element={
            <ProtectedRoute role="admin">
              <Tenants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-tenant"
          element={
            <ProtectedRoute role="admin">
              <AddTenant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-tenant/:id"
          element={
            <ProtectedRoute role="admin">
              <EditTenant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rents"
          element={
            <ProtectedRoute role="admin">
              <RentPayments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints"
          element={
            <ProtectedRoute role="admin">
              <Complaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant-dashboard"
          element={
           <ProtectedRoute role="tenant">
              <TenantDashboard />
           </ProtectedRoute>
          }
        />

        <Route
          path="/tenant-rent-payments"
          element={
           <ProtectedRoute role="tenant">
              <TenantRentPayment />
           </ProtectedRoute>
          }
        />

        <Route
          path="/tenant-complaints"
          element={
           <ProtectedRoute role="tenant">
              <TenantComplaints />
           </ProtectedRoute>
          }
        />

        <Route
          path="/notices"
          element={
            <ProtectedRoute role="admin">
              <Notices />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
