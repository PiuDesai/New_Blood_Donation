import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2, Droplets, Activity, Plus, Search, MapPin, MoreVertical, ShieldCheck, Bell, Users, Calendar, ArrowRight, TrendingUp, AlertTriangle, ArrowLeft, CheckCircle2, Clock, Settings, HelpCircle } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { getBloodBankStats } from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

const BloodBankDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");

  const path = location.pathname.split("/")[2] || "inventory";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBloodBankStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch blood bank stats:", err);
        setError(err?.response?.data?.message || err?.message || "Could not load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inventoryData = [
    { group: "A+", units: 45, status: "Healthy", color: "text-emerald-600 bg-emerald-50" },
    { group: "A-", units: 12, status: "Low", color: "text-amber-600 bg-amber-50" },
    { group: "B+", units: 38, status: "Healthy", color: "text-emerald-600 bg-emerald-50" },
    { group: "B-", units: 8, status: "Critical", color: "text-red-600 bg-red-50" },
    { group: "O+", units: 62, status: "Healthy", color: "text-emerald-600 bg-emerald-50" },
    { group: "O-", units: 15, status: "Low", color: "text-amber-600 bg-amber-50" },
    { group: "AB+", units: 24, status: "Healthy", color: "text-emerald-600 bg-emerald-50" },
    { group: "AB-", units: 5, status: "Critical", color: "text-red-600 bg-red-50" },
  ];

  const incomingRequests = [
    { id: 1, patient: "Rajesh Koothrappali", bloodGroup: "O+", units: "2 Units", hospital: "City General", time: "10 mins ago", urgency: "Emergency" },
    { id: 2, patient: "Howard Wolowitz", bloodGroup: "AB-", units: "1 Unit", hospital: "St. Jude", time: "45 mins ago", urgency: "Urgent" },
  ];

  const recentDonations = [
    { id: 1, donor: "Penny Hofstadter", bloodGroup: "A+", date: "Today, 10:30 AM", type: "Whole Blood" },
    { id: 2, donor: "Bernadette Rostenkowski", bloodGroup: "O-", date: "Today, 09:15 AM", type: "Platelets" },
  ];

  const upcomingCamps = [
    { id: 1, title: "City Mall Donation Drive", date: "April 05, 2024", location: "South Mumbai", target: "100 Units", registered: 65 },
    { id: 2, title: "Tech Park Blood Camp", date: "April 12, 2024", location: "Andheri East", target: "200 Units", registered: 120 },
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Inventory Systems...</p>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard title="Total Units" value={stats?.totalUnits ?? 0} icon={Droplets} color="from-blue-500 to-indigo-600" />
        <StatsCard title="Today's Intake" value={stats?.todayDonations ?? 0} icon={TrendingUp} color="from-emerald-500 to-teal-600" />
        <StatsCard title="Active Requests" value={stats?.activeRequests ?? 0} icon={Activity} color="from-purple-500 to-violet-600" />
        <StatsCard title="Low Stock" value={stats?.lowStockAlerts ?? 0} icon={AlertTriangle} color="from-red-500 to-pink-600" />
      </div>

      <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Live Stock Levels</h3>
          <div className="flex gap-2">
            {["inventory", "camps"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>{tab}</button>
            ))}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {activeTab === "inventory" ? (
            <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {inventoryData.map((item, i) => (
                <motion.div key={item.group} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 hover:shadow-xl transition-all group text-center relative overflow-hidden">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl mx-auto mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{item.group}</div>
                  <p className="text-4xl font-black text-gray-900 mb-2">{item.units}</p>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="camps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {upcomingCamps.map((camp, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 hover:shadow-xl transition-all group gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-100 group-hover:rotate-6 transition-transform"><Calendar size={32} /></div>
                    <div><h4 className="font-black text-2xl text-gray-900 mb-2">{camp.title}</h4><p className="text-gray-400 font-bold text-sm flex items-center gap-1.5"><MapPin size={14} /> {camp.location} • {camp.date}</p></div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2"><Users size={16} className="text-blue-600" /><span className="font-black text-gray-900">{camp.registered} / {camp.target}</span></div>
                    <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full" style={{ width: `${(parseInt(camp.registered)/parseInt(camp.target))*100}%` }} /></div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );

  const renderRequests = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-10">Incoming Blood Requests</h3>
      <div className="space-y-6">
        {incomingRequests.map((req, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl transition-all group gap-8">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-200 group-hover:rotate-6 transition-transform">{req.bloodGroup}</div>
              <div>
                <h4 className="font-black text-2xl text-gray-900 mb-1">{req.patient}</h4>
                <p className="text-gray-400 font-bold text-sm flex items-center gap-1.5"><Building2 size={14} /> {req.hospital} • {req.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>{req.urgency}</span>
              <Button className="h-12 bg-blue-600 hover:bg-blue-700">Fulfill Request</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );

  const renderDonations = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-10">Recent Donations</h3>
      <div className="space-y-6">
        {recentDonations.map((donation, i) => (
          <div key={i} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all"><CheckCircle2 size={24} /></div>
              <div><p className="font-black text-gray-900 text-lg">{donation.donor}</p><p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{donation.date} • {donation.bloodGroup} • {donation.type}</p></div>
            </div>
            <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Print Label</button>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Bank Settings</h3>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
          <div><p className="font-black text-gray-900">Emergency Broadcast</p><p className="text-xs text-gray-400 font-bold">Instantly notify all local donors of critical shortages.</p></div>
          <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-1" /></div>
        </div>
      </div>
    </Card>
  );

  const renderHelp = () => (
    <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
      <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Support Hub</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
          <HelpCircle className="text-blue-600 mb-4" size={32} />
          <h4 className="font-black text-xl text-gray-900 mb-2">Technical Support</h4>
          <p className="text-gray-500 font-bold text-sm mb-6">Connect with central admin for logistical support.</p>
          <Button className="bg-blue-600 h-10 text-xs">Open Ticket</Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">Blood Bank <span className="text-blue-600">Ops</span></h1>
          <p className="text-gray-400 font-bold text-lg">Centralized inventory and donation drive control.</p>
        </motion.div>
        <div className="flex flex-wrap gap-4">
          <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"><Plus size={24} /> New Camp</Button>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-red-100 text-red-600 hover:bg-red-50 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all"><Bell size={24} /> Notify Donors</Button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <ShieldCheck className="text-amber-500" /> {error}
        </motion.div>
      )}

      {/* Main Content Based on Path */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {path === "inventory" && renderInventory()}
        {path === "requests" && renderRequests()}
        {path === "donations" && renderDonations()}
        {path === "settings" && renderSettings()}
        {path === "help" && renderHelp()}
      </motion.div>
    </div>
  );
};

export default BloodBankDashboard;