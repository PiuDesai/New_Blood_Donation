import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { loginUser, loginAdmin } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const Login = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "patient";
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMessage, setDemoMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDemoMessage("");

    try {
      let result;

      if (role === "admin") {
        result = await loginAdmin(formData);
        console.log("LOGIN RESULT:", result);  // ✅ ONLY admin goes here
      } else {
        result = await loginUser({ ...formData, role }); // ✅ all others unchanged
      }

      if (result.success) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        if (result.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate(`/${result.user.role}`);
        }
      }

      // ❗ IMPORTANT: ADD THIS BLOCK
      else {
        alert(result.message || "Login failed"); // ✅ THIS FIXES YOUR ISSUE
      }

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      if (!demoMessage) setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card variant="glass" className="p-12 text-center" hover={false}>
          <div className="mb-12">
            <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-pink-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-red-200 mx-auto mb-6 transform -rotate-6">
              <Lock size={36} />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">
              Accessing <span className="text-red-600">{role}</span> Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </motion.div>
              )}
              {demoMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-amber-50 text-amber-600 p-4 rounded-2xl text-sm font-bold border border-amber-100 flex items-center gap-3"
                >
                  <Loader2 className="animate-spin" size={16} />
                  {demoMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full py-5 text-lg group" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  Sign In
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 space-y-4">
            <p className="text-gray-400 font-medium">
              Don't have an account?{" "}
              <Link to={`/register?role=${role}`} className="text-red-600 font-black hover:underline underline-offset-4">
                Join Now
              </Link>
            </p>
            <button
              onClick={() => navigate("/role-selection")}
              className="text-sm font-bold text-gray-300 hover:text-gray-500 transition-colors uppercase tracking-widest"
            >
              &larr; Switch Role
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
