import { HeartPulse, Droplets, Activity, Search, Plus, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { useAuth } from "../../context/AuthContext";
import { getPatientStats } from "../../api/authAPI";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPatientStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch patient stats:", err);
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const myRequests = stats?.requests || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Hello, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-gray-500 font-medium">Request blood or search for nearby donors</p>
        </div>
        <Button className="flex items-center gap-2 shadow-red-200/50 bg-red-600 hover:bg-red-700">
          <Plus size={20} />
          New Blood Request
        </Button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard 
          title="Active Requests" 
          value={stats?.activeRequests || 0} 
          icon={HeartPulse} 
          color="bg-red-600 shadow-red-200/50" 
        />
        <StatsCard 
          title="Donors Found" 
          value={stats?.donorsFound || 0} 
          icon={Activity} 
          color="bg-blue-600 shadow-blue-200/50" 
        />
        <StatsCard 
          title="Nearby Centers" 
          value={stats?.nearbyCenters || 0} 
          icon={MapPin} 
          color="bg-emerald-600 shadow-emerald-200/50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none bg-white shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-gray-900">My Blood Requests</h3>
            <Button variant="ghost" size="sm" className="text-red-600 font-bold hover:bg-red-50">View All</Button>
          </div>
          
          {myRequests.length > 0 ? (
            <div className="space-y-6">
              {myRequests.map((req, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition-all group gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-red-100/50 group-hover:rotate-12 transition-transform">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-extrabold text-gray-900">{req.units}</p>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                          req.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {req.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{req.hospital} • {req.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                    req.status === "Approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <HeartPulse size={48} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-medium italic">You haven't made any blood requests yet.</p>
            </div>
          )}
        </Card>

        <Card className="p-8 border-none bg-blue-600 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-4 tracking-tight">Need Urgent Help?</h3>
            <p className="text-blue-100 text-sm mb-8 opacity-90 leading-relaxed">
              Find blood donors nearby instantly or contact the nearest blood bank in case of emergencies.
            </p>
            <div className="space-y-3">
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-4">
                Search Donors
              </Button>
              <Button variant="ghost" className="w-full text-white border border-white/20 hover:bg-white/10 font-bold">
                Contact Centers
              </Button>
            </div>
          </div>
          <MapPin size={180} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
