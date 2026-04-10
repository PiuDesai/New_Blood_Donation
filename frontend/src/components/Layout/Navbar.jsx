import { useAuth } from "../../context/AuthContext";
import { Button } from "../Common/Button";
import { LogOut, User, Search } from "lucide-react";
import NotificationBell from "../NotificationBell";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { dashboardPath } from "../../utils/rolePaths";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Navigate to the appropriate search page based on role
    const role = user?.role?.toLowerCase();
    if (role === "patient") {
      navigate(`/patient/find?q=${encodeURIComponent(searchQuery)}`);
    } else if (role === "donor") {
      navigate(`/donor/dashboard?q=${encodeURIComponent(searchQuery)}`);
    } else if (role === "bloodbank") {
      navigate(`/bloodbank/nearby-donors?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-10">
        <div 
          onClick={() => navigate(dashboardPath(user?.role))}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-12 h-12 bg-gradient-to-tr from-red-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-200 group-hover:rotate-12 transition-transform">
            B
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter hidden md:block">BloodMatrix</span>
        </div>

        <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 w-96 group focus-within:bg-white focus-within:border-red-200 transition-all">
          <Search size={18} className="text-gray-400 group-focus-within:text-red-500" />
          <input
            type="text"
            placeholder="Search for donors, centers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none px-3 text-sm font-medium w-full placeholder:text-gray-300"
          />
        </form>
      </div>

      <div className="flex items-center gap-6">
        {/* Live notification bell */}
        <NotificationBell />

        <div 
          onClick={() => navigate(`/${user?.role}/profile`)}
          className="flex items-center gap-5 pl-6 border-l border-gray-100 cursor-pointer group hover:bg-gray-50 transition-all rounded-2xl p-2"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 tracking-tight">{user?.name}</p>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-gray-600 border border-gray-200 shadow-sm overflow-hidden group-hover:border-red-200 group-hover:shadow-red-50 transition-all">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={24} />
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl ml-2"
        >
          <LogOut size={24} />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
