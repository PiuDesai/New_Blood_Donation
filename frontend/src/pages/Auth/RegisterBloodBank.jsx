import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerBloodBank } from "../../api/api";
import { getErrorMessage } from "../../api/axios";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Building2, Mail, Lock, Phone, MapPin, FileText, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const RegisterBloodBank = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    licenseInfo: "",
    city: "",
    state: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const phoneDigits = String(formData.phone).replace(/\D/g, "").slice(-10);
    if (phoneDigits.length !== 10 || !/^[6-9]/.test(phoneDigits)) {
      setError("Enter a valid 10-digit mobile number");
      setLoading(false);
      toast.error("Invalid phone number");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: phoneDigits,
      password: formData.password,
      licenseInfo: formData.licenseInfo,
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760], // Default coords or get from city
        city: formData.city.trim(),
        state: formData.state.trim()
      }
    };

    try {
      const response = await registerBloodBank(payload);
      toast.success(response.message || "Blood Bank registered successfully!");
      navigate("/login/bloodbank");
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-white to-red-50 flex items-center justify-center p-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <Card variant="glass" className="p-10 md:p-16" hover={false}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Blood Bank Registration</h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">
              Partner with us to save lives
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
              <Input
                label="Blood Bank Name"
                icon={Building2}
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="City Blood Center"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@bloodbank.com"
            />

            <Input
              label="Phone Number"
              icon={Phone}
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />

            <Input
              label="License/Verification Info"
              icon={FileText}
              required
              value={formData.licenseInfo}
              onChange={(e) => setFormData({ ...formData, licenseInfo: e.target.value })}
              placeholder="License No: BB-12345"
            />

            <Input
              label="City"
              icon={MapPin}
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Mumbai"
            />

            <Input
              label="State"
              icon={MapPin}
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Maharashtra"
            />

            {error && (
              <div className="md:col-span-2 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="md:col-span-2 pt-4">
              <Button
                type="submit"
                className="w-full py-4 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-red-100 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span className="flex items-center gap-3">
                    Register Blood Bank <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>

            <div className="md:col-span-2 text-center mt-6">
              <p className="text-gray-400 font-bold">
                Already registered?{" "}
                <Link to="/login/bloodbank" className="text-red-600 hover:text-red-700 underline decoration-2 underline-offset-4">
                  Sign In here
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterBloodBank;
