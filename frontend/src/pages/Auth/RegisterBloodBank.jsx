import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerBloodBank } from "../../api/api";
import { getErrorMessage } from "../../api/axios";
import { Card } from "../../components/Common/Card";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Building2, Mail, Lock, Phone, MapPin, FileText, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import BackButton from "../../components/Common/BackButton";
import BloodMatrixLogo from "../../components/Common/BloodMatrixLogo";

// State-City mapping data - Comprehensive with all cities and districts
const stateCityData = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", 
    "Tirupati", "Kakinada", "Anantapur", "Eluru", "Ongole", "Vizianagaram",
    "Chittoor", "Anakapalli", "Tadipatri", "Hindupur", "Bapatla", "Palnadu",
    "Narsaraopet", "Srikakulam", "Machilipatnam", "Tenali", "Proddatur", "Nandyal"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Tawang", "Ziro", "Pasighat", "Bomdila", "Tezu", "Anini", "Khonsa",
    "Yupia", "Changlang", "Daporijo", "Aalo", "Roing", "Tezu", "Bomdila", "Koloriang"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", 
    "Bongaigaon", "Goalpara", "Karimganj", "Sivasagar", "Lakhimpur", "Barpeta",
    "Dhubri", "Diphu", "North Lakhimpur", "Goalpara", "Morigaon", "Baksa", "Hojai"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", 
    "Arrah", "Begusarai", "Katihar", "Monghyr", "Chapra", "Dehri", "Siwan",
    "Bettiah", "Motihari", "Saharsa", "Sasaram", "Madhubani", "Kishanganj", "Sitamarhi",
    "Arwal", "Aurangabad", "Banka", "Buxar", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Durg", "Korba", "Rajnandgaon", "Jagdalpur", 
    "Ambikapur", "Raigarh", "Mahasamund", "Dhamtari", "Bemetara", "Balod", "Baloda Bazar",
    "Gariyaband", "Kondagaon", "Mungeli", "Sukma", "Surajpur", "Bijapur", "Narayanpur"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim",
    "Canacona", "Quepem", "Sanguem", "Dabolim", "Verna", "Cortalim", "Madgaon", "Pernem"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", 
    "Gandhinagar", "Anand", "Nadiad", "Mehsana", "Surendranagar", "Porbandar", "Bharuch",
    "Botad", "Devbhoomi Dwarka", "Gir Somnath", "Amreli", "Aravalli", "Banaskantha",
    "Chhota Udaipur", "Dahod", "Kheda", "Kutch", "Mahisagar", "Morbi", "Panchmahal",
    "Patan", "Sabarkantha", "Tapi", "Valsad"
  ],
  "Haryana": [
    "Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", 
    "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind",
    "Kaithal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Rewari", "Fatehabad"
  ],
  "Himachal Pradesh": [
    "Shimla", "Solan", "Dharamshala", "Mandi", "Kullu", "Palampur", "Bilaspur", 
    "Una", "Sirmaur", "Chamba", "Hamirpur", "Kinnaur", "Lahaul and Spiti",
    "Sarkaghat", "Nahan", "Sundarnagar", "Kangra", "Chintpurni", "Jwalamukhi", "Jwali"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", 
    "Giridih", "Ramgarh", "Medininagar", "Chakradharpur", "Jamtara", "Chatra", "Koderma",
    "Latehar", "Lohardaga", "Pakur", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
  ],
  "Karnataka": [
    "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", 
    "Bellary", "Bijapur", "Shimoga", "Tumkur", "Raichur", "Bidar", "Hospet", "Kolar",
    "Chikballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Hassan", "Kodagu",
    "Koppal", "Mandya", "Raichur", "Ramanagara", "Shivamogga", "Tumkur", "Udupi",
    "Uttara Kannada", "Vijayanagara", "Yadgir"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", 
    "Palakkad", "Malappuram", "Kannur", "Kasaragod", "Kottayam", "Idukki", "Pathanamthitta", "Wayanad",
    "Ernakulam", "Kollam", "Malappuram", "Thrissur", "Thiruvananthapuram", "Kozhikode"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Guna", "Sagar", "Ratlam", 
    "Satna", "Morena", "Khandwa", "Burhanpur", "Ashoknagar", "Katni", "Rewa", "Vidisha",
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Betul", "Bhind",
    "Chhatarpur", "Chhindwara", "Damoh", "Dhar", "Dindori", "Guna", "Gwalior", "Harda",
    "Hoshangabad", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur",
    "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa",
    "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri",
    "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", 
    "Navi Mumbai", "Kolhapur", "Sangli", "Malegaon", "Akola", "Latur", "Dhule", "Ahmednagar", 
    "Chandrapur", "Parbhani", "Jalgaon", "Bhiwandi", "Ambernath", "Nanded", "Panvel", 
    "Bhusawal", "Ulhasnagar", "Nandurbar", "Wardha", "Yavatmal", "Latur", "Gondia",
    "Gadchirolili", "Wardha", "Washim", "Yavatmal", "Beed", "Bhandara", "Buldhana",
    "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
    "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad",
    "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Kakching", "Ukhrul", "Senapati", "Tamenglong",
    "Chandel", "Jiribam", "Noney", "Kamjong", "Noney", "Pherzawl", "Tengnoupal"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Resubelpara", "Mairang", "Nongpoh",
    "Amlarem", "Mawsynram", "Mawkyrwat", "Mawphlang", "Nongbah", "Nongstoin", "Rongjeng",
    "Selsella", "Shillong", "Tura", "Williamnagar"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Mamit", "Saiha", "Lawngtlai",
    "Biate", "Champhai", "Chhingchhip", "Darlawn", "Demlui", "East Lungdar", "Hnahthial",
    "Khawhai", "Khawzawl", "Lengpui", "Lunglei", "Mamit", "North Vanlaiphai", "Paite",
    "Ruantlang", "Saitual", "Serchhip", "Thenzawl", "Tlabung", "Tuipang", "Vanhmawthlang"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Kiphire", "Longleng", "Peren",
    "Aboi", "Akuluto", "Aghunato", "Alichen", "Aliba", "Atoizu", "Bhandari", "Bokajan",
    "Changtongya", "Chare", "Chazouba", "Chumukedima", "Dimapur", "Ghathashi", "Ghaspani",
    "Jalukie", "Khaibung", "Kiphire", "Kohima", "Kongsa", "Longleng", "Medziphema",
    "Mekokchung", "Mokokchung", "Mon", "Mokokchung", "Nagaland", "Noklak", "Pfutsero",
    "Pughoboto", "Ruzaphema", "Satakha", "Satoi", "Shamator", "Suruhuto", "Tamlu",
    "Tening", "Thonoknyu", "Tseminyu", "Tuensang", "Ungma", "Wokha", "Zunheboto"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", 
    "Bhawanipatna", "Cuttack", "Dhenkanal", "Baripada", "Jharsuguda", "Koraput", "Rayagada", "Sundargarh",
    "Angul", "Balangir", "Bargarh", "Boudh", "Deogarh", "Gajapati", "Jagatsinghpur", "Jajpur",
    "Kalahandi", "Kandhamal", "Kendrapara", "Khordha", "Malkangiri", "Mayurbhanj",
    "Nabarangpur", "Nayagarh", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundergarh"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Pathankot", 
    "Hoshiarpur", "Batala", "Moga", "Muktsar", "Kapurthala", "Rupnagar", "Faridkot",
    "Barnala", "Fatehgarh Sahib", "Fazilka", "Gurdaspur", "Jalandhar", "Kapurthala",
    "Ludhiana", "Mansa", "Moga", "Pathankot", "Rupnagar", "Sangrur", "SAS Nagar",
    "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar", 
    "Pali", "Bharatpur", "Churu", "Ganganagar", "Tonk", "Baran", "Dausa", "Dholpur",
    "Banswara", "Baran", "Barmer", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh",
    "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer",
    "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur",
    "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi",
    "Sri Ganganagar", "Tonk", "Udaipur"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo", "Jorethang", "Singtam", "Pakyong",
    "Bermiok", "Chungthang", "Dikchu", "Gyalshing", "Kabi", "Lachen", "Lachung",
    "Mangan", "Namchi", "Pakyong", "Pelling", "Rangpo", "Ravangla", "Singtam",
    "Soreng", "Yangyang"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", 
    "Vellore", "Thoothukudi", "Dindigul", "Thanjavur", "Nagercoil", "Sivakasi", "Karur", 
    "Tirunelveli", "Kanchipuram", "Tiruvannamalai", "Krishnagiri", "Cuddalore", "Kumbakonam",
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
    "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tiruchirappalli",
    "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai",
    "Thoothukudi", "Vellore", "Viluppuram", "Virudhunagar"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahabubnagar", 
    "Nalgonda", "Adilabad", "Miryalaguda", "Suryapet", "Siddipet", "Jagtial", "Kamareddy",
    "Aswaraopeta", "Bhadrachalam", "Bhongir", "Chegunta", "Choutuppal", "Devarakonda",
    "Gadwal", "Hyderabad", "Ibrahimpatnam", "Jagtial", "Jangaon", "Kamareddy",
    "Karimnagar", "Khammam", "Kodad", "Kothagudem", "Mahabubabad", "Mahabubnagar",
    "Mancherial", "Medak", "Medchal", "Miryaguda", "Nagarkurnool", "Nalgonda",
    "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ramagundam",
    "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal",
    "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Dharmanagar", "Pratapgarh", "Kailashahar", "Belonia", "Khowai", 
    "Teliamura", "Kamalpur", "Santirbazar", "Amarpur", "Ambassa", "Bishramganj",
    "Boxanagar", "Dharamnagar", "Gandacherra", "Gomati", "Hezamara",
    "Jampui Hills", "Kadamtala", "Kailashahar", "Kamalpur", "Khowai", 
    "Kumarghat", "Longtharai Valley", "Mohanpur", "Padmabil", "Paschim Sabroom", "Pecharthal",
    "Rajnagar", "Ranirbazar", "Sabroom", "Satchand", "Sepahijala",
    "Sonamura", "South Tripura", "Teliamura", "Udaipur"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", 
    "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Jhansi", "Mathura", 
    "Firozabad", "Auraiya", "Etawah", "Lakhimpur", "Sitapur", "Unnao", "Hapur", "Rampur",
    "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya",
    "Baghpat", "Bahraich", "Ballia", "Banda", "Barabanki", "Bareilly",
    "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot",
    "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar",
    "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi",
    "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar",
    "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lakhimpur Kheri", "Lalitpur",
    "Lucknow", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit",
    "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal",
    "Shahjahanpur", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur",
    "Unnao", "Varanasi"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Kashipur", "Rudrapur", 
    "Kotdwar", "Pithoragarh", "Bageshwar", "Champawat", "Uttarkashi", "Tehri", "Pauri",
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital",
    "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar",
    "Uttarkashi"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Raniganj", "Barrackpore", 
    "Haldia", "Kalyani", "Jalpaiguri", "Krishnanagar", "Nabadwip", "Midnapore", "Malda", 
    "Balurghat", "Berhampore", "Bankura", "Purulia", "Suri", "Bolpur", "Durgapur", "Chinsurah",
    "Alipurduar", "Bankura", "Birbhum", "Burdwan", "Cooch Behar", "Dakshin Dinajpur",
    "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata",
    "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman",
    "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas",
    "Uttar Dinajpur"
  ]
};

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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [cityStateError, setCityStateError] = useState("");

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
    setCityStateError(""); // Clear error
  };

  // Handle city change
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setFormData({ ...formData, city: selectedCity });
    
    // Validate city belongs to selected state
    if (selectedCity && formData.state) {
      const citiesInState = getCitiesForState(formData.state);
      if (!citiesInState.includes(selectedCity)) {
        setCityStateError("City does not belong to the selected state");
      } else {
        setCityStateError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate city-state relationship
    if (formData.city && formData.state) {
      const citiesInState = getCitiesForState(formData.state);
      if (!citiesInState.includes(formData.city)) {
        setCityStateError("City does not belong to the selected state");
        setLoading(false);
        toast.error("City does not belong to the selected state");
        return;
      }
    }

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
    <>
      <BackButton />
      <BloodMatrixLogo />
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

            <Input
              label="License/Verification Info"
              icon={FileText}
              required
              value={formData.licenseInfo}
              onChange={(e) => setFormData({ ...formData, licenseInfo: e.target.value })}
              placeholder="License No: BB-12345"
            />

            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">State</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <MapPin size={20} />
                </div>
                <select
                  value={formData.state}
                  onChange={handleStateChange}
                  className="w-full bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-300 py-3.5 shadow-sm shadow-gray-100 pl-12 pr-4 text-gray-900"
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
            </div>

            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">City</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <MapPin size={20} />
                </div>
                <select
                  value={formData.city}
                  onChange={handleCityChange}
                  disabled={!formData.state}
                  className="w-full bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-300 py-3.5 shadow-sm shadow-gray-100 pl-12 pr-4 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {cityStateError && (
                <p className="text-xs text-red-500 ml-1 font-medium">{cityStateError}</p>
              )}
            </div>

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
    </>
  );
};

export default RegisterBloodBank;
