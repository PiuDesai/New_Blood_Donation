import { useState, useEffect } from "react";
import { Users, HeartPulse, Droplets, Activity, Plus, MoreVertical, Search, Filter, ShieldCheck } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { getStats } from "../../api/authAPI";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setError("API connection failed. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentRequests = stats?.recentRequests || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">System-wide monitoring and management</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard
          title="Total Donors"
          value={stats?.totalDonors || 0}
          icon={Users}
          color="bg-blue-600 shadow-blue-200/50"
        />
        <StatsCard
          title="Pending Donors"
          value={stats?.pendingDonors || 0}
          icon={Activity}
          color="bg-purple-600 shadow-purple-200/50"
        />
        <StatsCard
          title="Total Blood Banks"
          value={stats?.totalBanks || 0}   // ✅ FIX
          icon={HeartPulse}
          color="bg-red-600 shadow-red-200/50"
        />

        <StatsCard
          title="Pending Blood Banks"
          value={stats?.pendingBanks || 0}   // ✅ FIX
          icon={Droplets}
          color="bg-emerald-600 shadow-emerald-200/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none bg-white shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-gray-900">Recent System Activity</h3>
            <Button variant="ghost" size="sm" className="text-red-600 font-bold hover:bg-red-50">View All</Button>
          </div>

          {recentRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">
                    <th className="pb-4">User</th>
                    <th className="pb-4">Action</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentRequests.map((req, i) => (
                    <tr key={i} className="group">
                      <td className="py-4 text-sm font-bold text-gray-900">{req.user}</td>
                      <td className="py-4 text-sm text-gray-500">{req.action}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase">{req.status}</span>
                      </td>
                      <td className="py-4 text-right text-xs text-gray-400 font-medium">{req.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <Activity size={48} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-medium italic">No recent activity detected in the system</p>
            </div>
          )}
        </Card>

        <Card className="p-8 border-none bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-4 tracking-tight">System Status</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-bold">API Health</span>
                <span className={`w-3 h-3 rounded-full ${error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-bold">DB Sync</span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              </div>
            </div>
            <Button className="w-full mt-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold border border-white/10 transition-all">
              Server Logs
            </Button>
          </div>
          <ShieldCheck size={180} className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-500" />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
