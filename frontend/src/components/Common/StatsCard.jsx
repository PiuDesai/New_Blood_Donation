import { Card } from "./Card";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="flex items-center gap-6 p-8 group border-none shadow-md shadow-gray-200/40 relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200/50 relative z-10",
          color
        )}>
          <Icon size={28} />
        </div>
        
        <div className="relative z-10">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-extrabold text-gray-900 leading-none">{value}</h3>
            {trend && (
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-lg mb-1 shadow-sm",
                trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {trend === "up" ? "+" : "-"}{trendValue}%
              </span>
            )}
          </div>
        </div>

        <Icon size={120} className="absolute -bottom-10 -right-10 text-gray-50 group-hover:scale-110 group-hover:text-gray-100 transition-all duration-500 opacity-50" />
      </Card>
    </motion.div>
  );
};
