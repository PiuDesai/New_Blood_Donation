import { useNavigate } from "react-router-dom";
import { User, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { Card } from "../../components/Common/Card";
import { motion } from "framer-motion";

const subRoles = [
  {
    id: "patient",
    title: "Patient",
    description: "Request blood for yourself or loved ones",
    icon: User,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "donor",
    title: "Donor",
    description: "Donate blood and save precious lives",
    icon: Heart,
    color: "from-red-500 to-pink-600",
  },
];

const SubRoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-red-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <motion.button 
          whileHover={{ x: -5 }}
          onClick={() => navigate("/role-selection")}
          className="flex items-center gap-3 text-gray-400 font-bold mb-12 hover:text-red-600 transition-all uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} /> Back to Main Roles
        </motion.button>

        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">User Portal</h1>
          <p className="text-gray-400 text-lg font-medium">Choose how you want to contribute today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {subRoles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              onClick={() => navigate(`/login?role=${role.id}`)}
              className="group cursor-pointer"
            >
              <Card variant="glass" className="h-full p-12 relative overflow-hidden group-hover:border-red-200 group-hover:shadow-red-100">
                <div className={`w-20 h-20 bg-gradient-to-br ${role.color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                  <role.icon size={36} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{role.title}</h3>
                <p className="text-gray-400 font-bold leading-relaxed mb-8">{role.description}</p>
                <div className="flex items-center gap-2 text-red-600 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                  Select Role <ArrowRight size={16} />
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

export default SubRoleSelection;
