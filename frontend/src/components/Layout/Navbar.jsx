import { useAuth } from "../../context/AuthContext";
import { Button } from "../Common/Button";
import { LogOut, User, Bell, Search } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-tr from-red-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-200 group-hover:rotate-12 transition-transform">
            B
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter hidden md:block">SmartBlood</span>
        </div>

        <div className="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 w-96 group focus-within:bg-white focus-within:border-red-200 transition-all">
          <Search size={18} className="text-gray-400 group-focus-within:text-red-500" />
          <input 
            type="text" 
            placeholder="Search for donors, centers..." 
            className="bg-transparent border-none outline-none px-3 text-sm font-medium w-full placeholder:text-gray-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button className="text-gray-400 hover:text-red-600 transition-all relative p-2 hover:bg-red-50 rounded-xl">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-5 pl-8 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 tracking-tight">{user?.name}</p>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-gray-600 border border-gray-200 shadow-sm overflow-hidden">
            <User size={24} />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl"
          >
            <LogOut size={24} />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
