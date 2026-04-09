import React, { useState, useEffect, useRef } from "react";
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
  const [pincodeOptions, setPincodeOptions] = useState([]);
  const [loadingPincodes, setLoadingPincodes] = useState(false);

  const fileInputRef = useRef(null);
  const [photoSaving, setPhotoSaving] = useState(false);

  // State-City mapping (same idea as Register page)
  const stateCityData = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Anantapur", "Eluru", "Ongole", "Vizianagaram"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Bomdila", "Tezu", "Anini", "Khonsa"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Goalpara", "Karimganj", "Sivasagar", "Lakhimpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Monghyr", "Chapra", "Dehri", "Siwan"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Durg", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Raigarh", "Mahasamund", "Dhamtari"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Mehsana", "Surendranagar", "Porbandar", "Bharuch"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind"],
    "Himachal Pradesh": ["Shimla", "Solan", "Dharamshala", "Mandi", "Kullu", "Palampur", "Bilaspur", "Una", "Sirmaur", "Chamba", "Hamirpur", "Kinnaur", "Lahaul and Spiti"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chakradharpur", "Jamtara", "Chatra", "Koderma"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga", "Tumkur", "Raichur", "Bidar", "Hospet", "Kolar"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kasaragod", "Kottayam", "Idukki", "Pathanamthitta", "Wayanad"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Guna", "Sagar", "Ratlam", "Satna", "Morena", "Khandwa", "Burhanpur", "Ashoknagar", "Katni", "Rewa", "Vidisha"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Navi Mumbai", "Kolhapur", "Sangli", "Malegaon", "Akola", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Jalgaon", "Bhiwandi", "Ambernath", "Nanded", "Panvel", "Bhusawal", "Ulhasnagar", "Nandurbar", "Wardha", "Yavatmal", "Latur", "Gondia"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Kakching", "Ukhrul", "Senapati", "Tamenglong"],
    "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Resubelpara", "Mairang", "Nongpoh"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Mamit", "Saiha", "Lawngtlai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Kiphire", "Longleng", "Peren"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhawanipatna", "Cuttack", "Dhenkanal", "Baripada", "Jharsuguda", "Koraput", "Rayagada", "Sundargarh"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga", "Firozpur", "Kapurthala", "Phagwara", "Muktsar", "Barnala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Kishangarh", "Beawar", "Tonk", "Sawai Madhopur", "Nagaur"],
    "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo", "Jorethang", "Pelling", "Singtam"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tirupur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Udhagamandalam", "Hosur", "Rajapalayam", "Kanchipuram", "Kumbakonam", "Tiruvannamalai", "Nagercoil", "Viluppuram", "Cuddalore", "Dharmapuri", "Ariyalur", "Perambalur", "Nagapattinam", "Krishnagiri", "Namakkal", "Tiruvarur", "Theni", "Virudhunagar"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Miryalaguda", "Suryapet", "Jagtial", "Bhadradri Kothagudem", "Jangaon", "Kamareddy", "Sircilla", "Medak", "Siddipet", "Yadadri Bhuvanagiri", "Medchal Malkajgiri", "Komaram Bheem Asifabad", "Mancherial", "Nirmal"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Pratapgarh", "Kailashahar", "Belonia", "Khowai", "Ranirbazar", "Sonamura", "Kamalpur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Noida", "Gorakhpur", "Firozabad", "Jhansi", "Mughalsarai", "Mathura", "Rampur", "Shahjahanpur", "Fatehpur", "Barabanki", "Modinagar", "Hapur", "Rae Bareli", "Etawah", "Lakhimpur", "Sitapur", "Unnao", "Mainpuri", "Bulandshahr", "Badaun", "Bijnor", "Amroha", "Hathras", "Kasganj"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Kashipur", "Rudrapur", "Kotdwar", "Pithoragarh", "Udham Singh Nagar", "Champawat", "Bageshwar", "Uttarkashi"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Raniganj", "Burdwan", "Barrackpore", "Kalyani", "Salt Lake City", "Haldia", "Kharagpur", "Bally", "Baharampur", "Krishnanagar", "Barasat", "Naihati", "Dankuni", "Bansberia", "Baranagar", "South Dum Dum", "North Dum Dum", "Panihati", "Rishra", "Konnagar", "Uttarpara", "Bhatpara", "Chandannagar", "Serampore", "Ulubaria", "Budge Budge", "Hooghly-Chinsurah", "Arambagh", "Kalna", "Memari"]
  };

  const allStates = Object.keys(stateCityData);
  const getCitiesForState = (state) => stateCityData[state] || [];
  const getMaxDobForAdult = () => {
    const today = new Date();
    const adultDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return adultDate.toISOString().split("T")[0];
  };

  const sanitizeFullName = (value = "", { forSubmit = false } = {}) => {
    // Only letters and spaces allowed. Keep trailing spaces while typing.
    const cleaned = String(value).replace(/[^A-Za-z\s]/g, "");
    if (!forSubmit) return cleaned.replace(/\s{2,}/g, " ");
    return cleaned.replace(/\s{2,}/g, " ").trim();
  };
  
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
            name: sanitizeFullName(userData.name || "", { forSubmit: true }),
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

  useEffect(() => {
    const city = formData.location.city?.trim();
    const state = formData.location.state?.trim();

    if (!city) {
      setPincodeOptions([]);
      return;
    }

    const fetchPincodesForCity = async () => {
      setLoadingPincodes(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(city)}`);
        const data = await res.json();
        const offices = data?.[0]?.PostOffice || [];

        const filteredByState = offices.filter((office) => {
          if (!state) return true;
          return String(office.State || "").toLowerCase() === state.toLowerCase();
        });

        const uniquePincodes = [...new Set(filteredByState.map((office) => String(office.Pincode || "").trim()).filter(Boolean))];
        setPincodeOptions(uniquePincodes);

        if (uniquePincodes.length > 0) {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              pincode: uniquePincodes.includes(prev.location.pincode) ? prev.location.pincode : uniquePincodes[0]
            }
          }));
        }
      } catch {
        setPincodeOptions([]);
      } finally {
        setLoadingPincodes(false);
      }
    };

    fetchPincodesForCity();
  }, [formData.location.city, formData.location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("location.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
          ...(field === "state" ? { city: "", pincode: "" } : null),
          ...(field === "city" ? { pincode: "" } : null)
        }
      }));
    } else if (name === "name") {
      setFormData((prev) => ({ ...prev, name: sanitizeFullName(value) }));
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
      const payload = { ...formData, name: sanitizeFullName(formData.name, { forSubmit: true }) };
      if (payload.dateOfBirth) {
        const dob = new Date(payload.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 18) {
          toast.error("User must be at least 18 years old");
          setUpdating(false);
          return;
        }
      }

      const res = await updateProfile(payload);
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

  const handlePickProfilePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveProfilePhoto = async () => {
    if (photoSaving) return;
    setPhotoSaving(true);
    try {
      // Update preview immediately
      setFormData((prev) => ({ ...prev, profilePhoto: "" }));

      const res = await updateProfile({ profilePhoto: "" });
      if (res.success) {
        toast.success("Profile photo removed!");
        updateUser(res.user);
      } else {
        toast.error(res.message || "Failed to remove profile photo");
      }
    } catch {
      toast.error("An error occurred while removing profile photo");
    } finally {
      setPhotoSaving(false);
    }
  };

  const compressImageToDataUrl = async (file) => {
    // Backend uses default `express.json()` size limit, so we must keep payload small.
    const MAX_DATA_URL_LENGTH = 80_000; // ~80KB chars (safe under typical 100KB limit)
    const src = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });

      // Try a few size/quality combinations until it fits.
      const candidates = [
        { maxDim: 256, quality: 0.7 },
        { maxDim: 224, quality: 0.65 },
        { maxDim: 192, quality: 0.6 },
        { maxDim: 160, quality: 0.55 },
        { maxDim: 128, quality: 0.5 },
      ];

      for (const c of candidates) {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, c.maxDim / img.width, c.maxDim / img.height);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/jpeg", c.quality);
        if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
      }

      return null;
    } finally {
      URL.revokeObjectURL(src);
    }
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Allow re-selecting the same file again.
    e.target.value = "";

    // Basic client-side validation to avoid extremely large payloads.
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size should be <= 4MB");
      return;
    }

    setPhotoSaving(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      if (!dataUrl) {
        toast.error("Image is too large. Please choose a smaller photo.");
        return;
      }

      // Update preview immediately
      setFormData((prev) => ({ ...prev, profilePhoto: dataUrl }));

      const res = await updateProfile({ profilePhoto: dataUrl });
      if (res.success) {
        toast.success("Profile photo updated!");
        updateUser(res.user); // persists to localStorage; will remain after refresh
      } else {
        toast.error(res.message || "Failed to update profile photo");
      }
    } catch (err) {
      toast.error("An error occurred while updating profile photo");
    } finally {
      setPhotoSaving(false);
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
                <button
                  type="button"
                  onClick={handlePickProfilePhoto}
                  disabled={photoSaving}
                  className={`absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-900 hover:bg-red-600 hover:text-white transition-all border border-gray-100 ${
                    photoSaving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <Camera size={18} />
                </button>

                {formData.profilePhoto && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePhoto}
                    disabled={photoSaving}
                    className={`absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all border border-gray-100 ${
                      photoSaving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    title="Remove photo"
                    aria-label="Remove profile photo"
                  >
                    ✕
                  </button>
                )}
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
                          onKeyDown={(e) => {
                            // Block direct number entry.
                            if (e.key.length === 1 && /[0-9]/.test(e.key)) e.preventDefault();
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const text = e.clipboardData.getData("text");
                            setFormData((prev) => ({ ...prev, name: sanitizeFullName(text) }));
                          }}
                          inputMode="text"
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
                          disabled
                          className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-100/50 text-gray-400 cursor-not-allowed outline-none px-6 transition-all text-sm font-bold appearance-none"
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
                          max={getMaxDobForAdult()}
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
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">State</label>
                        <select
                          name="location.state"
                          value={formData.location.state}
                          onChange={handleInputChange}
                          className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-red-200 outline-none px-6 transition-all text-sm font-bold appearance-none"
                        >
                          <option value="">Select State</option>
                          {allStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">City</label>
                        <select
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleInputChange}
                          disabled={!formData.location.state}
                          className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-red-200 outline-none px-6 transition-all text-sm font-bold appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {formData.location.state ? "Select City" : "Select State First"}
                          </option>
                          {getCitiesForState(formData.location.state).map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest ml-1">Pincode</label>
                        {pincodeOptions.length > 0 ? (
                          <select
                            name="location.pincode"
                            value={formData.location.pincode}
                            onChange={handleInputChange}
                            className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-red-200 outline-none px-6 transition-all text-sm font-bold appearance-none"
                          >
                            {pincodeOptions.map((pin) => (
                              <option key={pin} value={pin}>
                                {pin}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            name="location.pincode"
                            value={formData.location.pincode}
                            onChange={handleInputChange}
                            placeholder={loadingPincodes ? "Loading pincodes..." : "Select city first"}
                            disabled={!formData.location.city || loadingPincodes}
                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        )}
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
