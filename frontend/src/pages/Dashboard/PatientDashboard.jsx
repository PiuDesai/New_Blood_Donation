import { HeartPulse, Droplets, Activity, Search, Plus, MapPin, Calendar, Clock, Loader2, ShieldCheck, Phone, CheckCircle2, Home, ArrowLeft, HelpCircle } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Input } from "../../components/Common/Input";
import { useAuth } from "../../context/AuthContext";
import { getPatientStats } from "../../api/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { dashboardPath } from "../../utils/rolePaths";
import toast from "react-hot-toast";

const PatientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showNearbyDonors, setShowNearbyDonors] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [requestForm, setRequestModalForm] = useState({
    bloodGroup: "O+",
    units: "",
    hospital: "",
    urgency: "Regular"
  });
  const [labForm, setLabForm] = useState({
    testType: "Complete Blood Count (CBC)",
    preferredDate: "",
    address: ""
  });

  const isRequestsPage = location.pathname.includes("/requests");
  const isFindPage = location.pathname.includes("/find");
  const isLabPage = location.pathname.includes("/lab");
  const isSettingsPage = location.pathname.includes("/settings");
  const isHelpPage = location.pathname.includes("/help");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPatientStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch patient stats:", err);
        setError(err?.response?.data?.message || err?.message || "Could not load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (user && String(user.role).toLowerCase() !== "patient") {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  const labTests = [
    { id: 1, test: "Complete Blood Count (CBC)", date: "March 20, 2024", status: "Report Ready", result: "Normal" },
    { id: 2, test: "Liver Function Test", date: "March 15, 2024", status: "Pending", result: "N/A" },
  ];

  const myRequests = stats?.requests || [];

  const nearbyDonors = [
    { name: "John Doe", bloodGroup: "O+", distance: "1.2 km", reliability: 98, phone: "+91 98765 43210" },
    { name: "Jane Smith", bloodGroup: "O+", distance: "2.5 km", reliability: 95, phone: "+91 87654 32109" },
    { name: "Mike Johnson", bloodGroup: "O+", distance: "3.8 km", reliability: 92, phone: "+91 76543 21098" },
    { name: "Sarah Williams", bloodGroup: "A-", distance: "4.2 km", reliability: 99, phone: "+91 65432 10987" },
    { name: "David Brown", bloodGroup: "B+", distance: "5.0 km", reliability: 94, phone: "+91 54321 09876" }
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Medical Data...</p>
    </div>
  );

  if (isRequestsPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">All Blood Requests</h3>
            <Button onClick={() => setShowRequestModal(true)} className="bg-red-600 hover:bg-red-700">New Request</Button>
          </div>
          <div className="space-y-6">
            {myRequests.map((req, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all group gap-8">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-200 group-hover:rotate-6 transition-transform">{req.bloodGroup}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-black text-2xl text-gray-900">{req.units}</p>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>{req.urgency}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {req.hospital}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {req.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest ${req.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{req.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isFindPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Find Nearby Donors</h3>
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 w-full md:w-96 group focus-within:bg-white focus-within:border-red-200 transition-all">
              <Search size={18} className="text-gray-400 group-focus-within:text-red-500" />
              <input type="text" placeholder="Search blood group..." className="bg-transparent border-none outline-none px-4 text-sm font-bold w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nearbyDonors.map((donor, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all group relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{donor.bloodGroup}</div>
                    <div>
                      <p className="font-black text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{donor.name}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{donor.distance} away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-black text-lg">{donor.reliability}%</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reliability</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-black uppercase tracking-widest text-[10px]">Contact Donor</Button>
                  <button className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Phone size={18} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isLabPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Home Lab Tests</h3>
            <Button onClick={() => setShowLabModal(true)} className="bg-blue-600 hover:bg-blue-700">Book New Test</Button>
          </div>
          <div className="space-y-6">
            {labTests.map((test, i) => (
              <div key={i} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all"><Activity size={24} /></div>
                  <div><p className="font-black text-gray-900 text-lg">{test.test}</p><p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{test.date}</p></div>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${test.status === "Report Ready" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{test.status}</span>
                  {test.status === "Report Ready" && <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Download PDF</button>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isSettingsPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Account Settings</h3>
          <div className="space-y-6 max-w-2xl">
            <div className="p-6 bg-gray-50 rounded-2xl">
              <p className="font-black text-gray-900 mb-2">Profile Information</p>
              <p className="text-sm text-gray-500 font-bold">Update your personal details and blood group.</p>
              <Button className="mt-4 bg-red-600 h-10 text-xs">Edit Profile</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isHelpPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Patient Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100">
              <HelpCircle className="text-red-600 mb-4" size={32} />
              <h4 className="font-black text-xl text-gray-900 mb-2">Emergency Help</h4>
              <p className="text-gray-500 font-bold text-sm mb-6">Need immediate assistance finding blood? Contact our 24/7 hotline.</p>
              <Button className="bg-red-600 h-10 text-xs">Call Helpline</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
            Hello, <span className="text-red-600">{user?.name?.split(" ")[0]}!</span>
          </h1>
          <p className="text-gray-400 font-bold text-lg">Your health portal is ready. How can we help today?</p>
        </motion.div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => setShowRequestModal(true)}
            className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"
          >
            <Plus size={24} /> New Request
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowLabModal(true)}
            className="h-14 px-8 rounded-2xl border-2 border-blue-100 text-blue-600 hover:bg-blue-50 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all"
          >
            <Home size={24} /> Book Lab Test
          </Button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <ShieldCheck className="text-amber-500" /> {error}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard 
          title="Active Requests" 
          value={stats?.activeRequests ?? 0} 
          icon={HeartPulse} 
          color="from-red-500 to-pink-600" 
        />
        <StatsCard 
          title="Donors Found" 
          value={stats?.donorsFound ?? 0} 
          icon={Activity} 
          color="from-blue-500 to-indigo-600" 
        />
        <StatsCard 
          title="Nearby Centers" 
          value={stats?.nearbyCenters ?? 0} 
          icon={MapPin} 
          color="from-emerald-500 to-teal-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Requests */}
        <Card variant="glass" className="lg:col-span-2 p-10 border-none shadow-2xl shadow-gray-100/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Blood Requests</h3>
            <button className="text-red-600 font-black uppercase text-xs tracking-widest hover:underline decoration-2 underline-offset-4">View History</button>
          </div>
          
          <div className="space-y-6">
            {myRequests.map((req, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all group gap-8"
              >
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-200 group-hover:rotate-6 transition-transform">
                    {req.bloodGroup}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-black text-2xl text-gray-900">{req.units}</p>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        req.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {req.hospital}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {req.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest ${
                    req.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {req.status}
                  </span>
                  <button className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all">
                    <Search size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Nearby Donors Sidebar */}
        <div className="space-y-10">
          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50 bg-gradient-to-br from-white to-blue-50/30">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Nearby Donors</h3>
            <div className="space-y-8">
              {nearbyDonors.map((donor, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 font-black text-lg shadow-xl shadow-blue-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 group-hover:text-red-600 transition-colors">{donor.name}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{donor.distance} away</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                    <Phone size={18} />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-10 h-14 rounded-2xl text-blue-600 font-black uppercase tracking-widest border-2 border-blue-50 hover:bg-blue-50">
              Find More Donors
            </Button>
          </Card>

          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-red-100/50 bg-gradient-to-br from-red-600 to-pink-600 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-4 tracking-tight">Need Urgent Help?</h4>
              <p className="text-white/80 font-bold text-sm leading-relaxed mb-8">Connect with our emergency response team 24/7 for immediate blood assistance.</p>
              <button className="h-14 px-8 rounded-2xl bg-white text-red-600 font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all">Call Helpline</button>
            </div>
            <HeartPulse size={120} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </Card>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRequestModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-12">
                <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Request Blood</h3>
                <p className="text-gray-400 font-bold mb-10">Fill in the details for your urgent requirement</p>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Blood Group</label>
                      <select 
                        value={requestForm.bloodGroup}
                        onChange={(e) => setRequestModalForm({...requestForm, bloodGroup: e.target.value})}
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                      >
                        <option>O+</option>
                        <option>A+</option>
                        <option>B+</option>
                        <option>AB+</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Units Required</label>
                      <input 
                        type="number" 
                        placeholder="2" 
                        value={requestForm.units}
                        onChange={(e) => setRequestModalForm({...requestForm, units: e.target.value})}
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Hospital Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. City General Hospital" 
                      value={requestForm.hospital}
                      onChange={(e) => setRequestModalForm({...requestForm, hospital: e.target.value})}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Urgency Level</label>
                    <div className="flex gap-4">
                      {["Regular", "Urgent", "Emergency"].map(level => (
                        <button 
                          key={level} 
                          type="button" 
                          onClick={() => setRequestModalForm({...requestForm, urgency: level})}
                          className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                            requestForm.urgency === level 
                            ? "bg-red-600 text-white shadow-lg shadow-red-200" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => {
                      setShowRequestModal(false);
                      toast.success(`Blood request (${requestForm.urgency}) submitted successfully!`);
                    }} 
                    className="w-full h-16 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-lg shadow-2xl shadow-red-100 mt-8"
                  >
                    Submit Request
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Lab Test Modal */}
      <AnimatePresence>
        {showLabModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLabModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-12">
                <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Book Home Lab Test</h3>
                <p className="text-gray-400 font-bold mb-10">Schedule a convenient home collection for your medical tests.</p>
                
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Select Test Type</label>
                    <select 
                      value={labForm.testType}
                      onChange={(e) => setLabForm({...labForm, testType: e.target.value})}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    >
                      <option>Complete Blood Count (CBC)</option>
                      <option>Liver Function Test (LFT)</option>
                      <option>Kidney Function Test (KFT)</option>
                      <option>Diabetes Screening (HbA1c)</option>
                      <option>Lipid Profile</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Preferred Collection Date</label>
                    <input 
                      type="date" 
                      value={labForm.preferredDate}
                      onChange={(e) => setLabForm({...labForm, preferredDate: e.target.value})}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Collection Address</label>
                    <textarea 
                      placeholder="Enter your full home address for sample collection" 
                      value={labForm.address}
                      onChange={(e) => setLabForm({...labForm, address: e.target.value})}
                      className="w-full h-32 bg-gray-50 border-none rounded-2xl p-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none" 
                    />
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => {
                      setShowLabModal(false);
                      toast.success(`Lab test appointment scheduled for ${labForm.preferredDate || 'soon'}!`);
                    }} 
                    className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-lg shadow-2xl shadow-blue-100 mt-8"
                  >
                    Confirm Booking
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;