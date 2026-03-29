import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split("/")[2];
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar role={user?.role?.toLowerCase()} />
        <main className="flex-1 p-8 lg:p-14 overflow-auto">
          <div className="max-w-7xl mx-auto h-full">
            <div className="mb-12">
              <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-3">System Overview</h4>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{getPageTitle()}</h2>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
