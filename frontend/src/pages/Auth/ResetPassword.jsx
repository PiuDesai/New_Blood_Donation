import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import BloodMatrixLogo from "../../components/Common/BloodMatrixLogo";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, formData.password);
      if (res.success) {
        setSuccess(true);
        toast.success("Password reset successful!");
        if (res.token && res.user) {
          login(res.user, res.token);
          setTimeout(() => navigate(`/${res.user.role}/dashboard`), 3000);
        } else {
          setTimeout(() => navigate("/role-selection"), 3000);
        }
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("An error occurred. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-50 via-white to-pink-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card variant="glass" className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Password Updated</h2>
            <p className="text-gray-500 font-bold mb-8 leading-relaxed">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <Button onClick={() => navigate("/role-selection")} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700">
              Go to Login
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <BloodMatrixLogo />
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-50 via-white to-pink-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <Card variant="glass" className="p-12 text-center">
            
            <div className="mb-12">
              <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-pink-500 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
                <Lock size={36} />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                Create a new secure password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="w-full space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter new password"
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
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-300 py-3.5 shadow-sm shadow-gray-100 pl-12 pr-12"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Update Password <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <button onClick={() => navigate("/role-selection")} className="text-sm text-gray-400">
                Back to Login
              </button>
            </div>

          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;
