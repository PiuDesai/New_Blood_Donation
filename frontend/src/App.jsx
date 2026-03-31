import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";
import { Toaster } from "react-hot-toast";

// Pages
import RoleSelection from "./pages/Auth/RoleSelection";
import SubRoleSelection from "./pages/Auth/SubRoleSelection";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RegisterBloodBank from "./pages/Auth/RegisterBloodBank";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import DonorDashboard from "./pages/Dashboard/DonorDashboard";
import PatientDashboard from "./pages/Dashboard/PatientDashboard";
import BloodBankDashboard from "./pages/Dashboard/BloodBankDashboard";
import AdminLogin from "./pages/Auth/AdminLogin";
import PendingDonors from "./pages/Admin/PendingDonors";
import PendingBloodBanks from "./pages/Admin/PendingBloodBanks";
import Home from "./pages/Home";
import HomeBloodTest from "./pages/Patient/HomeBloodTest";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Auth Routes */}
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/sub-role-selection" element={<SubRoleSelection />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register/bloodbank" element={<RegisterBloodBank />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pending-donors" element={<PendingDonors />} />
          <Route path="pending-bloodbanks" element={<PendingBloodBanks />} />
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DonorDashboard />} />
          <Route path="history" element={<DonorDashboard />} />
          <Route path="schedule" element={<DonorDashboard />} />
          <Route path="settings" element={<DonorDashboard />} />
          <Route path="help" element={<DonorDashboard />} />
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="requests" element={<PatientDashboard />} />
          <Route path="find" element={<PatientDashboard />} />
          <Route path="lab" element={<HomeBloodTest />} />
          <Route path="settings" element={<PatientDashboard />} />
          <Route path="help" element={<PatientDashboard />} />
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
          <Route path="requests" element={<BloodBankDashboard />} />
          <Route path="donations" element={<BloodBankDashboard />} />
          <Route path="settings" element={<BloodBankDashboard />} />
          <Route path="help" element={<BloodBankDashboard />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
