import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { registerUser } from "../../api/api";
import { getErrorMessage } from "../../api/axios";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { User, Mail, Lock, Phone, MapPin, Droplets, Calendar, Loader2, ArrowRight, Eye, EyeOff, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import BloodMatrixLogo from "../../components/Common/BloodMatrixLogo";
import { useAuth } from "../../context/AuthContext";

const genderToApi = (g) => {
  const m = { Male: "male", Female: "female", Other: "other" };
  return m[g] || String(g).toLowerCase();
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "",
    bloodGroup: "", gender: "", dateOfBirth: "", city: "", state: "",
    role: "patient"
  });

  // Read role from URL parameters
  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    if (roleFromUrl && ['patient', 'donor'].includes(roleFromUrl)) {
      setFormData(prev => ({ ...prev, role: roleFromUrl }));
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [nameError, setNameError] = useState("");
  const [cityStateError, setCityStateError] = useState("");

  // State-City mapping data
  const stateCityData = {
    "Andhra Pradesh": [
      "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", 
      "Tirupati", "Kakinada", "Anantapur", "Eluru", "Ongole", "Vizianagaram",
      "Chittoor", "Anakapalli", "Tadipatri", "Hindupur", "Bapatla", "Palnadu",
      "Narsaraopet", "Srikakulam", "Machilipatnam", "Tenali", "Proddatur", "Nandyal"
    ],
    "Arunachal Pradesh": [
      "Itanagar", "Tawang", "Ziro", "Pasighat", "Bomdila", "Tezu", "Anini", "Khonsa"
    ],
    "Assam": [
      "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", 
      "Bongaigaon", "Goalpara", "Karimganj", "Sivasagar", "Lakhimpur"
    ],
    "Bihar": [
      "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", 
      "Arrah", "Begusarai", "Katihar", "Monghyr", "Chapra", "Dehri", "Siwan"
    ],
    "Chhattisgarh": [
      "Raipur", "Bhilai", "Bilaspur", "Durg", "Korba", "Rajnandgaon", "Jagdalpur", 
      "Ambikapur", "Raigarh", "Mahasamund", "Dhamtari"
    ],
    "Goa": [
      "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim"
    ],
    "Gujarat": [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", 
      "Gandhinagar", "Anand", "Nadiad", "Mehsana", "Surendranagar", "Porbandar", "Bharuch"
    ],
    "Haryana": [
      "Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", 
      "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind"
    ],
    "Himachal Pradesh": [
      "Shimla", "Solan", "Dharamshala", "Mandi", "Kullu", "Palampur", "Bilaspur", 
      "Una", "Sirmaur", "Chamba", "Hamirpur", "Kinnaur", "Lahaul and Spiti"
    ],
    "Jharkhand": [
      "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", 
      "Giridih", "Ramgarh", "Medininagar", "Chakradharpur", "Jamtara", "Chatra", "Koderma"
    ],
    "Karnataka": [
      "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", 
      "Bellary", "Bijapur", "Shimoga", "Tumkur", "Raichur", "Bidar", "Hospet", "Kolar"
    ],
    "Kerala": [
      "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", 
      "Palakkad", "Malappuram", "Kannur", "Kasaragod", "Kottayam", "Idukki", "Pathanamthitta", "Wayanad"
    ],
    "Madhya Pradesh": [
      "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Guna", "Sagar", "Ratlam", 
      "Satna", "Morena", "Khandwa", "Burhanpur", "Ashoknagar", "Katni", "Rewa", "Vidisha"
    ],
    "Maharashtra": [
      "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", 
      "Navi Mumbai", "Kolhapur", "Sangli", "Malegaon", "Akola", "Dhule", "Ahmednagar", 
      "Chandrapur", "Parbhani", "Jalgaon", "Bhiwandi", "Ambernath", "Nanded", "Panvel", 
      "Bhusawal", "Ulhasnagar", "Nandurbar", "Wardha", "Yavatmal", "Latur", "Gondia"
    ],
    "Manipur": [
      "Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Kakching", "Ukhrul", "Senapati", "Tamenglong"
    ],
    "Meghalaya": [
      "Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Resubelpara", "Mairang", "Nongpoh"
    ],
    "Mizoram": [
      "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Mamit", "Saiha", "Lawngtlai"
    ],
    "Nagaland": [
      "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Kiphire", "Longleng", "Peren"
    ],
    "Odisha": [
      "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", 
      "Bhawanipatna", "Cuttack", "Dhenkanal", "Baripada", "Jharsuguda", "Koraput", "Rayagada", "Sundargarh"
    ],
    "Punjab": [
      "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", 
      "Hoshiarpur", "Batala", "Moga", "Firozpur", "Kapurthala", "Phagwara", "Muktsar", "Barnala"
    ],
    "Rajasthan": [
      "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", 
      "Bharatpur", "Sikar", "Pali", "Kishangarh", "Beawar", "Tonk", "Sawai Madhopur", "Nagaur"
    ],
    "Sikkim": [
      "Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo", "Jorethang", "Pelling", "Singtam"
    ],
    "Tamil Nadu": [
      "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tirupur", 
      "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", 
      "Udhagamandalam", "Hosur", "Rajapalayam", "Kanchipuram", "Kumbakonam", "Tiruvannamalai", 
      "Nagercoil", "Viluppuram", "Cuddalore", "Dharmapuri", "Ariyalur", "Perambalur", "Nagapattinam", 
      "Krishnagiri", "Namakkal", "Tiruvarur", "Theni", "Virudhunagar"
    ],
    "Telangana": [
      "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", 
      "Mahbubnagar", "Nalgonda", "Adilabad", "Miryalaguda", "Suryapet", "Jagtial", 
      "Bhadradri Kothagudem", "Jangaon", "Kamareddy", "Sircilla", "Medak", "Siddipet", 
      "Yadadri Bhuvanagiri", "Medchal Malkajgiri", "Komaram Bheem Asifabad", "Mancherial", "Nirmal"
    ],
    "Tripura": [
      "Agartala", "Udaipur", "Dharmanagar", "Pratapgarh", "Kailashahar", "Belonia", 
      "Khowai", "Ranirbazar", "Sonamura", "Kamalpur"
    ],
    "Uttar Pradesh": [
      "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", 
      "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Noida", "Gorakhpur", "Firozabad", 
      "Jhansi", "Mughalsarai", "Mathura", "Rampur", "Shahjahanpur", "Fatehpur", "Barabanki", 
      "Modinagar", "Hapur", "Rae Bareli", "Etawah", "Lakhimpur", "Sitapur", "Unnao", 
      "Mainpuri", "Bulandshahr", "Badaun", "Bijnor", "Amroha", "Hathras", "Kasganj"
    ],
    "Uttarakhand": [
      "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Kashipur", "Rudrapur", 
      "Kotdwar", "Pithoragarh", "Udham Singh Nagar", "Champawat", "Bageshwar", "Uttarkashi"
    ],
    "West Bengal": [
      "Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Raniganj", "Burdwan", 
      "Barrackpore", "Kalyani", "Salt Lake City", "Haldia", "Kharagpur", "Bally", "Baharampur", 
      "Krishnanagar", "Barasat", "Naihati", "Dankuni", "Bansberia", "Baranagar", "South Dum Dum", 
      "North Dum Dum", "Panihati", "Rishra", "Konnagar", "Uttarpara", "Bhatpara", "Chandannagar", 
      "Serampore", "Ulubaria", "Budge Budge", "Hooghly-Chinsurah", "Arambagh", "Kalna", "Memari"
    ]
  };

  // Get all states for dropdown
  const allStates = Object.keys(stateCityData);

  // Get cities based on selected state
  const getCitiesForState = (state) => {
    return stateCityData[state] || [];
  };

  // Handle state change
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData({ 
      ...formData, 
      state: selectedState,
      city: "" // Reset city when state changes
    });
    setCityStateError("");
  };

  // Handle city change
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setFormData({ ...formData, city: selectedCity });
    setCityStateError("");
  };

  // Validate city-state relationship
  const handleCityStateBlur = () => {
    if (formData.state && formData.city) {
      const validCities = getCitiesForState(formData.state);
      if (!validCities.includes(formData.city)) {
        setCityStateError("City does not belong to the selected state");
      } else {
        setCityStateError("");
      }
    }
  };

  // Validate name field - only letters allowed
  const handleNameChange = (e) => {
    const value = e.target.value;
    
    // Check for invalid characters (numbers and special characters)
    if (/[^a-zA-Z\s]/.test(value)) {
      setNameError("Name can only contain letters and spaces");
    } else {
      // Only allow letters (including spaces for full names)
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, name: lettersOnly });
      
      // Clear error if valid
      if (lettersOnly.trim().length >= 2) {
        setNameError("");
      }
    }
    
    console.log("Name change:", { original: value, hasInvalidChars: /[^a-zA-Z\s]/.test(value) });
  };

  const handleNameBlur = () => {
    const name = formData.name.trim();
    console.log("Name blur validation:", { name, length: name.length, regexTest: /^[a-zA-Z\s]+$/.test(name) });
    if (name.length < 2) {
      setNameError("Name must be at least 2 characters long");
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      setNameError("Name can only contain letters");
    } else {
      setNameError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate name field
    const name = formData.name.trim();
    if (name.length < 2) {
      setError("Name must be at least 2 characters long");
      setLoading(false);
      toast.error("Invalid name");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setError("Name can only contain letters");
      setLoading(false);
      toast.error("Name can only contain letters");
      return;
    }

    // Validate city-state relationship
    if (formData.state && formData.city) {
      const validCities = getCitiesForState(formData.state);
      if (!validCities.includes(formData.city)) {
        setError("City does not belong to the selected state");
        setLoading(false);
        toast.error("City does not belong to the selected state");
        return;
      }
    }

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
      <button
        onClick={() => window.history.back()}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "500",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)",
          transition: "all 0.2s ease",
          zIndex: 9999,
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#b91c1c";
          e.target.style.boxShadow = "0 3px 8px rgba(220, 38, 38, 0.35)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#dc2626";
          e.target.style.boxShadow = "0 2px 6px rgba(220, 38, 38, 0.25)";
        }}
      >
        ←
      </button>
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
                <div className="flex items-center justify-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <div className={`w-12 h-12 bg-gradient-to-br ${formData.role === "patient" ? "from-blue-500 to-indigo-600" : "from-red-500 to-pink-600"} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {formData.role === "patient" ? <User size={20} /> : <Heart size={20} />}
                  </div>
                  <div>
                    <div className="text-lg font-black text-gray-900 capitalize">
                      {formData.role === "patient" ? "Patient" : "Donor"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Input 
                label="Full Name" 
                icon={User} 
                placeholder="Enter your full name" 
                required
                value={formData.name} 
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                error={nameError}
              />
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
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight flex items-center gap-2">
                  <MapPin size={16} />
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={handleStateChange}
                  onBlur={handleCityStateBlur}
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all outline-none"
                  required
                >
                  <option value="">Select State</option>
                  {allStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight flex items-center gap-2">
                  <MapPin size={16} />
                  City
                </label>
                <select
                  value={formData.city}
                  onChange={handleCityChange}
                  onBlur={handleCityStateBlur}
                  disabled={!formData.state}
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {formData.state ? "Select City" : "Select State First"}
                  </option>
                  {getCitiesForState(formData.state).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City-State Error Display */}
            <AnimatePresence>
              {cityStateError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:col-span-2 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {cityStateError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
              <Link to={`/login/${formData.role}`} className="text-red-600 hover:text-red-700 underline underline-offset-4 decoration-2">
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
