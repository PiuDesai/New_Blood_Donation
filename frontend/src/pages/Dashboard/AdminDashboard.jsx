import { useState, useEffect } from "react";
<<<<<<< HEAD
import { Users, HeartPulse, Droplets, Activity, Plus, MoreVertical, Search, Filter, ShieldCheck } from "lucide-react";
=======
import { useLocation } from "react-router-dom";
import { Users, HeartPulse, Droplets, Activity, Plus, MoreVertical, Search, Filter, ShieldCheck, UserCheck, UserX, AlertCircle, BarChart3, Globe, Zap, Settings, ArrowRight, CheckCircle2, XCircle, HelpCircle, MapPin, Clock } from "lucide-react";
>>>>>>> 68b81dae39cb4ed7c28eefd35d26b083a276efd5
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { getAdminStats, getPendingBloodBanks, approveBloodBank } from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("users");

  const path = location.pathname.split("/")[2] || "overview";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, pendingData] = await Promise.all([
          getAdminStats(),
          getPendingBloodBanks()
        ]);
        setStats(statsData);
        setPendingUsers(pendingData.map(u => ({
          id: u._id,
          name: u.name,
          role: "Blood Bank",
          location: u.location?.city || "Unknown",
          date: new Date(u.createdAt).toLocaleDateString(),
          avatar: u.name.substring(0, 2).toUpperCase(),
          licenseInfo: u.licenseInfo
        })));
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError(err?.response?.data?.message || err?.message || "Could not load admin stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveBloodBank(id);
      toast.success("Blood bank approved!");
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve blood bank");
    }
  };

  const donors = [
    { id: 1, name: "Amit Kumar", bloodGroup: "O+", location: "Mumbai, MH", status: "Active", lastDonation: "2024-01-15", reliability: 98 },
    { id: 2, name: "Suresh Raina", bloodGroup: "B-", location: "Delhi, DL", status: "Active", lastDonation: "2023-11-20", reliability: 95 },
    { id: 3, name: "Meena Singh", bloodGroup: "AB+", location: "Pune, MH", status: "Inactive", lastDonation: "2023-08-10", reliability: 88 },
  ];

  const patients = [
    { id: 1, name: "Rahul Deshmukh", bloodGroup: "O+", urgency: "Emergency", status: "In Progress", hospital: "City General" },
    { id: 2, name: "Priya Sharma", bloodGroup: "A-", urgency: "Urgent", status: "Fulfilled", hospital: "Lifeline Hospital" },
    { id: 3, name: "Vikram Seth", bloodGroup: "B+", urgency: "Regular", status: "Pending", hospital: "Metro Health" },
  ];

  const inventory = [
    { group: "A+", units: 120, status: "Healthy" },
    { group: "A-", units: 45, status: "Low" },
    { group: "B+", units: 85, status: "Healthy" },
    { group: "B-", units: 12, status: "Critical" },
    { group: "O+", units: 150, status: "Healthy" },
    { group: "O-", units: 30, status: "Low" },
    { group: "AB+", units: 25, status: "Healthy" },
    { group: "AB-", units: 8, status: "Critical" },
  ];

  const systemLogs = [
    { id: 1, event: "New Blood Request", user: "Patient #442", status: "Success", time: "12:45 PM" },
    { id: 2, event: "Stock Update", user: "Red Cross BB", status: "Warning", time: "11:30 AM" },
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Admin Console...</p>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-10">
<<<<<<< HEAD
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
=======
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard title="Total Donors" value={stats?.totalDonors ?? 0} icon={Users} color="from-blue-500 to-indigo-600" />
        <StatsCard title="Active Patients" value={stats?.totalPatients ?? 0} icon={Activity} color="from-purple-500 to-violet-600" />
        <StatsCard title="Global Requests" value={stats?.bloodRequests ?? 0} icon={HeartPulse} color="from-red-500 to-pink-600" />
        <StatsCard title="System Uptime" value="99.9%" icon={Zap} color="from-emerald-500 to-teal-600" />
>>>>>>> 68b81dae39cb4ed7c28eefd35d26b083a276efd5
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card variant="glass" className="lg:col-span-2 p-10 border-none shadow-2xl shadow-gray-100/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Pending Approvals</h3>
            <div className="flex gap-2">
              {["users", "logs"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-purple-600 text-white shadow-lg shadow-purple-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>{tab}</button>
              ))}
            </div>
          </div>
