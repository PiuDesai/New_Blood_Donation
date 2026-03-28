import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";

// Pages
import RoleSelection from "./pages/Auth/RoleSelection";
import SubRoleSelection from "./pages/Auth/SubRoleSelection";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import DonorDashboard from "./pages/Dashboard/DonorDashboard";
import PatientDashboard from "./pages/Dashboard/PatientDashboard";
import BloodBankDashboard from "./pages/Dashboard/BloodBankDashboard";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/sub-role-selection" element={<SubRoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Donor Routes */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DonorDashboard />} />
        </Route>

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
        </Route>

        {/* Blood Bank Routes */}
        <Route
          path="/bloodbank"
          element={
            <ProtectedRoute allowedRoles={["bloodbank"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<BloodBankDashboard />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/role-selection" replace />} />
        <Route path="*" element={<Navigate to="/role-selection" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
