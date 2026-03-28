import { cn } from "../../utils/cn";

export const Button = ({ className, variant = "primary", size = "md", children, ...props }) => {
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200",
    secondary: "bg-white text-gray-800 border border-gray-100 hover:bg-gray-50 shadow-sm",
    outline: "bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        "rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