<<<<<<< HEAD

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
=======
          
          <AnimatePresence mode="wait">
            {activeTab === "users" ? (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {pendingUsers.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-50/50 transition-all group gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center text-purple-600 font-black text-xl shadow-sm group-hover:scale-110 transition-transform">{item.avatar}</div>
                      <div>
                        <h4 className="font-black text-2xl text-gray-900 mb-1">{item.name}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-gray-400 font-bold text-sm">
                          <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{item.role}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {item.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(item.id)}
                        className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <UserCheck size={24} />
                      </button>
                      <button className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"><UserX size={24} /></button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {systemLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 border border-transparent hover:bg-white hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`w-2 h-2 rounded-full ${log.status === "Success" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <div>
                        <p className="font-black text-gray-900">{log.event}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{log.user}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 font-bold text-sm">{log.time}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
>>>>>>> 68b81dae39cb4ed7c28eefd35d26b083a276efd5
        </Card>

        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50 bg-gradient-to-br from-white to-purple-50/30">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">System Health</h3>
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-black uppercase tracking-widest text-gray-400"><span>CPU Usage</span><span className="text-purple-600">24%</span></div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: "24%" }} className="h-full bg-purple-600 rounded-full" /></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-black uppercase tracking-widest text-gray-400"><span>Memory</span><span className="text-blue-600">42%</span></div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: "42%" }} className="h-full bg-blue-600 rounded-full" /></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDonors = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Manage Donors</h3>
        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 w-full md:w-96 group focus-within:bg-white focus-within:border-purple-200 transition-all">
          <Search size={18} className="text-gray-400 group-focus-within:text-purple-500" />
          <input type="text" placeholder="Search by name, blood group..." className="bg-transparent border-none outline-none px-4 text-sm font-bold w-full" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-6 font-black uppercase text-xs text-gray-400 tracking-widest">Donor</th>
              <th className="pb-6 font-black uppercase text-xs text-gray-400 tracking-widest">Blood Group</th>
              <th className="pb-6 font-black uppercase text-xs text-gray-400 tracking-widest">Location</th>
              <th className="pb-6 font-black uppercase text-xs text-gray-400 tracking-widest">Reliability</th>
              <th className="pb-6 font-black uppercase text-xs text-gray-400 tracking-widest">Status</th>
              <th className="pb-6 font-black uppercase text-xs text-gray-400 tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {donors.map((donor) => (
              <tr key={donor.id} className="group hover:bg-gray-50/50 transition-all">
                <td className="py-6"><p className="font-black text-gray-900">{donor.name}</p><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">ID: #D-{donor.id}</p></td>
                <td className="py-6"><span className="w-10 h-10 bg-red-50 text-red-600 font-black rounded-xl flex items-center justify-center">{donor.bloodGroup}</span></td>
                <td className="py-6 font-bold text-gray-500 text-sm">{donor.location}</td>
                <td className="py-6"><div className="flex items-center gap-2"><div className="w-12 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${donor.reliability}%` }} /></div><span className="font-black text-xs text-emerald-600">{donor.reliability}%</span></div></td>
                <td className="py-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${donor.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{donor.status}</span></td>
                <td className="py-6"><button className="text-gray-300 hover:text-purple-600 transition-all"><MoreVertical size={20} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderPatients = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Manage Patients</h3>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-gray-100 text-gray-400"><Filter size={18} /></Button>
          <Button className="h-12 bg-purple-600">New Entry</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {patients.map((patient) => (
          <div key={patient.id} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-6 transition-transform">{patient.bloodGroup}</div>
                <div><h4 className="font-black text-xl text-gray-900">{patient.name}</h4><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{patient.hospital}</p></div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${patient.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>{patient.urgency}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-50 pt-6">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Status: <span className="text-gray-900">{patient.status}</span></span>
              <button className="text-purple-600 font-black text-xs uppercase tracking-widest hover:underline">Track Details</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderInventory = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {inventory.map((item, i) => (
          <motion.div key={item.group} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 hover:shadow-xl transition-all group text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl mx-auto mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{item.group}</div>
            <p className="text-4xl font-black text-gray-900 mb-2">{item.units}</p>
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === "Healthy" ? "bg-emerald-50 text-emerald-600" : item.status === "Low" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{item.status}</span>
          </motion.div>
        ))}
      </div>
      <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Stock Adjustment History</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50">
              <div className="flex items-center gap-4"><CheckCircle2 className="text-emerald-500" /><div><p className="font-black text-gray-900">Added 50 Units of O+</p><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Mumbai Blood Bank • 1h ago</p></div></div>
              <button className="text-purple-600 font-black text-xs uppercase tracking-widest hover:underline">View Log</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">System Settings</h3>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
          <div><p className="font-black text-gray-900">Push Notifications</p><p className="text-xs text-gray-400 font-bold">Alert donors of nearby emergencies automatically.</p></div>
          <div className="w-12 h-6 bg-purple-600 rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-1" /></div>
        </div>
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
          <div><p className="font-black text-gray-900">Auto-Approval</p><p className="text-xs text-gray-400 font-bold">Automatically approve new donors with valid medical ID.</p></div>
          <div className="w-12 h-6 bg-gray-200 rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-1" /></div>
        </div>
      </div>
    </Card>
  );

  const renderHelp = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Admin Support</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-purple-50 rounded-[2rem] border border-purple-100">
          <HelpCircle className="text-purple-600 mb-4" size={32} />
          <h4 className="font-black text-xl text-gray-900 mb-2">Technical Support</h4>
          <p className="text-gray-500 font-bold text-sm mb-6">Connect with our engineering team for system-level issues.</p>
          <Button className="bg-purple-600 h-10 text-xs">Contact Dev Team</Button>
        </div>
        <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
          <ShieldCheck className="text-blue-600 mb-4" size={32} />
          <h4 className="font-black text-xl text-gray-900 mb-2">Security Hub</h4>
          <p className="text-gray-500 font-bold text-sm mb-6">Review protocols and security audit logs.</p>
          <Button className="bg-blue-600 h-10 text-xs">Security Dashboard</Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">System <span className="text-purple-600">Control</span></h1>
          <p className="text-gray-400 font-bold text-lg">Centralized oversight of all medical activities.</p>
        </motion.div>
        <div className="flex flex-wrap gap-4">
          <Button className="h-14 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-100 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"><Settings size={24} /> System Config</Button>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all"><Globe size={24} /> Network Map</Button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <AlertCircle className="text-amber-500" /> {error}
        </motion.div>
      )}

      {/* Main Content Based on Path */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {path === "overview" && renderOverview()}
        {path === "donors" && renderDonors()}
        {path === "patients" && renderPatients()}
        {path === "inventory" && renderInventory()}
        {path === "settings" && renderSettings()}
        {path === "help" && renderHelp()}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;