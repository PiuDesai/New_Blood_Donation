import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Login = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowFallback(false);

    const loginPromise = loginUser({ ...formData, role });

    toast.promise(loginPromise, {
      loading: 'Authenticating...',
      success: (response) => {
        if (response.success) {
          login(response.user, response.token);
          return response.message || "Welcome back!";
        }
        throw new Error(response.message || "Login failed");
      },
      error: (err) => {
        setError(err.message || "Server connection failed.");
        setShowFallback(true);
        return err.message || "Connection failed. Try demo mode.";
      },
    });

    try {
      await loginPromise;
    } catch (err) {
      // Error handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackLogin = () => {
    const fakeUser = {
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: formData.email || `demo@${role}.com`,
      role: role,
      isDemo: true
    };
    const fakeToken = "demo-token-" + Math.random().toString(36).substr(2);
    login(fakeUser, fakeToken);
    toast.success("Logged in with demo access!");
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
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {error}
                  </div>
                  {showFallback && (
                    <button
                      type="button"
                      onClick={handleFallbackLogin}
                      className="text-xs bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldAlert size={14} /> Continue with Demo Access
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-100"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  Sign In <ArrowRight size={20} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-gray-400 font-bold text-sm">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-red-600 hover:text-red-700 underline underline-offset-4 decoration-2"
              >
                Create Account
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
