import { cn } from "../../utils/cn";

export const Input = ({ label, error, icon: Icon, className, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input
          className={cn(
            "w-full bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-300 py-3.5 shadow-sm shadow-gray-100",
            Icon ? "pl-12 pr-4" : "px-4",
            error && "border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  );
};
