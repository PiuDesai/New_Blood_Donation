import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/authAPI";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import BloodMatrixLogo from "../../components/Common/BloodMatrixLogo";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Please enter your email address");
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccess(true);
        toast.success(`Reset link sent to ${email}!`);
      } else {
        toast.error(res.message || "Failed to send reset link");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send reset link. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
      
      <BloodMatrixLogo />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card variant="glass" className="p-8 border-none shadow-2xl shadow-gray-100/50">
            {!success ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-4">
                    <Mail size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Forgot Password?</h2>
                  <p className="text-gray-500 font-bold text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest h-12 rounded-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Remember your password?{" "}
                    <button
                      onClick={() => navigate("/role-selection")}
                      className="text-red-600 hover:text-red-700 font-black"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-500 font-bold text-sm mb-6">
                  We've sent a password reset link to:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-900 font-black">{email}</p>
                </div>
                <p className="text-gray-400 text-xs mb-6">
                  Click the link in the email to reset your password. The link will expire in 15 minutes.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/role-selection")}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-black uppercase tracking-widest h-12 rounded-xl"
                  >
                    Back to Sign In
                  </Button>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="w-full text-red-600 hover:text-red-700 font-black text-sm"
                  >
                    Didn't receive the email? Try again
                  </button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
