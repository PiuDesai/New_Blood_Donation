import { cn } from "../../utils/cn";

export const Card = ({ children, className, variant = "white", hover = true, ...props }) => {
  const variants = {
    white: "bg-white border-gray-100 shadow-xl shadow-gray-200/50",
    glass: "bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl",
    red: "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-red-200",
  };

  return (
    <div
      className={cn(
        "rounded-[2.5rem] border p-8 transition-all duration-500",
        variants[variant],
        hover && "hover:-translate-y-2 hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
