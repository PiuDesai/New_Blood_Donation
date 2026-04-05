import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, HeartPulse, Droplets,
  User, Settings, HelpCircle, Activity, FlaskConical, Award
} from "lucide-react";
import { cn } from "../../utils/cn";

const Sidebar = ({ role }) => {
  const getLinks = () => {
    const common = [
      { to: `/${role}/profile`, icon: User, label: "My Profile" },
      { to: `/${role}/help`, icon: HelpCircle, label: "Support" },
    ];

    const roleSpecific = {
      admin: [
        { to: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
        { to: "/admin/dashboard/pending-donors", icon: Users, label: "Donor Requests" },
        { to: "/admin/dashboard/pending-bloodbanks", icon: Users, label: "Blood Bank Requests" },
        { to: "/admin/dashboard/donors", icon: Users, label: "All Donors" },
        { to: "/admin/dashboard/bloodbanks", icon: HeartPulse, label: "All Blood Banks" }
      ],
      donor: [
        { to: "/donor/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
        { to: "/donor/schedule", icon: HeartPulse, label: "Find Camps" },
        { to: "/donor/certificates", icon: Award, label: "Certificates" },
      ],
      patient: [
        { to: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
        { to: "/patient/requests", icon: HeartPulse, label: "My Requests" },
        { to: "/patient/find", icon: Droplets, label: "Search Blood" },
        { to: "/patient/lab", icon: FlaskConical, label: "Home Lab Tests" },
        { to: "/patient/report-analyzer", icon: FlaskConical, label: "Report Analyzer" }
      ],
      bloodbank: [
        { to: "/bloodbank", icon: LayoutDashboard, label: "Inventory", end: true },
        { to: "/bloodbank/requests", icon: HeartPulse, label: "Incoming Requests" },
        { to: "/bloodbank/test-bookings", icon: FlaskConical, label: "Home Test Requests" },
        { to: "/bloodbank/nearby-donors", icon: Users, label: "Donors in city" },
      ],
    };

    const currentRoleLinks = roleSpecific[role] || roleSpecific[role?.toLowerCase()] || [];
    return [...currentRoleLinks, ...common];
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-100 hidden lg:flex flex-col h-[calc(100vh-96px)] sticky top-24 z-30">
      <div className="flex-1 py-10 px-8 space-y-3">
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end === true}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all duration-300 group text-sm tracking-tight",
                isActive
                  ? "bg-red-50 text-red-600 shadow-sm shadow-red-100"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <link.icon size={22} className="group-hover:scale-110 transition-transform" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-8">
        <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-red-100 overflow-hidden relative group cursor-pointer">
          <div className="relative z-10">
            <h4 className="font-black text-xl mb-2 tracking-tight">Emergency?</h4>
            <p className="text-red-100 text-xs font-bold mb-6 leading-relaxed">
              Our 24/7 hotline is here to help you find blood instantly.
            </p>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl text-xs font-black transition-all border border-white/20 uppercase tracking-widest">
              Call Now
            </button>
          </div>
          <HeartPulse size={140} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
