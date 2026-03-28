import { useState, useEffect } from "react";
import { Building2, Droplets, Activity, Plus, Search, MapPin, MoreVertical } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { getBloodBankStats } from "../../api/authAPI";
import { motion } from "framer-motion";

const BloodBankDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBloodBankStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch blood bank stats:", err);
        setError("Unable to load real-time stats. Showing empty state.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inventoryData = stats?.inventory || [
    { group: "A+", units: 0, status: "No Data" },
    { group: "A-", units: 0, status: "No Data" },
    { group: "B+", units: 0, status: "No Data" },
    { group: "O+", units: 0, status: "No Data" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Blood Bank Inventory</h1>
          <p className="text-gray-500 font-medium italic">Manage and monitor blood stock levels</p>
        </div>
        <div className="flex gap-4">
          <Button className="flex items-center gap-2 shadow-blue-200/50 bg-blue-600 hover:bg-blue-700">
            <Plus size={20} />
            Update Stock
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard 
          title="Total Units" 
          value={stats?.totalUnits || 0} 
          icon={Droplets} 
          color="bg-blue-600 shadow-blue-200/50" 
        />
        <StatsCard 
          title="Donations Today" 
          value={stats?.todayDonations || 0} 
          icon={Activity} 
          color="bg-red-600 shadow-red-200/50" 
        />
        <StatsCard 
          title="Requests" 
          value={stats?.activeRequests || 0} 
          icon={Building2} 
          color="bg-purple-600 shadow-purple-200/50" 
        />
        <StatsCard 
          title="Low Stock" 
          value={stats?.lowStockAlerts || 0} 
          icon={Droplets} 
          color="bg-amber-600 shadow-amber-200/50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none bg-white shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-gray-900">Current Stock Levels</h3>
            <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50">Detailed Report</Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {inventoryData.map((item) => (
              <div key={item.group} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all group cursor-pointer text-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-extrabold text-lg mx-auto mb-4 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {item.group}
                </div>
                <p className="text-2xl font-black text-gray-900 mb-1">{item.units}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.status}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-4">Stock Alert</h3>
            <p className="text-blue-100 text-sm mb-8 opacity-90 leading-relaxed">
              Stock levels for O- and AB- are below the safety threshold. Consider organizing a blood drive.
            </p>
            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-4">
              Alert Nearby Donors
            </Button>
          </div>
          <Building2 size={160} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </Card>
      </div>
    </div>
  );
};

export default BloodBankDashboard;
