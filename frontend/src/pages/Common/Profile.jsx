import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Droplets, Shield, Camera, Save, Key,
  ChevronRight, ArrowLeft, Loader2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, changePassword } from "../../api/authAPI";
import { Button } from "../../components/Common/Button";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { dashboardPath } from "../../utils/rolePaths";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    location: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      coordinates: [0, 0]
    },
    profilePhoto: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success) {
          const userData = res.user;
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            gender: userData.gender || "",
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
            bloodGroup: userData.bloodGroup || "",
            location: {
              address: userData.location?.address || "",
              city: userData.location?.city || "",
              state: userData.location?.state || "",
              pincode: userData.location?.pincode || "",
              coordinates: userData.location?.coordinates || [0, 0]
            },
            profilePhoto: userData.profilePhoto || ""
          });
        }
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("location.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success("Profile updated successfully!");
        // Update local auth context user data
        updateUser(res.user);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setUpdating(true);
    try {
      const res = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.success) {
        toast.success("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Button 
            onClick={() => navigate(dashboardPath(user.role))} 
            variant="ghost" 
            className="flex items-center gap-2 p-0 h-auto text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest transition-all mb-4"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Account Settings</h2>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="glass" className="p-8 border-none shadow-2xl shadow-gray-100/50 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-red-500 to-red-600 p-1 shadow-2xl shadow-red-200">
                  <div className="w-full h-full rounded-[2.3rem] bg-white overflow-hidden flex items-center justify-center">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-red-500" />
                    )}
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-900 hover:bg-red-600 hover:text-white transition-all border border-gray-100">
                  <Camera size={18} />
                </button>
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-gray-900">{formData.name}</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                  {user?.role} • {formData.bloodGroup || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-2">
              {[
                { id: "personal", label: "Personal Info", icon: User },
                { id: "location", label: "Location", icon: MapPin },
                { id: "security", label: "Security", icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    activeTab === tab.id 
                    ? "bg-red-600 text-white shadow-xl shadow-red-100" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={16} />
                    {tab.label}
                  </div>
                  <ChevronRight size={14} className={activeTab === tab.id ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
            </div>
          </Card>

          {/* Badge Info */}
          <Card className="p-8 border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="font-black text-lg">Trust Score</h4>
                <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest">Verified Account</p>
              </div>
            </div>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-4 backdrop-blur-md">
              <div className="bg-white h-full w-[85%] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
            </div>
            <p className="text-blue-50 text-xs font-bold leading-relaxed">
              Your profile is 85% complete. Complete your location details to increase your visibility.
            </p>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Personal Information</h3>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your identity details</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Full Name</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Email Address</label>
                        <Input
                          name="email"
                          value={formData.email}
                          disabled
                          className="h-14 rounded-2xl border-gray-100 bg-gray-100/50 text-gray-400 cursor-not-allowed text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Phone Number</label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          disabled
                          className="h-14 rounded-2xl border-gray-100 bg-gray-100/50 text-gray-400 cursor-not-allowed text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-red-200 outline-none px-6 transition-all text-sm font-bold appearance-none"
                        >
                          <option value="">Select Blood Group</option>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-red-200 outline-none px-6 transition-all text-sm font-bold appearance-none"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Date of Birth</label>
                        <Input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-100 font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all"
                      >
                        {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Location Details</h3>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Where you can be reached</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Street Address</label>
                      <Input
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleInputChange}
                        placeholder="123 Main St"
                        className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">City</label>
                        <Input
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">State</label>
                        <Input
                          name="location.state"
                          value={formData.location.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Pincode</label>
                        <Input
                          name="location.pincode"
                          value={formData.location.pincode}
                          onChange={handleInputChange}
                          placeholder="000000"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-sm">
                        <Info size={20} />
                      </div>
                      <div>
                        <p className="text-blue-900 font-black text-sm mb-1 uppercase tracking-tight">Geo-location Tip</p>
                        <p className="text-blue-700/70 text-xs font-bold leading-relaxed">
                          Accurate location details help donors and patients find you faster during emergencies. Your coordinates are automatically updated.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-100 font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all"
                      >
                        {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Update Location
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security Settings</h3>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Protect your account</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-8">
                    <div className="space-y-6 max-w-xl">
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Current Password</label>
                        <Input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">New Password</label>
                        <Input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Confirm New Password</label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-100 font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all"
                      >
                        {updating ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
