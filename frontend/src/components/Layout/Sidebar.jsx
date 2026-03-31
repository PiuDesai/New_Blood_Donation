import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, HeartPulse, Droplets, Settings, HelpCircle, Activity, Building2 } from "lucide-react";
import { cn } from "../../utils/cn";

const Sidebar = ({ role }) => {
  const getLinks = () => {
    const common = [
      { to: `/${role}/settings`, icon: Settings, label: "Settings" },
      { to: `/${role}/help`, icon: HelpCircle, label: "Support" },
    ];

    const roleSpecific = {
      admin: [
        { to: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
        { to: "/admin/dashboard/pending-donors", icon: Users, label: "Donor Requests" },
        { to: "/admin/dashboard/pending-bloodbanks", icon: Users, label: "Blood Bank Requests" }
      ],
      donor: [
        { to: "/donor", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/donor/history", icon: Activity, label: "Donation History" },
        { to: "/donor/schedule", icon: HeartPulse, label: "Find Camps" },
      ],
      patient: [
        { to: "/patient", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/patient/requests", icon: HeartPulse, label: "My Requests" },
        { to: "/patient/find", icon: Droplets, label: "Search Blood" },
      ],
      bloodbank: [
        { to: "/bloodbank", icon: LayoutDashboard, label: "Inventory" },
        { to: "/bloodbank/requests", icon: HeartPulse, label: "Incoming Requests" },
        { to: "/bloodbank/donations", icon: Droplets, label: "Donations" },
      ],
    };

    return [...(roleSpecific[role] || []), ...common];
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-100 hidden lg:flex flex-col h-[calc(100vh-96px)] sticky top-24 z-30">
      <div className="flex-1 py-10 px-8 space-y-3">
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
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
      
      
    </aside>
  );
};

export default Sidebar;
