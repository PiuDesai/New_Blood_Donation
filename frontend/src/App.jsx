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
import DonorCertificates from "./pages/Dashboard/DonorCertificates";
import PatientDashboard from "./pages/Dashboard/PatientDashboard";
import BloodBankDashboard from "./pages/Dashboard/BloodBankDashboard";
import AdminLogin from "./pages/Auth/AdminLogin";
import PendingDonors from "./pages/Admin/PendingDonors";
import PendingBloodBanks from "./pages/Admin/PendingBloodBanks";
import AllDonors from "./pages/Admin/AllDonors";
import AllBloodBanks from "./pages/Admin/AllBloodBanks";
import Home from "./pages/Home";
import HomeBloodTest from "./pages/Patient/HomeBloodTest";
import Profile from "./pages/Common/Profile";
import Leaderboard from "./pages/Dashboard/Leaderboard";
import Rewards from "./pages/Dashboard/Rewards";



import BloodBankBookings from "./pages/BloodBank/BloodBankBookings";
import BloodBankNearbyDonors from "./pages/BloodBank/BloodBankNearbyDonors";


import ReportAnalyzer from "./pages/Patient/ReportAnalyzer";


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
          <Route path="donors" element={<AllDonors />} />
          <Route path="bloodbanks" element={<AllBloodBanks />} />
          <Route path="profile" element={<Profile />} />
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
          <Route path="certificates" element={<DonorCertificates />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="settings" element={<Profile />} />
          <Route path="profile" element={<Profile />} />
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
          <Route path="report-analyzer" element={<ReportAnalyzer />} />
          <Route path="settings" element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<PatientDashboard />} />
          <Route path="report-analyzer" element={<ReportAnalyzer />} />
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
          <Route path="test-bookings" element={<BloodBankBookings />} />
          <Route path="nearby-donors" element={<BloodBankNearbyDonors />} />
          <Route path="settings" element={<Profile />} />
          <Route path="profile" element={<Profile />} />
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
