import { Heart, Activity, Droplets, Calendar, Clock, MapPin, Search, Star, ShieldCheck, CheckCircle2, User, ArrowRight, Phone, ArrowLeft, HelpCircle, Award, CheckCircle, Building2 } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { useAuth } from "../../context/AuthContext";
import { getDonorStats, getUrgentBloodRequests, getAllCamps, acceptBloodRequest, verifyRequestCompletion } from "../../api/api";
import { StarRating } from "../../components/Common/RatingComponent";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { dashboardPath } from "../../utils/rolePaths";
import toast from "react-hot-toast";

const DonorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [accepting, setAccepting] = useState(null);

  const isHistoryPage = location.pathname.includes("/history");
  const isSchedulePage = location.pathname.includes("/schedule");
  const isSettingsPage = location.pathname.includes("/settings");
  const isHelpPage = location.pathname.includes("/help");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, requestsData, campsData] = await Promise.all([
        getDonorStats(),
        getUrgentBloodRequests(),
        getAllCamps()
      ]);
      setStats(statsData);
      setRequests(requestsData);
      setCamps(campsData);
    } catch (err) {
      console.error("Failed to fetch donor data:", err);
      setError(err?.response?.data?.message || err?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setAccepting(requestId);
    try {
      await acceptBloodRequest(requestId);
      toast.success("Request accepted successfully!");
      fetchData(); // Refresh
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept request");
    } finally {
      setAccepting(null);
    }
  };

  const handleMarkComplete = async (requestId) => {
    try {
      await verifyRequestCompletion(requestId, "donor");
      toast.success("Marked as completed! Waiting for patient confirmation.");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark as complete");
    }
  };
  const participateInCamp = async (campId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/camps/register-donor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ campId })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Successfully registered for camp!");
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Error registering for camp");
  }
};

  if (user && String(user.role).toLowerCase() !== "donor") {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  const pendingRequests = requests.map(req => ({
    id: req._id,
    name: req.patientName,
    bloodGroup: req.bloodGroup,
    units: `${req.units} Units`,
    urgency: req.urgency,
    location: req.hospital,
    distance: "Near you",
    time: new Date(req.createdAt).toLocaleTimeString(),
    status: req.status,
    requester: req.requester,
    isDonorConfirmed: req.completedByDonor,
    isPatientConfirmed: req.completedByPatient,
    acceptedByRole: req.acceptedByRole,
    acceptedBy: req.acceptedBy
  }));

  const donationHistory = stats?.history || [];

  const nearbyCamps = camps.map(camp => ({
    id: camp._id,
    title: camp.name,
    date: new Date(camp.date).toLocaleDateString(),
    location: camp.location,
    time: "All Day"
  }));

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Donor Records...</p>
    </div>
  );

  if (isHistoryPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("donor"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-10">Donation History</h3>
          <div className="space-y-6">
            {donationHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all"><CheckCircle2 size={24} /></div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">{item.location}</p>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{item.date} • {item.type} • {item.units}</p>
                  </div>
                </div>
                <span className="text-emerald-600 font-black uppercase text-xs tracking-widest bg-emerald-50 px-4 py-2 rounded-xl">{item.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isSchedulePage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("donor"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-10">Upcoming Donation Camps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nearbyCamps.map((camp, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all group relative overflow-hidden">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-black text-xl mb-6 group-hover:bg-red-600 group-hover:text-white transition-all duration-300"><Calendar size={28} /></div>
                <h4 className="font-black text-2xl text-gray-900 mb-2">{camp.title}</h4>
                <div className="space-y-2 mb-8">
                  <p className="text-gray-400 font-bold text-sm flex items-center gap-2"><MapPin size={16} /> {camp.location}</p>
                  <p className="text-gray-400 font-bold text-sm flex items-center gap-2"><Clock size={16} /> {camp.time}</p>
                </div>
<Button
  onClick={() => participateInCamp(camp.id)}
  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 font-black uppercase tracking-widest text-[10px]"
>
  Participate
</Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isSettingsPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("donor"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Donor Settings</h3>
          <div className="space-y-6 max-w-2xl">
            <div className="p-6 bg-gray-50 rounded-2xl">
              <p className="font-black text-gray-900 mb-2">Availability Status</p>
              <p className="text-sm text-gray-500 font-bold">Show yourself as active for nearby emergency requests.</p>
              <Button className="mt-4 bg-red-600 h-10 text-xs">I'm Available</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isHelpPage) {
    return (
      <div className="space-y-10 pb-20">
        <Button onClick={() => navigate(dashboardPath("donor"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Support Hub</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
              <HelpCircle className="text-blue-600 mb-4" size={32} />
              <h4 className="font-black text-xl text-gray-900 mb-2">Donation Guidance</h4>
              <p className="text-gray-500 font-bold text-sm mb-6">Learn more about donation protocols and health benefits.</p>
              <Button className="bg-blue-600 h-10 text-xs">Read Guide</Button>
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
            Welcome, <span className="text-red-600">Hero!</span>
          </h1>
          <p className="text-gray-400 font-bold text-lg">Your contributions have saved <span className="text-red-600">12 lives</span> so far.</p>
        </motion.div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"
          >
            <Calendar size={24} /> Schedule Donation
          </Button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <ShieldCheck className="text-amber-500" /> {error}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <StatsCard 
          title="Total Donations" 
          value={user?.donorInfo?.donationCount ?? 0} 
          icon={Droplets} 
          color="from-red-500 to-pink-600" 
        />
        <StatsCard 
          title="My Points" 
          value={user?.points ?? 0} 
          icon={Star} 
          color="from-yellow-400 to-amber-600" 
        />
        <StatsCard 
          title="Rating" 
          value={user?.rating?.toFixed(1) ?? "0.0"} 
          icon={ShieldCheck} 
          color="from-emerald-400 to-teal-600" 
        />
        <StatsCard 
          title="Lives Saved" 
          value={user?.donorInfo?.donationCount ? user.donorInfo.donationCount * 3 : 0} 
          icon={Activity} 
          color="from-blue-500 to-indigo-600" 
        />
      </div>

      {/* Eligibility & Rewards */}
      {(user?.donorInfo?.nextEligibleAt || user?.donorInfo?.checkupEligible) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {user?.donorInfo?.nextEligibleAt && (
            <Card variant="glass" className="p-8 border-none shadow-xl shadow-gray-100/50 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar size={32} />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Next Eligibility</p>
                <p className="text-xl font-black text-gray-900">
                  {new Date(user.donorInfo.nextEligibleAt) > new Date() 
                    ? new Date(user.donorInfo.nextEligibleAt).toLocaleDateString()
                    : "Eligible Now"}
                </p>
                {new Date(user.donorInfo.nextEligibleAt) > new Date() && (
                  <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">3-Month Cooldown Active</p>
                )}
              </div>
            </Card>
          )}
          {user?.donorInfo?.checkupEligible && (
            <Card variant="glass" className="p-8 border-none shadow-xl shadow-gray-100/50 flex items-center gap-6 bg-emerald-50/50 border-emerald-100">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Award size={32} />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Available Rewards</p>
                <p className="text-xl font-black text-emerald-600">Free Health Checkup</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Earned via points!</p>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <Card variant="glass" className="lg:col-span-2 p-10 border-none shadow-2xl shadow-gray-100/50">
          <div className="flex items-center gap-8 border-b border-gray-100 mb-10">
            {["requests", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? "text-red-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "requests" ? "Urgent Requests" : "Donation History"}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === "requests" ? (
              <motion.div 
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {pendingRequests.map((req, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all group gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-200 group-hover:rotate-6 transition-transform">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-black text-2xl text-gray-900">{req.units}</p>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                            {req.urgency}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {req.location}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} /> {req.time}</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <User size={12} className="text-red-600" /> Patient: {req.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 min-w-[150px]">
                      {(req.status === "Pending" || req.status === "Rejected") ? (
                        <Button 
                          onClick={() => handleAcceptRequest(req.id)}
                          disabled={accepting === req.id}
                          className="bg-red-600 h-12 rounded-xl text-xs font-black uppercase tracking-widest"
                        >
                          {accepting === req.id ? "Accepting..." : "Accept Request"}
                        </Button>
                      ) : (req.status === "Accepted" && (req.acceptedBy === user?._id || req.acceptedBy?._id === user?._id)) ? (
                        <div className="space-y-3">
                          <span className="block text-center px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Accepted by You</span>
                          
                          {req.requester?.phone && (
                            <a href={`tel:${req.requester.phone}`} className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-blue-100 text-blue-600 font-black text-xs uppercase hover:bg-blue-50 transition-all">
                              <Phone size={14} /> Call Patient
                            </a>
                          )}

                          {!req.isDonorConfirmed ? (
                            <Button 
                              onClick={() => handleMarkComplete(req.id)}
                              className="w-full bg-emerald-600 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                              Mark Completed
                            </Button>
                          ) : (
                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-50 text-gray-400 border border-gray-100">
                              <CheckCircle size={14} />
                              <span className="text-[10px] font-black uppercase">Pending Confirmation</span>
                            </div>
                          )}
                        </div>
                      ) : req.status === "Accepted" && req.acceptedByRole === "bloodbank" ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                          <Building2 size={16} />
                          <span className="text-[10px] font-black uppercase">Accepted by Blood Bank</span>
                        </div>
                      ) : req.status === "Accepted" && req.acceptedByRole === "donor" && (req.acceptedBy !== user?._id && req.acceptedBy?._id !== user?._id) ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                          <User size={16} />
                          <span className="text-[10px] font-black uppercase">Accepted by Another Donor</span>
                        </div>
                      ) : (
                        <span className="block text-center px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-200">{req.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {donationHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg">{item.location}</p>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{item.date} • {item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-600 font-black uppercase text-xs tracking-widest bg-emerald-50 px-4 py-2 rounded-xl">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Sidebar */}
        <div className="space-y-10">
          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-orange-100">
                <Star size={40} fill="currentColor" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-lg border border-gray-50">
                <p className="text-gray-900 font-black text-sm">4.9</p>
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Reliability Score</h3>
            <p className="text-gray-400 font-bold text-sm mb-8 leading-relaxed">Top 5% of donors in your region. Keep up the great work!</p>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">950 Points to next rank</p>
          </Card>

          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-blue-100/50 bg-gradient-to-br from-blue-600 to-indigo-600 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-4 tracking-tight">Refer a Friend</h4>
              <p className="text-white/80 font-bold text-sm leading-relaxed mb-8">Help us grow our community. Get special badges for every successful referral.</p>
              <button className="h-14 px-8 rounded-2xl bg-white text-blue-600 font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                Share Link <ArrowRight size={16} />
              </button>
            </div>
            <User size={120} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;