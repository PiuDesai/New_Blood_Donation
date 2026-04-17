import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  HeartPulse,
  Droplets,
  Activity,
  UserCheck,
  UserX,
  MapPin,
  AlertCircle,
} from "lucide-react";

import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";

import {
  getAdminStats,
  getPendingBloodBanks,
  approveBloodBank,
  removeUser,
} from "../../api/api";

import toast from "react-hot-toast";

const AdminDashboard = () => {
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const path = location.pathname.split("/")[2] || "overview";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          getAdminStats(),
          getPendingBloodBanks(),
        ]);

        // SET STATS
        setStats(statsRes?.data || statsRes);

        //HANDLE DIFFERENT API STRUCTURES
        const banks = Array.isArray(pendingRes)
          ? pendingRes
          : pendingRes?.data || pendingRes?.pendingBanks || pendingRes?.bloodbanks || [];

        //MAP SAFELY
        const formatted = banks.map((u) => ({
          id: u._id,
          name: u.name,
          role: "Blood Bank",
          location: u.location?.city || "Unknown",
          date: new Date(u.createdAt).toLocaleDateString(),
          avatar: u.name?.substring(0, 2).toUpperCase(),
          licenseInfo: u.licenseInfo,
        }));

        setPendingUsers(formatted);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // APPROVE FUNCTION
  const handleApprove = async (id) => {
    try {
      await approveBloodBank(id);
      toast.success("Blood bank approved!");

      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Approval failed"
      );
    }
  };

  //REJECT FUNCTION
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and deactivate this blood bank?")) return;
    try {
      await removeUser(id);
      toast.success("Blood bank rejected and deactivated");
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Rejection failed");
    }
  };

  //LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 font-bold">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">
          System-wide monitoring and control
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Donors"
          value={stats?.totalDonors || 0}
          icon={() => <Users size={28} className="text-blue-600" />}
        />

        <StatsCard
          title="Pending Donors"
          value={stats?.pendingDonors || 0}
          icon={() => <Activity size={28} className="text-yellow-500" />}
        />

        <StatsCard
          title="Total Blood Banks"
          value={stats?.totalBanks || 0}
          icon={() => <HeartPulse size={28} className="text-red-600" />}
        />

        <StatsCard
          title="Pending Blood Banks"
          value={stats?.pendingBanks || 0}
          icon={() => <Droplets size={28} className="text-pink-600" />}
        />
      </div>

      {/* PENDING APPROVALS */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          Pending Blood Bank Approvals
        </h2>

        {pendingUsers.length > 0 ? (
          <div className="space-y-4">
            {pendingUsers.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">
                    {item.avatar}
                  </div>

                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} /> {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <UserCheck size={16} /> Approve
                  </button>

                  <button 
                    onClick={() => handleReject(item.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <UserX size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">
            No pending approvals
          </p>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
