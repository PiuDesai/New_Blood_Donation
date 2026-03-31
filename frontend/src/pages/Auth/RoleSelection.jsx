import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Building2, ArrowRight } from "lucide-react";
import { Card } from "../../components/Common/Card";
import { motion } from "framer-motion";

const roles = [
  {
    id: "user",
    title: "User",
    description: "Donor or Patient",
    icon: User,
    color: "from-red-500 to-pink-600",
  },
  {
    id: "bloodbank",
    title: "Blood Bank",
    description: "Manage blood stocks",
    icon: Building2,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "admin",
    title: "Admin",
    description: "System administration",
    icon: ShieldCheck,
    color: "from-purple-500 to-violet-600",
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-red-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-bold text-xs uppercase tracking-[0.3em] mb-6 border border-red-100 shadow-sm"
          >
            Portal Selection
          </motion.div>
          <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">Choose Your Path</h1>
          <p className="text-gray-400 text-lg font-medium">Select your portal to continue saving lives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              onClick={() => {
                if (role.id === "user") navigate("/sub-role-selection");
                else if (role.id === "bloodbank") navigate("/register/bloodbank");
                else navigate(`/login/${role.id}`);
              }}
              className="group cursor-pointer"
            >
              <Card variant="glass" className="h-full p-12 relative overflow-hidden group-hover:border-red-200 group-hover:shadow-red-100">
                <div className={`w-20 h-20 bg-gradient-to-br ${role.color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <role.icon size={36} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{role.title}</h3>
                <p className="text-gray-400 font-bold leading-relaxed mb-8">{role.description}</p>
                <div className="flex items-center gap-2 text-red-600 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                  Proceed <ArrowRight size={16} />
                </div>
                
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${role.color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`} />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
