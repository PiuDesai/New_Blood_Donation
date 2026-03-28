import { Heart, Activity, Droplets, Calendar, Clock, MapPin, Search } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { useAuth } from "../../context/AuthContext";
import { getDonorStats } from "../../api/authAPI";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DonorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDonorStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch donor stats:", err);
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const donationHistory = stats?.history || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-gray-500 font-medium italic">"Your blood can save a life. You are a hero."</p>
        </div>
        <Button className="flex items-center gap-2 shadow-red-200/50 bg-red-600 hover:bg-red-700">
          <Calendar size={20} />
          Schedule Donation
        </Button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard 
          title="Total Donations" 
          value={stats?.totalDonations || 0} 
          icon={Heart} 
          color="bg-red-600 shadow-red-200/50" 
        />
        <StatsCard 
          title="Lives Saved" 
          value={stats?.livesSaved || 0} 
          icon={Activity} 
          color="bg-blue-600 shadow-blue-200/50" 
        />
        <StatsCard 
          title="Next Eligible" 
          value={stats?.nextEligible || "N/A"} 
          icon={Calendar} 
          color="bg-emerald-600 shadow-emerald-200/50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none bg-white shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-gray-900">My Donation History</h3>
            <Button variant="ghost" size="sm" className="text-red-600 font-bold hover:bg-red-50">View History</Button>
          </div>
          
          {donationHistory.length > 0 ? (
            <div className="space-y-6">
              {donationHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                      <Droplets size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.location}</p>
                      <p className="text-xs text-gray-400 font-medium">{item.date} • {item.type}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Heart size={48} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-medium italic">You haven't made any donations yet.</p>
            </div>
          )}
        </Card>

        <Card className="p-8 border-none bg-red-50/30 shadow-inner relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-gray-900">Health Profile</h3>
              <Activity size={20} className="text-red-500" />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-red-100/50">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-tight">Blood Type</span>
                <span className="text-xl font-black text-red-600">{user?.bloodGroup || "O+"}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-red-100/50">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-tight">Eligibility</span>
                <span className="text-sm font-extrabold text-emerald-600">Active</span>
              </div>
            </div>
            <p className="mt-8 text-xs text-gray-400 leading-relaxed font-medium">
              Regular donations help maintain a healthy lifestyle and save lives in your community.
            </p>
          </div>
          <Droplets size={140} className="absolute -bottom-10 -right-10 text-red-600/5 group-hover:scale-110 transition-transform duration-500" />
        </Card>
      </div>
    </div>
  );
};

export default DonorDashboard;
