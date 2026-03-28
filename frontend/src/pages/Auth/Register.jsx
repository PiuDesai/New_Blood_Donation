import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { User, Mail, Lock, Phone, MapPin, Droplets, Calendar, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "patient";
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "",
    bloodGroup: "", gender: "", dateOfBirth: "", city: "", state: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMessage, setDemoMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDemoMessage("");

    const backendData = {
      ...formData,
      role,
      location: {
        type: "Point",
        coordinates: [77.1025, 28.7041],
        city: formData.city,
        state: formData.state,
      },
    };

    try {
      const result = await registerUser(backendData);
      if (result.success) {
        if (result.message?.includes("Demo Mode")) {
          setDemoMessage(result.message);
          setTimeout(() => login(result.user, result.token), 1500);
        } else {
          login(result.user, result.token);
        }
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      if (!demoMessage) setLoading(false);
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
              Joining as <span className="text-red-600">{role}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
              <Input label="Full Name" icon={User} placeholder="Enter your full name" required
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <Input label="Email Address" icon={Mail} type="email" placeholder="email@example.com" required
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

            <Input label="Phone Number" icon={Phone} placeholder="+1 234 567 890" required
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

            <Input label="Password" icon={Lock} type="password" placeholder="••••••••" required
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Blood Group</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <Droplets size={20} />
                </div>
                <select className="w-full bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all py-3.5 pl-12 pr-4 appearance-none shadow-sm shadow-gray-100" required
                  value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                  <option value="">Select Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            <Input label="Date of Birth" icon={Calendar} type="date" required
              value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />

            <Input label="City" icon={MapPin} placeholder="e.g. New York" required
              value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />

            <Input label="State" icon={MapPin} placeholder="e.g. NY" required
              value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />

            <div className="md:col-span-2 pt-6 space-y-6">
              <AnimatePresence>
                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">{error}</motion.div>}
                {demoMessage && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 text-amber-600 p-4 rounded-2xl text-sm font-bold border border-amber-100 flex items-center gap-3"><Loader2 className="animate-spin" size={16} />{demoMessage}</motion.div>}
              </AnimatePresence>

              <Button type="submit" className="w-full py-5 text-lg group" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
              </Button>

              <p className="text-center text-gray-400 font-medium">
                Already have an account?{" "}
                <Link to={`/login?role=${role}`} className="text-red-600 font-black hover:underline underline-offset-4">Sign In</Link>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
