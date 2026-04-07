import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/api";
import { getErrorMessage } from "../../api/axios";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { User, Mail, Lock, Phone, MapPin, Droplets, Calendar, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import BackButton from "../../components/Common/BackButton";
import BloodMatrixLogo from "../../components/Common/BloodMatrixLogo";

const genderToApi = (g) => {
  const m = { Male: "male", Female: "female", Other: "other" };
  return m[g] || String(g).toLowerCase();
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "",
    bloodGroup: "", gender: "", dateOfBirth: "", city: "", state: "",
    role: "patient"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const phoneDigits = String(formData.phone).replace(/\D/g, "").slice(-10);
    if (phoneDigits.length !== 10 || !/^[6-9]/.test(phoneDigits)) {
      setError("Enter a valid 10-digit Indian mobile number");
      setLoading(false);
      toast.error("Invalid phone number");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: phoneDigits,
      password: formData.password,
      role: formData.role,
      bloodGroup: formData.bloodGroup,
      gender: genderToApi(formData.gender),
      dateOfBirth: formData.dateOfBirth,
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760],
        city: formData.city.trim(),
        state: formData.state.trim()
      }
    };

    try {
      const response = await registerUser(payload);
      toast.success(response.message || "Registration successful. Please sign in.");
      navigate("/role-selection");
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-red-50 via-white to-blue-50 flex items-center justify-center p-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <Card variant="glass" className="p-10 md:p-16" hover={false}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Create Account</h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">
              Join our saving lives network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Register As</label>
                <div className="flex gap-4">
                  {["patient", "donor"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`flex-1 py-3 rounded-2xl font-bold border-2 transition-all capitalize ${
                        formData.role === r
                          ? "border-red-600 bg-red-50 text-red-600 shadow-md"
                          : "border-gray-100 bg-white text-gray-400 hover:border-red-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Input label="Full Name" icon={User} placeholder="Enter your full name" required
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <Input label="Email Address" icon={Mail} type="email" placeholder="email@example.com" required
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

            <Input label="Phone Number" icon={Phone} placeholder="+91 9876543210" required
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Blood Group</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <Droplets size={20} />
                </div>
                <select className="w-full bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all py-3.5 pl-12 pr-4 appearance-none shadow-sm shadow-gray-100 font-bold" required
                  value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                  <option value="">Select Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Gender</label>
              <div className="flex gap-4">
                {["Male", "Female", "Other"].map(g => (
                  <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })}
                    className={`flex-1 py-3.5 rounded-2xl font-bold border transition-all ${formData.gender === g ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-200" : "bg-white text-gray-400 border-gray-100 hover:border-red-200"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Date of Birth" icon={Calendar} type="date" required
              value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />

            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <Input label="City" icon={MapPin} placeholder="e.g. Mumbai" required
                value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <Input label="State" icon={MapPin} placeholder="e.g. Maharashtra" required
                value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-100" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : (
                  <span className="flex items-center justify-center gap-3">
                    Create Account <ArrowRight size={20} />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-gray-100">
            <p className="text-gray-400 font-bold text-sm">
              Already have an account?{" "}
              <Link to="/role-selection" className="text-red-600 hover:text-red-700 underline underline-offset-4 decoration-2">
                Sign In Instead
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
