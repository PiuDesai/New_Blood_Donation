import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { loginUser, loginAdmin, forgotPassword } from "../../api/authAPI";
import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import BackButton from "../../components/Common/BackButton";
import BloodMatrixLogo from "../../components/Common/BloodMatrixLogo";

const Login = () => {
  const { role } = useParams();
  const navigate = useNavigate(); // 
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first");
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const res = await forgotPassword(formData.email);
      if (res.success) {
        toast.success(`Reset link sent to ${formData.email}!`);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (role === "admin") {
        result = await loginAdmin(formData);
      } else {
        result = await loginUser({ ...formData, role });
      }

      if (!result?.success) {
        const msg = result?.message || "Login failed";
        setError(msg);
        toast.error(msg);
        return;
      }

      // ✅ Use context instead of manual localStorage
      login(result.user, result.token);

      toast.success(result.message || "Welcome back!");

      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate(`/${result.user.role}`);
      }

    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false); // 
    }
  };

  return (
    <>
      <BackButton />
      <BloodMatrixLogo />
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-50 via-white to-pink-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <Card variant="glass" className="p-12 text-center" hover={false}>
            
            <div className="mb-12">
              <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-pink-500 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
                <Lock size={36} />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
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

              <div className="w-full space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-300 py-3.5 shadow-sm shadow-gray-100 pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotPasswordLoading}
                    className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline disabled:opacity-50"
                  >
                    {forgotPasswordLoading ? "Sending..." : "Forgot Password?"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full h-14" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-10 text-center">
              {role !== "admin" && (
                <p className="text-gray-400">
                  New user?{" "}
                  <Link to={role === "bloodbank" ? "/register/bloodbank" : "/register"} className="text-red-600">
                    Create Account
                  </Link>
                </p>
              )}

              <button onClick={() => navigate("/role-selection")} className="text-sm text-gray-400 mt-3">
                Switch Role
              </button>
            </div>

          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Login;