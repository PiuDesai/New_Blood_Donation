import { HeartPulse, Droplets, Activity, Search, Plus, MapPin, Calendar, Clock, Loader2, ShieldCheck, Phone, CheckCircle2, Home, ArrowLeft, HelpCircle, Edit3, Trash2, Star, User, Inbox } from "lucide-react";
import { StatsCard } from "../../components/Common/StatsCard";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Input } from "../../components/Common/Input";
import { RatingInput, StarRating } from "../../components/Common/RatingComponent";
import { useAuth } from "../../context/AuthContext";
import { getPatientStats, getMyBloodRequests, createBloodRequest, getAllCamps, updateBloodRequest, deleteBloodRequest, rateDonor, verifyRequestCompletion, bookBloodTest, getAllBloodBanks } from "../../api/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { dashboardPath } from "../../utils/rolePaths";
import toast from "react-hot-toast";

const sanitizePatientName = (value = "", { forSubmit = false } = {}) => {
  // Keep only letters and spaces so patient name can't contain numbers.
  const cleaned = String(value).replace(/[^A-Za-z\s]/g, "");
  if (!forSubmit) return cleaned.replace(/\s{2,}/g, " ");
  return cleaned.replace(/\s{2,}/g, " ").trim();
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [stats, setStats] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showNearbyDonors, setShowNearbyDonors] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [ratingDonorId, setRatingDonorId] = useState(null);
  const [ratingRequestId, setRatingRequestId] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);

  const [requestForm, setRequestModalForm] = useState({
    patientName: "",
    bloodGroup: "O+",
    units: "",
    hospital: "",
    urgency: "Normal",
    state: "",
    city: ""
  });

  const [localSearch, setLocalSearch] = useState(query);
  const [realNearbyDonors, setRealNearbyDonors] = useState([]);
  const [realBloodBanks, setRealBloodBanks] = useState([]);

  const filteredDonors = realNearbyDonors.filter(donor => 
    donor.name.toLowerCase().includes((localSearch || query).toLowerCase()) ||
    donor.bloodGroup.toLowerCase().includes((localSearch || query).toLowerCase())
  );

  const filteredBanks = realBloodBanks.filter(bank => 
    bank.name.toLowerCase().includes((localSearch || query).toLowerCase()) ||
    bank.bloodStock?.some(stock => stock.bloodGroup.toLowerCase().includes((localSearch || query).toLowerCase()))
  );

  const labTests = [
     { test: "Complete Blood Count (CBC)", date: "Apr 05, 2026", status: "Report Ready" },
     { test: "Liver Function Test (LFT)", date: "Apr 02, 2026", status: "Report Ready" },
     { test: "Diabetes Screening (HbA1c)", date: "Mar 28, 2026", status: "Processing" },
   ];

  // State-City-Hospital mapping data - Complete Indian coverage
  const stateCityHospitalData = {
    "Andhra Pradesh": {
      "Visakhapatnam": [
        "King George Hospital", "Seven Hills Hospital", "Care Hospital", "Apollo Hospitals",
        "Lions Hospital", "Queen's NRI Hospital", "Gandhi Hospital", "CMC Hospital"
      ],
      "Vijayawada": [
        "Government General Hospital", "Pinnamaneni Hospital", "Apollo Hospital",
        "CARE Hospital", "Ramesh Hospital", "Siddhartha Hospital"
      ],
      "Guntur": [
        "Government General Hospital", "Ramesh Hospital", "Apollo Hospital",
        "Siddhartha Hospital", "Katuru Medical College Hospital"
      ],
      "Tirupati": [
        "SVIMS Hospital", "Apollo Hospital", "Sri Venkateswara Hospital",
        "Ramesh Hospital", "Government Hospital"
      ],
      "Kurnool": [
        "Kurnool Medical College Hospital", "Apollo Hospital", "Ramesh Hospital",
        "Government Hospital", "Siddhartha Hospital"
      ],
      "Nellore": [
        "Government General Hospital", "Apollo Hospital", "Ramesh Hospital",
        "Siddhartha Hospital", "Nellore Hospital"
      ],
      "Rajahmundry": [
        "Government Hospital", "Apollo Hospital", "Ramesh Hospital",
        "Siddhartha Hospital", "Rajahmundry Hospital"
      ],
      "Kakinada": [
        "Government Hospital", "Apollo Hospital", "Ramesh Hospital",
        "Siddhartha Hospital", "Kakinada Hospital"
      ],
      "Anantapur": [
        "Government Hospital", "Apollo Hospital", "Ramesh Hospital",
        "Siddhartha Hospital", "Anantapur Hospital"
      ],
      "Eluru": [
        "Government Hospital", "Apollo Hospital", "Ramesh Hospital",
        "Siddhartha Hospital", "Eluru Hospital"
      ]
    },
    "Arunachal Pradesh": {
      "Itanagar": [
        "General Hospital", "Tomosik Hospital", "Apollo Hospital",
        "Rani Hospital", "District Hospital"
      ],
      "Tawang": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Tawang Hospital"
      ],
      "Ziro": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Ziro Hospital"
      ],
      "Pasighat": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Pasighat Hospital"
      ],
      "Bomdila": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Bomdila Hospital"
      ],
      "Tezu": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Tezu Hospital"
      ],
      "Changlang": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Changlang Hospital"
      ],
      "Anjaw": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Anjaw Hospital"
      ],
      "Daporijo": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Daporijo Hospital"
      ],
      "Along": [
        "District Hospital", "General Hospital", "Apollo Hospital",
        "Rani Hospital", "Along Hospital"
      ]
    },
    "Assam": {
      "Guwahati": [
        "Guwahati Medical College Hospital", "Apollo Hospital", "Down Town Hospital",
        "Narayana Hospital", "Hayat Hospital", "International Hospital",
        "Dispur Hospital", "GNRC Hospital", "Swagat Hospital"
      ],
      "Silchar": [
        "Silchar Medical College Hospital", "Apollo Hospital", "Karuna Hospital",
        "Sanjivani Hospital", "Civil Hospital", "Silchar Hospital"
      ],
      "Dibrugarh": [
        "Assam Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Dibrugarh Hospital"
      ],
      "Jorhat": [
        "Jorhat Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Jorhat Hospital"
      ],
      "Nagaon": [
        "Nagaon Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Nagaon Hospital"
      ],
      "Tezpur": [
        "Tezpur Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Tezpur Hospital"
      ],
      "Bongaigaon": [
        "Bongaigaon Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Bongaigaon Hospital"
      ],
      "Dhubri": [
        "Dhubri Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Dhubri Hospital"
      ],
      "Goalpara": [
        "Goalpara Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Goalpara Hospital"
      ],
      "Barpeta": [
        "Barpeta Medical College Hospital", "Apollo Hospital", "Hayat Hospital",
        "Jeevan Jyoti Hospital", "Civil Hospital", "Barpeta Hospital"
      ]
    },
    "Bihar": {
      "Patna": [
        "AIIMS Patna", "PMCH", "IGIMS", "Paras Hospital", "Ruban Hospital",
        "Kurji Holy Family Hospital", "Mahavir Vaatsalya Hospital", "Anugrah Hospital",
        "Rajeshwar Hospital", "Gautam Hospital", "Kurji Hospital", "Nalanda Medical College",
        "Patna Medical College", "Vijay Hospital", "Shri Krishna Hospital"
      ],
      "Gaya": [
        "AIIMS Patna (Gaya)", "Anugrah Hospital", "Magadh Hospital", "Civil Hospital",
        "Nalanda Medical College", "Vijay Hospital", "Gaya Hospital"
      ],
      "Muzaffarpur": [
        "SKMCH Hospital", "Medical College Hospital", "Apollo Hospital",
        "Paras Hospital", "Rajeshwar Hospital", "Civil Hospital", "Muzaffarpur Hospital"
      ],
      "Bhagalpur": [
        "Jawahar Lal Nehru Medical College Hospital", "Apollo Hospital",
        "Paras Hospital", "Rajeshwar Hospital", "Civil Hospital", "Bhagalpur Hospital"
      ],
      "Purnia": [
        "Purnia Medical College Hospital", "Apollo Hospital", "Paras Hospital",
        "Rajeshwar Hospital", "Civil Hospital", "Purnia Hospital"
      ],
      "Darbhanga": [
        "Darbhanga Medical College Hospital", "Apollo Hospital", "Paras Hospital",
        "Rajeshwar Hospital", "Civil Hospital", "Darbhanga Hospital"
      ],
      "Munger": [
        "Munger Medical College Hospital", "Apollo Hospital", "Paras Hospital",
        "Rajeshwar Hospital", "Civil Hospital", "Munger Hospital"
      ],
      "Saharsa": [
        "Saharsa Medical College Hospital", "Apollo Hospital", "Paras Hospital",
        "Rajeshwar Hospital", "Civil Hospital", "Saharsa Hospital"
      ],
      "Bettiah": [
        "Bettiah Medical College Hospital", "Apollo Hospital", "Paras Hospital",
        "Rajeshwar Hospital", "Civil Hospital", "Bettiah Hospital"
      ],
      "Siwan": [
        "Siwan Medical College Hospital", "Apollo Hospital", "Paras Hospital",
        "Rajeshwar Hospital", "Civil Hospital", "Siwan Hospital"
      ]
    },
    "Chhattisgarh": {
      "Raipur": [
        "AIIMS Raipur", "Mekhela Hospital", "Apollo Hospital", "Shri Narayana Hospital",
        "Civil Hospital", "Kalyan Hospital", "CARE Hospital", "Raipur Hospital"
      ],
      "Bhilai": [
        "Bhilai Steel Plant Hospital", "Apollo Hospital", "CARE Hospital",
        "Mekhela Hospital", "Civil Hospital", "Bhilai Hospital"
      ],
      "Bilaspur": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Bilaspur Hospital"
      ],
      "Durg": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Durg Hospital"
      ],
      "Raigarh": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Raigarh Hospital"
      ],
      "Korba": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Korba Hospital"
      ],
      "Rajnandgaon": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Rajnandgaon Hospital"
      ],
      "Jagdalpur": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Jagdalpur Hospital"
      ],
      "Ambikapur": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Ambikapur Hospital"
      ],
      "Bastar": [
        "Apollo Hospital", "Civil Hospital", "Chhattisgarh Hospital",
        "Shri Narayana Hospital", "Mekhela Hospital", "Bastar Hospital"
      ]
    },
    "Goa": {
      "Panaji": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Vijaya Hospital", "Manipal Hospital", "Healthway Hospital", "Panaji Hospital"
      ],
      "Margao": [
        "Hospicio Hospital", "Apollo Hospital", "Manipal Hospital",
        "Vijaya Hospital", "Healthway Hospital", "Margao Hospital"
      ],
      "Vasco": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Vasco Hospital"
      ],
      "Mapusa": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Mapusa Hospital"
      ],
      "Ponda": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Ponda Hospital"
      ],
      "Bicholim": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Bicholim Hospital"
      ],
      "Curchorem": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Curchorem Hospital"
      ],
      "Sanquelim": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Sanquelim Hospital"
      ],
      "Cuncolim": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Cuncolim Hospital"
      ],
      "Quepem": [
        "Goa Medical College Hospital", "Apollo Hospital", "Hinduja Hospital",
        "Manipal Hospital", "Healthway Hospital", "Quepem Hospital"
      ]
    },
    "Gujarat": {
      "Ahmedabad": [
        "Apollo Hospitals", "Sterling Hospital", "Zydus Hospital", "Shalby Hospital",
        "CIMS Hospital", "HCG Hospital", "Wockhardt Hospital", "Sankalp Hospital",
        "Narayana Hospital", "Vijaya Hospital", "Civil Hospital", "Gujarat Cancer Research Institute"
      ],
      "Surat": [
        "Mahavir Hospital", "Surat Hospital", "Diamond Hospital", "Shalby Hospital",
        "Apple Hospital", "Sunshine Hospital", "Care Institute of Medical Sciences", "Kiran Hospital",
        "Umiya Hospital", "Civil Hospital", "New Civil Hospital", "Surat Hospital"
      ],
      "Vadodara": [
        "Samarpan Hospital", "Shreeji Hospital", "Sunshine Hospital", "Kare Hospital",
        "Siddhi Hospital", "Sayaji Hospital", "Civil Hospital", "SSG Hospital", "Vadodara Hospital"
      ],
      "Rajkot": [
        "Wockhardt Hospital", "Pioneer Hospital", "Tulsi Hospital", "Civil Hospital",
        "Gandhi Hospital", "MG Hospital", "General Hospital", "Rajkot Hospital"
      ],
      "Gandhinagar": [
        "Civil Hospital", "Apollo Hospital", "Sterling Hospital", "Zydus Hospital",
        "Shreeji Hospital", "Siddhi Hospital", "Gandhinagar Hospital"
      ],
      "Bhavnagar": [
        "Civil Hospital", "Apollo Hospital", "Sterling Hospital", "Zydus Hospital",
        "Shreeji Hospital", "Siddhi Hospital", "Bhavnagar Hospital"
      ],
      "Jamnagar": [
        "Civil Hospital", "Apollo Hospital", "Sterling Hospital", "Zydus Hospital",
        "Shreeji Hospital", "Siddhi Hospital", "Jamnagar Hospital"
      ],
      "Junagadh": [
        "Civil Hospital", "Apollo Hospital", "Sterling Hospital", "Zydus Hospital",
        "Shreeji Hospital", "Siddhi Hospital", "Junagadh Hospital"
      ],
      "Anand": [
        "Civil Hospital", "Apollo Hospital", "Sterling Hospital", "Zydus Hospital",
        "Shreeji Hospital", "Siddhi Hospital", "Anand Hospital"
      ],
      "Nadiad": [
        "Civil Hospital", "Apollo Hospital", "Sterling Hospital", "Zydus Hospital",
        "Shreeji Hospital", "Siddhi Hospital", "Nadiad Hospital"
      ]
    },
    "Haryana": {
      "Gurgaon": [
        "Artemis Hospital", "Medanta - The Medicity", "Columbia Asia Hospital",
        "Primus Hospital", "Batra Hospital", "Paras Hospital", "Fortis Hospital",
        "Max Hospital", "Park Hospital", "Wockhardt Hospital", "Gurgaon Hospital"
      ],
      "Faridabad": [
        "Fortis Hospital", "Metro Hospital", "Sarvodaya Hospital", "QRG Hospital",
        "Asian Hospital", "Bharat Family Hospital", "Faridabad Hospital"
      ],
      "Panipat": [
        "Civil Hospital", "Panipat Hospital", "Apollo Hospital", "Max Hospital",
        "Bansal Hospital", "Artemis Hospital", "Panipat Hospital"
      ],
      "Karnal": [
        "Kalpana Hospital", "Civil Hospital", "Apollo Hospital", "Karnal Hospital",
        "Santosh Hospital", "PGIMS Rohtak", "Karnal Hospital"
      ],
      "Rohtak": [
        "PGIMS Rohtak", "Civil Hospital", "Apollo Hospital", "Karnal Hospital",
        "Santosh Hospital", "Kalpana Hospital", "Rohtak Hospital"
      ],
      "Hisar": [
        "Civil Hospital", "Apollo Hospital", "Karnal Hospital",
        "Santosh Hospital", "Kalpana Hospital", "Hisar Hospital"
      ],
      "Sonipat": [
        "Civil Hospital", "Apollo Hospital", "Karnal Hospital",
        "Santosh Hospital", "Kalpana Hospital", "Sonipat Hospital"
      ],
      "Yamunanagar": [
        "Civil Hospital", "Apollo Hospital", "Karnal Hospital",
        "Santosh Hospital", "Kalpana Hospital", "Yamunanagar Hospital"
      ],
      "Panchkula": [
        "Civil Hospital", "Apollo Hospital", "Karnal Hospital",
        "Santosh Hospital", "Kalpana Hospital", "Panchkula Hospital"
      ],
      "Ambala": [
        "Civil Hospital", "Apollo Hospital", "Karnal Hospital",
        "Santosh Hospital", "Kalpana Hospital", "Ambala Hospital"
      ]
    },
    "Himachal Pradesh": {
      "Shimla": [
        "IGMC Hospital", "Indira Gandhi Medical College Hospital", "Apollo Hospital",
        "Civil Hospital", "Ripon Hospital", "Shimla Hospital"
      ],
      "Dharamshala": [
        "Tanda Medical College Hospital", "Apollo Hospital", "Civil Hospital",
        "Kangra Hospital", "Baba Farid Hospital", "Dharamshala Hospital"
      ],
      "Solan": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Solan Hospital"
      ],
      "Mandi": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Mandi Hospital"
      ],
      "Kullu": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Kullu Hospital"
      ],
      "Chamba": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Chamba Hospital"
      ],
      "Bilaspur": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Bilaspur Hospital"
      ],
      "Una": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Una Hospital"
      ],
      "Hamirpur": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Hamirpur Hospital"
      ],
      "Kangra": [
        "Civil Hospital", "Apollo Hospital", "Shri Lal Bahadur Shastri Hospital",
        "Mohan Hospital", "Indira Gandhi Hospital", "Kangra Hospital"
      ]
    },
    "Jharkhand": {
      "Ranchi": [
        "RIMS Ranchi", "Apollo Hospital", "Medica Hospital", "Raj Hospital",
        "Bhagwan Mahavir Hospital", "Kamla Nehru Hospital", "Curd Hospital", "Ranchi Hospital"
      ],
      "Jamshedpur": [
        "Tata Main Hospital", "Apollo Hospital", "Medica Hospital", "TMH Hospital",
        "Mahatma Gandhi Hospital", "Kashmir Hospital", "Jamshedpur Hospital"
      ],
      "Dhanbad": [
        "Patliputra Medical College Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Dhanbad Hospital"
      ],
      "Bokaro": [
        "Bokaro General Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Bokaro Hospital"
      ],
      "Deoghar": [
        "Deoghar Medical College Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Deoghar Hospital"
      ],
      "Hazaribagh": [
        "Hazaribagh Medical College Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Hazaribagh Hospital"
      ],
      "Giridih": [
        "Giridih Medical College Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Giridih Hospital"
      ],
      "Ramgarh": [
        "Ramgarh Medical College Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Ramgarh Hospital"
      ],
      "Pakur": [
        "Pakur Medical College Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Pakur Hospital"
      ],
      "Sahibganj": [
        "Sahibganj Medical College Hospital", "Apollo Hospital", "Medica Hospital",
        "Asarfi Hospital", "Civil Hospital", "Sahibganj Hospital"
      ]
    },
    "Jammu & Kashmir": {
      "Srinagar": [
        "SMHS Hospital", "SKIMS Hospital", "Sher-e-Kashmir Hospital", "Apollo Hospital",
        "Government Medical College Hospital", "Lal Ded Hospital", "Srinagar Hospital"
      ],
      "Jammu": [
        "Government Medical College Hospital", "Apollo Hospital", "SMGS Hospital",
        "Shri Mata Vaishno Devi Hospital", "Civil Hospital", "Jammu Hospital"
      ],
      "Anantnag": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Anantnag Hospital"
      ],
      "Baramulla": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Baramulla Hospital"
      ],
      "Kupwara": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Kupwara Hospital"
      ],
      "Pulwama": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Pulwama Hospital"
      ],
      "Shopian": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Shopian Hospital"
      ],
      "Kulgam": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Kulgam Hospital"
      ],
      "Bandipora": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Bandipora Hospital"
      ],
      "Ganderbal": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Ganderbal Hospital"
      ]
    },
    "Karnataka": {
      "Bangalore": [
        "Manipal Hospital", "Apollo Hospital", "Fortis Hospital", "Columbia Asia Hospital",
        "Narayana Health", "Sakra World Hospital", "St. John's Medical College",
        "M.S. Ramaiah Hospital", "BGS Global Hospital", "Vikram Hospital",
        "Aster CMI Hospital", "Cloudnine Hospital", "Sparsh Hospital", "Hosmat Hospital",
        "Kempegowda Institute of Medical Sciences", "Victoria Hospital", "Bowring Hospital"
      ],
      "Mysore": [
        "Apollo Hospital", "JSS Hospital", "Columbia Asia Hospital", "PK Hospital",
        "Chamundeshwari Hospital", "Vikram Hospital", "Krishna Rajendra Hospital",
        "Holdsworth Memorial Hospital", "Mysore Hospital"
      ],
      "Hubli-Dharwad": [
        "KLE Hospital", "SDM Hospital", "Civil Hospital", "Apollo Hospital",
        "Bheemanna Khandre Hospital", "Adichunchanagiri Hospital", "JGMM Hospital", "Hubli Hospital"
      ],
      "Davanagere": [
        "Civil Hospital", "Apollo Hospital", "Bapuji Hospital", "SSM Hospital",
        "Chigateri Hospital", "JSS Hospital", "Davanagere Hospital"
      ],
      "Bellary": [
        "Civil Hospital", "Apollo Hospital", "Vijayanagar Hospital", "SSM Hospital",
        "JSS Hospital", "KLE Hospital", "Bellary Hospital"
      ],
      "Mangalore": [
        "KMC Hospital", "Aster Hospital", "Apollo Hospital", "Fr. Muller Hospital",
        "Yenepoya Hospital", "Srinivas Hospital", "AJ Hospital", "Government Wenlock Hospital", "Mangalore Hospital"
      ],
      "Belgaum": [
        "KLE Hospital", "Civil Hospital", "Shri Mahantesh Hospital", "Ashwini Hospital",
        "JGMM Hospital", "Sankalp Hospital", "Belgaum Hospital"
      ],
      "Gulbarga": [
        "Civil Hospital", "Apollo Hospital", "KLE Hospital", "Shri Mahantesh Hospital",
        "JGMM Hospital", "Sankalp Hospital", "Gulbarga Hospital"
      ],
      "Bidar": [
        "Civil Hospital", "Apollo Hospital", "KLE Hospital", "Shri Mahantesh Hospital",
        "JGMM Hospital", "Sankalp Hospital", "Bidar Hospital"
      ],
      "Raichur": [
        "Civil Hospital", "Apollo Hospital", "KLE Hospital", "Shri Mahantesh Hospital",
        "JGMM Hospital", "Sankalp Hospital", "Raichur Hospital"
      ]
    },
    "Kerala": {
      "Kochi": [
        "Apollo Hospital", "Lisie Hospital", "Amrita Hospital", "Medical Trust Hospital",
        "Lourdes Hospital", "Ernakulam Medical Centre", "Vijaya Hospital", "Rajagiri Hospital",
        "Kottayam Hospital", "Cochin Hospital", "MOSC Medical College", "Kochi Hospital"
      ],
      "Thiruvananthapuram": [
        "Sree Chitra Hospital", "Regional Cancer Centre", "Medical College Hospital",
        "Apollo Hospital", "KIMS Hospital", "Ananthapuri Hospital", "SP Fortis Hospital", "Thiruvananthapuram Hospital"
      ],
      "Kozhikode": [
        "Medical College Hospital", "Baby Memorial Hospital", "Kozhikode Hospital",
        "Apollo Hospital", "MIMS Hospital", "Malabar Hospital", "Kozhikode Hospital"
      ],
      "Kottayam": [
        "Medical College Hospital", "Caritas Hospital", "Kottayam Hospital",
        "Lourdes Hospital", "Eranakulam Hospital", "Kottayam Hospital"
      ],
      "Thrissur": [
        "Medical College Hospital", "Caritas Hospital", "Kottayam Hospital",
        "Lourdes Hospital", "Eranakulam Hospital", "Thrissur Hospital"
      ],
      "Kollam": [
        "Medical College Hospital", "Caritas Hospital", "Kottayam Hospital",
        "Lourdes Hospital", "Eranakulam Hospital", "Kollam Hospital"
      ],
      "Alappuzha": [
        "Medical College Hospital", "Caritas Hospital", "Kottayam Hospital",
        "Lourdes Hospital", "Eranakulam Hospital", "Alappuzha Hospital"
      ],
      "Palakkad": [
        "Medical College Hospital", "Caritas Hospital", "Kottayam Hospital",
        "Lourdes Hospital", "Eranakulam Hospital", "Palakkad Hospital"
      ],
      "Malappuram": [
        "Medical College Hospital", "Caritas Hospital", "Kottayam Hospital",
        "Lourdes Hospital", "Eranakulam Hospital", "Malappuram Hospital"
      ],
      "Kannur": [
        "Medical College Hospital", "Caritas Hospital", "Kottayam Hospital",
        "Lourdes Hospital", "Eranakulam Hospital", "Kannur Hospital"
      ]
    },
    "Madhya Pradesh": {
      "Bhopal": [
        "AIIMS Bhopal", "Hamidia Hospital", "BHEL Hospital", "People's Hospital",
        "Chirayu Hospital", "Bansal Hospital", "Sarthak Hospital", "National Hospital",
        "RKDF Hospital", "Jehangir Hospital", "CARE Hospital", "Vivekananda Hospital", "Bhopal Hospital"
      ],
      "Indore": [
        "Apollo Hospitals", "Choithram Hospital", "Bombay Hospital", "CHL Hospital",
        "Medanta Hospital", "Sri Aurobindo Hospital", "CARE Hospital", "Greater Kailash Hospital",
        "Index Medical College", "Gokuldas Hospital", "Matrishwa Hospital", "Vijay Hospital", "Indore Hospital"
      ],
      "Gwalior": [
        "AIIMS Gwalior", "G.R. Medical College Hospital", "J.A. Hospital", "Cancer Hospital",
        "Apollo Hospital", "Birla Hospital", "Sunshine Hospital", "Gwalior Hospital"
      ],
      "Jabalpur": [
        "Medical College Hospital", "Apollo Hospital", "Netaji Subhash Chandra Bose Hospital",
        "Victoria Hospital", "Rani Durgavati Hospital", "Jabalpur Hospital"
      ],
      "Ujjain": [
        "Civil Hospital", "Apollo Hospital", "Rani Durgavati Hospital",
        "Victoria Hospital", "Medical College Hospital", "Ujjain Hospital"
      ],
      "Sagar": [
        "Civil Hospital", "Apollo Hospital", "Rani Durgavati Hospital",
        "Victoria Hospital", "Medical College Hospital", "Sagar Hospital"
      ],
      "Rewa": [
        "Civil Hospital", "Apollo Hospital", "Rani Durgavati Hospital",
        "Victoria Hospital", "Medical College Hospital", "Rewa Hospital"
      ],
      "Satna": [
        "Civil Hospital", "Apollo Hospital", "Rani Durgavati Hospital",
        "Victoria Hospital", "Medical College Hospital", "Satna Hospital"
      ],
      "Guna": [
        "Civil Hospital", "Apollo Hospital", "Rani Durgavati Hospital",
        "Victoria Hospital", "Medical College Hospital", "Guna Hospital"
      ],
      "Vidisha": [
        "Civil Hospital", "Apollo Hospital", "Rani Durgavati Hospital",
        "Victoria Hospital", "Medical College Hospital", "Vidisha Hospital"
      ]
    },
    "Maharashtra": {
      "Mumbai": [
        "Lilavati Hospital", "Kokilaben Dhirubhai Ambani Hospital", "Nanavati Hospital", 
        "Hinduja Hospital", "Jaslok Hospital", "Breach Candy Hospital", "Tata Memorial Hospital",
        "S.L. Raheja Hospital", "Wockhardt Hospital", "Fortis Hospital", "Global Hospital",
        "SevenHills Hospital", "Airoli Hospital", "Hiranandani Hospital", "Lokmanya Tilak Hospital",
        "KEM Hospital", "Nair Hospital", "St. George Hospital", "Bhabha Hospital", "Mumbai Hospital"
      ],
      "Pune": [
        "Sassoon Hospital", "Jehangir Hospital", "KEM Hospital", "Ruby Hall Clinic",
        "Deenanath Mangeshkar Hospital", "Aditya Birla Hospital", "Columbia Asia Hospital",
        "Jahangir Hospital", "Noble Hospital", "Inamdar Hospital", "Sancheti Hospital",
        "Star Hospital", "Bharati Hospital", "Hardikar Hospital", "Sahyadri Hospital", "Pune Hospital"
      ],
      "Nagpur": [
        "Indira Gandhi Government Hospital", "Wockhardt Hospital", "Care Hospital",
        "Alexis Hospital", "Orange City Hospital", "Kingsway Hospital", "Lata Mangeshkar Hospital",
        "AIIMS Nagpur", "Mayo Hospital", "Santosh Hospital", "Nagpur Hospital"
      ],
      "Nashik": [
        "Wockhardt Hospital", "Sahyadri Hospital", "Nashik Civil Hospital", "Apollo Hospital",
        "Hinduja Hospital", "Lokmanya Hospital", "Vighanharta Hospital", "Nashik Hospital"
      ],
      "Aurangabad": [
        "Government Medical College Hospital", "Apollo Hospital", "Medicity Hospital",
        "DMR Hospital", "CARE Hospital", "MGMCET Hospital", "Aurangabad Hospital"
      ],
      "Solapur": [
        "Civil Hospital", "Ashwini Hospital", "Siddhivinayak Hospital", "Shrikrupa Hospital",
        "Chowgule Hospital", "Vimal Hospital", "Solapur Hospital"
      ],
      "Amravati": [
        "Government Hospital", "Jeevan Jyoti Hospital", "Wockhardt Hospital",
        "Shri Sai Hospital", "Matoshri Hospital", "Amravati Hospital"
      ],
      "Thane": [
        "Jupiter Hospital", "Thane Civil Hospital", "Horizon Hospital",
        "Bethany Hospital", "Curis Hospital", "Aayush Hospital", "Thane Hospital"
      ],
      "Kolhapur": [
        "Kolhapur Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Kolhapur Hospital"
      ],
      "Sangli": [
        "Civil Hospital", "Apollo Hospital", "Wockhardt Hospital",
        "Ashwini Hospital", "Sanjeevan Hospital", "Gajanan Hospital", "Sangli Hospital"
      ],
      "Satara": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Satara Hospital"
      ],
      "Nanded": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Nanded Hospital"
      ],
      "Latur": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Latur Hospital"
      ],
      "Jalgaon": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Jalgaon Hospital"
      ],
      "Ahmednagar": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Ahmednagar Hospital"
      ],
      "Akola": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Akola Hospital"
      ],
      "Buldhana": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Buldhana Hospital"
      ],
      "Wardha": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Wardha Hospital"
      ],
      "Yavatmal": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Yavatmal Hospital"
      ],
      "Beed": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Beed Hospital"
      ],
      "Osmanabad": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Osmanabad Hospital"
      ],
      "Nandurbar": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Nandurbar Hospital"
      ],
      "Dhule": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Dhule Hospital"
      ],
      "Jalna": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Jalna Hospital"
      ],
      "Parbhani": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Parbhani Hospital"
      ],
      "Hingoli": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Hingoli Hospital"
      ],
      "Gadchiroli": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Gadchiroli Hospital"
      ],
      "Chandrapur": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Chandrapur Hospital"
      ],
      "Gondia": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Gondia Hospital"
      ],
      "Bhandara": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Bhandara Hospital"
      ],
      "Raigad": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Raigad Hospital"
      ],
      "Ratnagiri": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Ratnagiri Hospital"
      ],
      "Sindhudurg": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Sindhudurg Hospital"
      ],
      "Palghar": [
        "Civil Hospital", "Apollo Hospital", "Sanjeevan Hospital",
        "Ashwini Hospital", "Gajanan Hospital", "Shri Mahant Hospital", "Palghar Hospital"
      ]
    },
    "Manipur": {
      "Imphal": [
        "Regional Institute of Medical Sciences", "JNIMS Hospital", "Shija Hospital",
        "Apollo Hospital", "Civil Hospital", "Imphal Hospital"
      ],
      "Churachandpur": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Churachandpur Hospital"
      ],
      "Thoubal": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Thoubal Hospital"
      ],
      "Bishnupur": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Bishnupur Hospital"
      ],
      "Chandel": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Chandel Hospital"
      ],
      "Ukhrul": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Ukhrul Hospital"
      ],
      "Senapati": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Senapati Hospital"
      ],
      "Tamenglong": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Tamenglong Hospital"
      ],
      "Noney": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Noney Hospital"
      ],
      "Kangpokpi": [
        "District Hospital", "Apollo Hospital", "Shija Hospital",
        "Civil Hospital", "Kangpokpi Hospital"
      ]
    },
    "Meghalaya": {
      "Shillong": [
        "Civil Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Shillong Hospital"
      ],
      "Tura": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Tura Hospital"
      ],
      "Nongstoin": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Nongstoin Hospital"
      ],
      "Jowai": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Jowai Hospital"
      ],
      "Baghmara": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Baghmara Hospital"
      ],
      "Resubelpara": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Resubelpara Hospital"
      ],
      "Mawkyrwat": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Mawkyrwat Hospital"
      ],
      "Khliehriat": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Khliehriat Hospital"
      ],
      "Mairang": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Mairang Hospital"
      ],
      "Amlarem": [
        "District Hospital", "NEIGRIHMS Hospital", "Apollo Hospital",
        "Bethany Hospital", "Amlarem Hospital"
      ]
    },
    "Mizoram": {
      "Aizawl": [
        "Civil Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Aizawl Hospital"
      ],
      "Lunglei": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Lunglei Hospital"
      ],
      "Champhai": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Champhai Hospital"
      ],
      "Serchhip": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Serchhip Hospital"
      ],
      "Kolasib": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Kolasib Hospital"
      ],
      "Mamit": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Mamit Hospital"
      ],
      "Saitual": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Saitual Hospital"
      ],
      "Lawngtlai": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Lawngtlai Hospital"
      ],
      "Hnahthial": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Hnahthial Hospital"
      ],
      "Khawzawl": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Synod Hospital", "Khawzawl Hospital"
      ]
    },
    "Nagaland": {
      "Kohima": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Kohima Hospital"
      ],
      "Dimapur": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Dimapur Hospital"
      ],
      "Mokokchung": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Mokokchung Hospital"
      ],
      "Tuensang": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Tuensang Hospital"
      ],
      "Wokha": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Wokha Hospital"
      ],
      "Zunheboto": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Zunheboto Hospital"
      ],
      "Phek": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Phek Hospital"
      ],
      "Kiphire": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Kiphire Hospital"
      ],
      "Longleng": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Longleng Hospital"
      ],
      "Peren": [
        "District Hospital", "Apollo Hospital", "Bethany Hospital",
        "Naga Hospital", "Peren Hospital"
      ]
    },
    "Odisha": {
      "Bhubaneswar": [
        "AIIMS Bhubaneswar", "Apollo Hospital", "KIMS Hospital", "Sum Hospital",
        "Care Hospital", "Hi-Tech Medical College Hospital", "Capital Hospital",
        "Ashwini Hospital", "Lalchand Hospital", "Bhubaneswar Hospital"
      ],
      "Cuttack": [
        "SCB Medical College Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Cuttack Hospital"
      ],
      "Rourkela": [
        "Ispat General Hospital", "Apollo Hospital", "Care Hospital",
        "Rourkela Hospital", "Civil Hospital", "Rourkela Hospital"
      ],
      "Berhampur": [
        "MKCG Medical College Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Berhampur Hospital"
      ],
      "Sambalpur": [
        "VIMSAR Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Sambalpur Hospital"
      ],
      "Balasore": [
        "FM Medical College Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Balasore Hospital"
      ],
      "Puri": [
        "District Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Puri Hospital"
      ],
      "Cuttack": [
        "SCB Medical College Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Cuttack Hospital"
      ],
      "Dhenkanal": [
        "District Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Dhenkanal Hospital"
      ],
      "Angul": [
        "District Hospital", "Apollo Hospital", "Care Hospital",
        "Ashwini Hospital", "Sparsh Hospital", "Shanti Hospital", "Angul Hospital"
      ]
    },
    "Punjab": {
      "Chandigarh": [
        "PGIMER", "Government Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Alchemist Hospital", "Mukat Hospital", "IVY Hospital", "Chandigarh Hospital"
      ],
      "Ludhiana": [
        "Dayanand Medical College Hospital", "Christian Medical College Hospital",
        "Apollo Hospital", "Fortis Hospital", "Hero DMC Heart Institute", "Ludhiana Hospital"
      ],
      "Amritsar": [
        "Government Medical College Hospital", "Fortis Hospital", "Apollo Hospital",
        "Maharaja Ranjit Singh Hospital", "Amandeep Hospital", "Amritsar Hospital"
      ],
      "Jalandhar": [
        "Civil Hospital", "Apollo Hospital", "Jalandhar Hospital", "Mittal Hospital",
        "Pruthi Hospital", "Chintpurni Hospital", "Jalandhar Hospital"
      ],
      "Patiala": [
        "Government Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Maharaja Ranjit Singh Hospital", "Amandeep Hospital", "Patiala Hospital"
      ],
      "Bathinda": [
        "Civil Hospital", "Apollo Hospital", "Fortis Hospital",
        "Maharaja Ranjit Singh Hospital", "Amandeep Hospital", "Bathinda Hospital"
      ],
      "Mohali": [
        "Civil Hospital", "Apollo Hospital", "Fortis Hospital",
        "Maharaja Ranjit Singh Hospital", "Amandeep Hospital", "Mohali Hospital"
      ],
      "Firozpur": [
        "Civil Hospital", "Apollo Hospital", "Fortis Hospital",
        "Maharaja Ranjit Singh Hospital", "Amandeep Hospital", "Firozpur Hospital"
      ],
      "Pathankot": [
        "Civil Hospital", "Apollo Hospital", "Fortis Hospital",
        "Maharaja Ranjit Singh Hospital", "Amandeep Hospital", "Pathankot Hospital"
      ],
      "Hoshiarpur": [
        "Civil Hospital", "Apollo Hospital", "Fortis Hospital",
        "Maharaja Ranjit Singh Hospital", "Amandeep Hospital", "Hoshiarpur Hospital"
      ]
    },
    "Rajasthan": {
      "Jaipur": [
        "Fortis Hospital", "SMS Hospital", "Mahatma Gandhi Hospital", "Eternal Heart Hospital",
        "Narayana Hospital", "Apollo Hospital", "Santokba Durlabhji Hospital", "Dhanwantri Hospital",
        "Jeevan Rekha Hospital", "Metas Hospital", "Bhandari Hospital", "Bhagwan Mahaveer Hospital",
        "Rajasthan Hospital", "SDM Hospital", "Mahatma Gandhi Medical College", "Jaipur Hospital"
      ],
      "Jodhpur": [
        "AIIMS Jodhpur", "SN Medical College Hospital", "Mahatma Gandhi Hospital",
        "Medipulse Hospital", "Satyam Hospital", "Rajasthan Hospital", "Jodhpur Hospital"
      ],
      "Udaipur": [
        "GBH American Hospital", "Rajasthan Hospital", "Maharana Bhupal Hospital",
        "Geetanjali Hospital", "Pacific Hospital", "Aravinda Hospital", "Udaipur Hospital"
      ],
      "Kota": [
        "Government Medical College Hospital", "Eternal Hospital", "Rajasthan Hospital",
        "Narayana Hospital", "Kota Heart Hospital", "Kota Hospital"
      ],
      "Ajmer": [
        "JLN Hospital", "Mahatma Gandhi Hospital", "Rajasthan Hospital",
        "Apollo Hospital", "Fortis Hospital", "Ajmer Hospital"
      ],
      "Bikaner": [
        "SP Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Bikaner Hospital"
      ],
      "Alwar": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Alwar Hospital"
      ],
      "Bhilwara": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Bhilwara Hospital"
      ],
      "Baran": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Baran Hospital"
      ],
      "Barmer": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Barmer Hospital"
      ],
      "Bharatpur": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Bharatpur Hospital"
      ],
      "Bhilwara": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Bhilwara Hospital"
      ],
      "Bikaner": [
        "SP Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Bikaner Hospital"
      ],
      "Bundi": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Bundi Hospital"
      ],
      "Chittorgarh": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Chittorgarh Hospital"
      ],
      "Churu": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Churu Hospital"
      ],
      "Dausa": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Dausa Hospital"
      ],
      "Dholpur": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Dholpur Hospital"
      ],
      "Dungarpur": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Dungarpur Hospital"
      ],
      "Ganganagar": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Ganganagar Hospital"
      ],
      "Hanumangarh": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Hanumangarh Hospital"
      ],
      "Jaipur": [
        "Fortis Hospital", "SMS Hospital", "Mahatma Gandhi Hospital", "Eternal Heart Hospital",
        "Narayana Hospital", "Apollo Hospital", "Santokba Durlabhji Hospital", "Dhanwantri Hospital",
        "Jeevan Rekha Hospital", "Metas Hospital", "Bhandari Hospital", "Bhagwan Mahaveer Hospital",
        "Rajasthan Hospital", "SDM Hospital", "Mahatma Gandhi Medical College", "Jaipur Hospital"
      ],
      "Jaisalmer": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Jaisalmer Hospital"
      ],
      "Jalore": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Jalore Hospital"
      ],
      "Jhalawar": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Jhalawar Hospital"
      ],
      "Jhunjhunu": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Jhunjhunu Hospital"
      ],
      "Jodhpur": [
        "AIIMS Jodhpur", "SN Medical College Hospital", "Mahatma Gandhi Hospital",
        "Medipulse Hospital", "Satyam Hospital", "Rajasthan Hospital", "Jodhpur Hospital"
      ],
      "Karauli": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Karauli Hospital"
      ],
      "Kota": [
        "Government Medical College Hospital", "Eternal Hospital", "Rajasthan Hospital",
        "Narayana Hospital", "Kota Heart Hospital", "Kota Hospital"
      ],
      "Nagaur": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Nagaur Hospital"
      ],
      "Pali": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Pali Hospital"
      ],
      "Pratapgarh": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Pratapgarh Hospital"
      ],
      "Rajsamand": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Rajsamand Hospital"
      ],
      "Sawai Madhopur": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Sawai Madhopur Hospital"
      ],
      "Sikar": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Sikar Hospital"
      ],
      "Sirohi": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Sirohi Hospital"
      ],
      "Tonk": [
        "District Hospital", "Apollo Hospital", "Fortis Hospital",
        "Rajasthan Hospital", "Tonk Hospital"
      ],
      "Udaipur": [
        "GBH American Hospital", "Rajasthan Hospital", "Maharana Bhupal Hospital",
        "Geetanjali Hospital", "Pacific Hospital", "Aravinda Hospital", "Udaipur Hospital"
      ]
    },
    "Gujarat": {
      "Ahmedabad": [
        "Apollo Hospital", "Zydus Hospital", "Sterling Hospital", "CIMS Hospital",
        "Shalby Hospital", "Sola Civil Hospital", "VS Hospital", "Ahmedabad Hospital"
      ],
      "Surat": [
        "Apollo Hospital", "Mahavir Hospital", "Surat Hospital", "Civil Hospital",
        "Diamond Hospital", "Surat Hospital"
      ],
      "Vadodara": [
        "Apollo Hospital", "Saraswati Hospital", "Sayaji Hospital", "Civil Hospital",
        "Karamsad Hospital", "Vadodara Hospital"
      ],
      "Rajkot": [
        "Apollo Hospital", "Wockhardt Hospital", "Civil Hospital", "Pandit Deendayal Hospital",
        "Rajkot Hospital", "Rajkot Hospital"
      ],
      "Gandhinagar": [
        "Apollo Hospital", "Civil Hospital", "Gandhinagar Hospital",
        "GMERS Hospital", "Gandhinagar Hospital"
      ],
      "Bhavnagar": [
        "Apollo Hospital", "Civil Hospital", "Sir Takhtsinhji Hospital",
        "Bhavnagar Hospital", "Bhavnagar Hospital"
      ],
      "Jamnagar": [
        "Apollo Hospital", "Civil Hospital", "Guru Gobind Singh Hospital",
        "Jamnagar Hospital", "Jamnagar Hospital"
      ],
      "Junagadh": [
        "Apollo Hospital", "Civil Hospital", "Junagadh Hospital",
        "Junagadh Hospital", "Junagadh Hospital"
      ],
      "Anand": [
        "Apollo Hospital", "Civil Hospital", "Anand Hospital",
        "Anand Hospital", "Anand Hospital"
      ],
      "Mehsana": [
        "Apollo Hospital", "Civil Hospital", "Mehsana Hospital",
        "Mehsana Hospital", "Mehsana Hospital"
      ],
      "Amreli": [
        "Apollo Hospital", "Civil Hospital", "Amreli Hospital",
        "Amreli Hospital", "Amreli Hospital"
      ],
      "Aravalli": [
        "Apollo Hospital", "Civil Hospital", "Aravalli Hospital",
        "Aravalli Hospital", "Aravalli Hospital"
      ],
      "Banaskantha": [
        "Apollo Hospital", "Civil Hospital", "Banaskantha Hospital",
        "Banaskantha Hospital", "Banaskantha Hospital"
      ],
      "Bharuch": [
        "Apollo Hospital", "Civil Hospital", "Bharuch Hospital",
        "Bharuch Hospital", "Bharuch Hospital"
      ],
      "Botad": [
        "Apollo Hospital", "Civil Hospital", "Botad Hospital",
        "Botad Hospital", "Botad Hospital"
      ],
      "Chhota Udepur": [
        "Apollo Hospital", "Civil Hospital", "Chhota Udepur Hospital",
        "Chhota Udepur Hospital", "Chhota Udepur Hospital"
      ],
      "Dahod": [
        "Apollo Hospital", "Civil Hospital", "Dahod Hospital",
        "Dahod Hospital", "Dahod Hospital"
      ],
      "Devbhoomi Dwarka": [
        "Apollo Hospital", "Civil Hospital", "Devbhoomi Dwarka Hospital",
        "Devbhoomi Dwarka Hospital", "Devbhoomi Dwarka Hospital"
      ],
      "Dang": [
        "Apollo Hospital", "Civil Hospital", "Dang Hospital",
        "Dang Hospital", "Dang Hospital"
      ]
    },
    "West Bengal": {
      "Kolkata": [
        "Apollo Gleneagles Hospital", "Fortis Hospital", "AMRI Hospital", "Medica Hospital",
        "IPGMER Hospital", "SSKM Hospital", "RG Kar Hospital", "Calcutta Hospital"
      ],
      "Howrah": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Howrah Hospital", "Howrah Hospital"
      ],
      "Durgapur": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Durgapur Hospital", "Durgapur Hospital"
      ],
      "Asansol": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Asansol Hospital", "Asansol Hospital"
      ],
      "Siliguri": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Siliguri Hospital", "Siliguri Hospital"
      ],
      "Burdwan": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Burdwan Hospital", "Burdwan Hospital"
      ],
      "Malda": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Malda Hospital", "Malda Hospital"
      ],
      "Cooch Behar": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Cooch Behar Hospital", "Cooch Behar Hospital"
      ],
      "Darjeeling": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Darjeeling Hospital", "Darjeeling Hospital"
      ],
      "Hooghly": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Hooghly Hospital", "Hooghly Hospital"
      ],
      "Murshidabad": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Murshidabad Hospital", "Murshidabad Hospital"
      ],
      "Nadia": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Nadia Hospital", "Nadia Hospital"
      ],
      "North 24 Parganas": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "North 24 Parganas Hospital", "North 24 Parganas Hospital"
      ],
      "South 24 Parganas": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "South 24 Parganas Hospital", "South 24 Parganas Hospital"
      ],
      "Bankura": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Bankura Hospital", "Bankura Hospital"
      ],
      "Birbhum": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Birbhum Hospital", "Birbhum Hospital"
      ],
      "East Midnapore": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "East Midnapore Hospital", "East Midnapore Hospital"
      ],
      "West Midnapore": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "West Midnapore Hospital", "West Midnapore Hospital"
      ],
      "Purulia": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Purulia Hospital", "Purulia Hospital"
      ],
      "Uttar Dinajpur": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Uttar Dinajpur Hospital", "Uttar Dinajpur Hospital"
      ],
      "Dakshin Dinajpur": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Dakshin Dinajpur Hospital", "Dakshin Dinajpur Hospital"
      ],
      "Jalpaiguri": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Jalpaiguri Hospital", "Jalpaiguri Hospital"
      ],
      "Alipurduar": [
        "Apollo Hospital", "Fortis Hospital", "Medica Hospital",
        "Alipurduar Hospital", "Alipurduar Hospital"
      ]
    },
    "Tamil Nadu": {
      "Chennai": [
        "Apollo Hospitals", "Fortis Malar Hospital", "MIOT Hospital", "Sri Ramachandra Hospital",
        "Global Hospitals", "Kauvery Hospital", "Vijaya Hospital", "Billroth Hospital",
        "Madras Medical Mission", "LifeLine Hospital", "SIMS Hospital", "Deepam Hospital",
        "Government General Hospital", "Kilpauk Medical College", "Stanley Hospital",
        "Royapettah Hospital", "Government Omandurar Hospital", "Chennai Hospital"
      ],
      "Coimbatore": [
        "KMCH Hospital", "PSG Hospital", "Ganga Hospital", "Kovai Medical Center",
        "Sri Ramakrishna Hospital", "CIMS Hospital", "KG Hospital", "PSG Hospitals",
        "Government Medical College Hospital", "Kovai Medical Center", "Coimbatore Hospital"
      ],
      "Madurai": [
        "Meenakshi Hospital", "Apollo Hospital", "Vijaya Hospital", "Government Rajaji Hospital",
        "Vadivelan Hospital", "Aarupadai Veedu Hospital", "Malar Hospital", "Madurai Hospital"
      ],
      "Trichy": [
        "Apollo Hospital", "KMC Hospital", "Sri Muthukumaran Hospital", "Government Hospital",
        "Kaveri Hospital", "Jeyaraj Hospital", "Anbu Hospital", "Trichy Hospital"
      ],
      "Salem": [
        "Government Hospital", "Vijaya Hospital", "Kumaran Hospital", "Sri Sairam Hospital",
        "Apollo Hospital", "Sankar Hospital", "KMCH Hospital", "Salem Hospital"
      ],
      "Tirunelveli": [
        "Government Hospital", "Apollo Hospital", "TVM Hospital", "Arul Hospital",
        "St. Xavier Hospital", "Anbu Hospital", "Sri Muthukumaran Hospital", "Tirunelveli Hospital"
      ],
      "Erode": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Kongu Hospital",
        "Sri Sakthi Hospital", "Anbu Hospital", "Chelliam Hospital", "Erode Hospital"
      ],
      "Vellore": [
        "CMC Hospital", "Government Hospital", "Apollo Hospital", "Sri Ramachandra Hospital",
        "Vijaya Hospital", "Anbu Hospital", "Sri Muthukumaran Hospital", "Vellore Hospital"
      ],
      "Tirupur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Kongu Hospital",
        "Sri Sakthi Hospital", "Anbu Hospital", "Chelliam Hospital", "Tirupur Hospital"
      ],
      "Thanjavur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Kongu Hospital",
        "Sri Sakthi Hospital", "Anbu Hospital", "Chelliam Hospital", "Thanjavur Hospital"
      ],
      "Kanchipuram": [
        "Government Hospital", "Apollo Hospital", "Sri Ramachandra Hospital",
        "Chengalpattu Medical College Hospital", "Kanchipuram Hospital"
      ],
      "Dindigul": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Dindigul Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Dindigul Hospital"
      ],
      "Karur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Karur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Karur Hospital"
      ],
      "Namakkal": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Namakkal Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Namakkal Hospital"
      ],
      "Krishnagiri": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Krishnagiri Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Krishnagiri Hospital"
      ],
      "Dharmapuri": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Dharmapuri Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Dharmapuri Hospital"
      ],
      "Tiruvannamalai": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Tiruvannamalai Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Tiruvannamalai Hospital"
      ],
      "Villupuram": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Villupuram Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Villupuram Hospital"
      ],
      "Cuddalore": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Cuddalore Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Cuddalore Hospital"
      ],
      "Nagapattinam": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Nagapattinam Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Nagapattinam Hospital"
      ],
      "Thiruvarur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Thiruvarur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Thiruvarur Hospital"
      ],
      "Pudukkottai": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Pudukkottai Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Pudukkottai Hospital"
      ],
      "Ramanathapuram": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Ramanathapuram Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Ramanathapuram Hospital"
      ],
      "Sivaganga": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Sivaganga Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Sivaganga Hospital"
      ],
      "Virudhunagar": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Virudhunagar Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Virudhunagar Hospital"
      ],
      "Theni": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Theni Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Theni Hospital"
      ],
      "Kanyakumari": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Kanyakumari Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Kanyakumari Hospital"
      ],
      "Ariyalur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Ariyalur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Ariyalur Hospital"
      ],
      "Perambalur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Perambalur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Perambalur Hospital"
      ],
      "Chengalpattu": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Chengalpattu Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Chengalpattu Hospital"
      ],
      "Tenkasi": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Tenkasi Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Tenkasi Hospital"
      ],
      "Tirupathur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Tirupathur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Tirupathur Hospital"
      ],
      "Ranipet": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Ranipet Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Ranipet Hospital"
      ],
      "Tirupattur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Tirupattur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Tirupattur Hospital"
      ],
      "Kallakurichi": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Kallakurichi Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Kallakurichi Hospital"
      ],
      "Thiruvallur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Thiruvallur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Thiruvallur Hospital"
      ],
      "Tiruppur": [
        "Government Hospital", "Apollo Hospital", "KMCH Hospital", "Tiruppur Hospital",
        "Gandhi Hospital", "Mariamman Hospital", "Tiruppur Hospital"
      ]
    },
    "Telangana": {
      "Hyderabad": [
        "Apollo Hospitals", "Care Hospitals", "Yashoda Hospitals", "KIMS Hospitals",
        "Continental Hospitals", "Global Hospitals", "Sunshine Hospitals", "Medicover Hospitals",
        "Nizam's Institute of Medical Sciences", "Owaisi Hospital", "Gandhi Hospital",
        "Kamineni Hospitals", "Rainbow Hospitals", "Citizens Hospital", "Prasad Hospital",
        "Asian Institute of Gastroenterology", "Basavatarakam Hospital", "Hyderabad Hospital"
      ],
      "Warangal": [
        "Mahatma Gandhi Hospital", "Kamineni Hospital", "Apollo Hospital",
        "SVS Medical College Hospital", "MGM Hospital", "Warangal Hospital"
      ],
      "Nizamabad": [
        "Government Hospital", "Nizam's Institute of Medical Sciences", "Apollo Hospital",
        "Care Hospital", "Sri Sai Hospital", "Nizamabad Hospital"
      ],
      "Karimnagar": [
        "Government Hospital", "Apollo Hospital", "Care Hospital",
        "Sri Sai Hospital", "Karimnagar Hospital"
      ],
      "Khammam": [
        "Government Hospital", "Apollo Hospital", "Care Hospital",
        "Sri Sai Hospital", "Khammam Hospital"
      ],
      "Ramagundam": [
        "Government Hospital", "Apollo Hospital", "Care Hospital",
        "Sri Sai Hospital", "Ramagundam Hospital"
      ],
      "Mahabubnagar": [
        "Government Hospital", "Apollo Hospital", "Care Hospital",
        "Sri Sai Hospital", "Mahabubnagar Hospital"
      ],
      "Nalgonda": [
        "Government Hospital", "Apollo Hospital", "Care Hospital",
        "Sri Sai Hospital", "Nalgonda Hospital"
      ],
      "Adilabad": [
        "Government Hospital", "Apollo Hospital", "Care Hospital",
        "Sri Sai Hospital", "Adilabad Hospital"
      ],
      "Medak": [
        "Government Hospital", "Apollo Hospital", "Care Hospital",
        "Sri Sai Hospital", "Medak Hospital"
      ]
    },
    "Tripura": {
      "Agartala": [
        "GB Pant Hospital", "Agartala Government Medical College Hospital", "Apollo Hospital",
        "Tripura Hospital", "Agartala Hospital"
      ],
      "Udaipur": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Udaipur Hospital"
      ],
      "Dharmanagar": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Dharmanagar Hospital"
      ],
      "Kailashahar": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Kailashahar Hospital"
      ],
      "Belonia": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Belonia Hospital"
      ],
      "Khowai": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Khowai Hospital"
      ],
      "Teliamura": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Teliamura Hospital"
      ],
      "Kamalpur": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Kamalpur Hospital"
      ],
      "Ambassa": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Ambassa Hospital"
      ],
      "Gandacherra": [
        "District Hospital", "Apollo Hospital", "Tripura Hospital",
        "Agartala Hospital", "Gandacherra Hospital"
      ]
    },
    "Uttar Pradesh": {
      "Lucknow": [
        "SGPGIMS", "KGMU", "Medanta Hospital", "Apollo Hospital", "Fortis Hospital",
        "CARE Hospital", "Sahara Hospital", "Dr. Ram Manohar Lohia Hospital",
        "Civil Hospital", "Queen Mary's Hospital", "Balrampur Hospital", "Mayo Hospital", "Lucknow Hospital"
      ],
      "Kanpur": [
        "Hallet Hospital", "Regency Hospital", "Apollo Hospital", "Fortis Hospital",
        "GSVM Medical College", "Lala Lajpat Rai Hospital", "Mohan Hospital",
        "Uttam Hospital", "Jwala Hospital", "Kanpur Hospital"
      ],
      "Agra": [
        "S.N. Medical College Hospital", "Apollo Hospital", "Pushpanjali Hospital",
        "Safdar Hospital", "Mohan Hospital", "Jeevan Hospital", "Agra Hospital"
      ],
      "Varanasi": [
        "BHU Hospital", "Heritage Hospital", "Apollo Hospital", "Satyam Hospital",
        "Paras Hospital", "Sri Krishna Hospital", "Vijay Hospital", "Varanasi Hospital"
      ],
      "Allahabad": [
        "Moti Lal Nehru Hospital", "Swaroop Nehru Hospital", "Apollo Hospital",
        "Jeevan Jyoti Hospital", "Baba Raghav Das Hospital", "Allahabad Hospital"
      ],
      "Ghaziabad": [
        "Yashoda Hospital", "Max Hospital", "Columbia Asia Hospital", "Pushpanjali Hospital",
        "Santosh Hospital", "Ghaziabad Hospital", "Ghaziabad Hospital"
      ],
      "Noida": [
        "Fortis Hospital", "Max Hospital", "Jaypee Hospital", "Apollo Hospital",
        "Kailash Hospital", "Yatharth Hospital", "Metro Hospital", "Noida Hospital"
      ],
      "Meerut": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Meerut Hospital", "Meerut Hospital"
      ],
      "Bareilly": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bareilly Hospital", "Bareilly Hospital"
      ],
      "Aligarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Aligarh Hospital", "Aligarh Hospital"
      ],
      "Moradabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Moradabad Hospital", "Moradabad Hospital"
      ],
      "Saharanpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Saharanpur Hospital", "Saharanpur Hospital"
      ],
      "Gorakhpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gorakhpur Hospital", "Gorakhpur Hospital"
      ],
      "Jhansi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jhansi Hospital", "Jhansi Hospital"
      ],
      "Faizabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Faizabad Hospital", "Faizabad Hospital"
      ],
      "Mathura": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mathura Hospital", "Mathura Hospital"
      ],
      "Firozabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Firozabad Hospital", "Firozabad Hospital"
      ],
      "Shahjahanpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Shahjahanpur Hospital", "Shahjahanpur Hospital"
      ],
      "Muzaffarnagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Muzaffarnagar Hospital", "Muzaffarnagar Hospital"
      ],
      "Budaun": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Budaun Hospital", "Budaun Hospital"
      ],
      "Sitapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sitapur Hospital", "Sitapur Hospital"
      ],
      "Rae Bareli": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Rae Bareli Hospital", "Rae Bareli Hospital"
      ],
      "Mirzapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mirzapur Hospital", "Mirzapur Hospital"
      ],
      "Jaunpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jaunpur Hospital", "Jaunpur Hospital"
      ],
      "Sultanpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sultanpur Hospital", "Sultanpur Hospital"
      ],
      "Unnao": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Unnao Hospital", "Unnao Hospital"
      ],
      "Pilibhit": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pilibhit Hospital", "Pilibhit Hospital"
      ],
      "Lakhimpur Kheri": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Lakhimpur Kheri Hospital", "Lakhimpur Kheri Hospital"
      ],
      "Bahraich": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bahraich Hospital", "Bahraich Hospital"
      ],
      "Gonda": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gonda Hospital", "Gonda Hospital"
      ],
      "Barabanki": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Barabanki Hospital", "Barabanki Hospital"
      ],
      "Basti": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Basti Hospital", "Basti Hospital"
      ],
      "Siddharthnagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Siddharthnagar Hospital", "Siddharthnagar Hospital"
      ],
      "Maharajganj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Maharajganj Hospital", "Maharajganj Hospital"
      ],
      "Kushinagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kushinagar Hospital", "Kushinagar Hospital"
      ],
      "Deoria": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Deoria Hospital", "Deoria Hospital"
      ],
      "Azamgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Azamgarh Hospital", "Azamgarh Hospital"
      ],
      "Mau": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mau Hospital", "Mau Hospital"
      ],
      "Ballia": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ballia Hospital", "Ballia Hospital"
      ],
      "Ghaziabad": [
        "Yashoda Hospital", "Max Hospital", "Columbia Asia Hospital", "Pushpanjali Hospital",
        "Santosh Hospital", "Ghaziabad Hospital", "Ghaziabad Hospital"
      ],
      "Gautam Buddha Nagar": [
        "Yashoda Hospital", "Max Hospital", "Columbia Asia Hospital", "Pushpanjali Hospital",
        "Santosh Hospital", "Gautam Buddha Nagar Hospital", "Gautam Buddha Nagar Hospital"
      ],
      "Bulandshahr": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bulandshahr Hospital", "Bulandshahr Hospital"
      ],
      "Aligarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Aligarh Hospital", "Aligarh Hospital"
      ],
      "Hathras": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Hathras Hospital", "Hathras Hospital"
      ],
      "Kasganj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kasganj Hospital", "Kasganj Hospital"
      ],
      "Etah": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Etah Hospital", "Etah Hospital"
      ],
      "Mainpuri": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mainpuri Hospital", "Mainpuri Hospital"
      ],
      "Farrukhabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Farrukhabad Hospital", "Farrukhabad Hospital"
      ],
      "Kannauj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kannauj Hospital", "Kannauj Hospital"
      ],
      "Kanpur Dehat": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kanpur Dehat Hospital", "Kanpur Dehat Hospital"
      ],
      "Kanpur Nagar": [
        "Hallet Hospital", "Regency Hospital", "Apollo Hospital", "Fortis Hospital",
        "GSVM Medical College", "Lala Lajpat Rai Hospital", "Mohan Hospital",
        "Uttam Hospital", "Jwala Hospital", "Kanpur Nagar Hospital"
      ],
      "Etawah": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Etawah Hospital", "Etawah Hospital"
      ],
      "Auraiya": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Auraiya Hospital", "Auraiya Hospital"
      ],
      "Ramabai Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ramabai Nagar Hospital", "Ramabai Nagar Hospital"
      ],
      "Fatehpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Fatehpur Hospital", "Fatehpur Hospital"
      ],
      "Kaushambi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kaushambi Hospital", "Kaushambi Hospital"
      ],
      "Pratapgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pratapgarh Hospital", "Pratapgarh Hospital"
      ],
      "Ambedkar Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ambedkar Nagar Hospital", "Ambedkar Nagar Hospital"
      ],
      "Bahraich": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bahraich Hospital", "Bahraich Hospital"
      ],
      "Shrawasti": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Shrawasti Hospital", "Shrawasti Hospital"
      ],
      "Balrampur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Balrampur Hospital", "Balrampur Hospital"
      ],
      "Gonda": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gonda Hospital", "Gonda Hospital"
      ],
      "Siddharthnagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Siddharthnagar Hospital", "Siddharthnagar Hospital"
      ],
      "Basti": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Basti Hospital", "Basti Hospital"
      ],
      "Sant Kabir Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sant Kabir Nagar Hospital", "Sant Kabir Nagar Hospital"
      ],
      "Maharajganj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Maharajganj Hospital", "Maharajganj Hospital"
      ],
      "Gorakhpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gorakhpur Hospital", "Gorakhpur Hospital"
      ],
      "Kushinagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kushinagar Hospital", "Kushinagar Hospital"
      ],
      "Deoria": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Deoria Hospital", "Deoria Hospital"
      ],
      "Azamgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Azamgarh Hospital", "Azamgarh Hospital"
      ],
      "Mau": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mau Hospital", "Mau Hospital"
      ],
      "Ballia": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ballia Hospital", "Ballia Hospital"
      ],
      "Jaunpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jaunpur Hospital", "Jaunpur Hospital"
      ],
      "Ghazipur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ghazipur Hospital", "Ghazipur Hospital"
      ],
      "Chandauli": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Chandauli Hospital", "Chandauli Hospital"
      ],
      "Varanasi": [
        "BHU Hospital", "Heritage Hospital", "Apollo Hospital", "Satyam Hospital",
        "Paras Hospital", "Sri Krishna Hospital", "Vijay Hospital", "Varanasi Hospital"
      ],
      "Sonbhadra": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sonbhadra Hospital", "Sonbhadra Hospital"
      ],
      "Mirzapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mirzapur Hospital", "Mirzapur Hospital"
      ],
      "Bhadohi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bhadohi Hospital", "Bhadohi Hospital"
      ],
      "Sant Ravidas Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sant Ravidas Nagar Hospital", "Sant Ravidas Nagar Hospital"
      ],
      "Allahabad": [
        "Moti Lal Nehru Hospital", "Swaroop Nehru Hospital", "Apollo Hospital",
        "Jeevan Jyoti Hospital", "Baba Raghav Das Hospital", "Allahabad Hospital"
      ],
      "Kaushambi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kaushambi Hospital", "Kaushambi Hospital"
      ],
      "Pratapgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pratapgarh Hospital", "Pratapgarh Hospital"
      ],
      "Fatehpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Fatehpur Hospital", "Fatehpur Hospital"
      ],
      "Kanpur Dehat": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kanpur Dehat Hospital", "Kanpur Dehat Hospital"
      ],
      "Jalaun": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jalaun Hospital", "Jalaun Hospital"
      ],
      "Jhansi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jhansi Hospital", "Jhansi Hospital"
      ],
      "Lalitpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Lalitpur Hospital", "Lalitpur Hospital"
      ],
      "Hamirpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Hamirpur Hospital", "Hamirpur Hospital"
      ],
      "Mahoba": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mahoba Hospital", "Mahoba Hospital"
      ],
      "Banda": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Banda Hospital", "Banda Hospital"
      ],
      "Chitrakoot": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Chitrakoot Hospital", "Chitrakoot Hospital"
      ],
      "Fatehpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Fatehpur Hospital", "Fatehpur Hospital"
      ],
      "Rae Bareli": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Rae Bareli Hospital", "Rae Bareli Hospital"
      ],
      "Barabanki": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Barabanki Hospital", "Barabanki Hospital"
      ],
      "Sitapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sitapur Hospital", "Sitapur Hospital"
      ],
      "Hardoi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Hardoi Hospital", "Hardoi Hospital"
      ],
      "Unnao": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Unnao Hospital", "Unnao Hospital"
      ],
      "Lucknow": [
        "SGPGIMS", "KGMU", "Medanta Hospital", "Apollo Hospital", "Fortis Hospital",
        "CARE Hospital", "Sahara Hospital", "Dr. Ram Manohar Lohia Hospital",
        "Civil Hospital", "Queen Mary's Hospital", "Balrampur Hospital", "Mayo Hospital", "Lucknow Hospital"
      ],
      "Kannauj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kannauj Hospital", "Kannauj Hospital"
      ],
      "Kanpur Nagar": [
        "Hallet Hospital", "Regency Hospital", "Apollo Hospital", "Fortis Hospital",
        "GSVM Medical College", "Lala Lajpat Rai Hospital", "Mohan Hospital",
        "Uttam Hospital", "Jwala Hospital", "Kanpur Nagar Hospital"
      ],
      "Kanpur Dehat": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kanpur Dehat Hospital", "Kanpur Dehat Hospital"
      ],
      "Etawah": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Etawah Hospital", "Etawah Hospital"
      ],
      "Auraiya": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Auraiya Hospital", "Auraiya Hospital"
      ],
      "Mainpuri": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mainpuri Hospital", "Mainpuri Hospital"
      ],
      "Farrukhabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Farrukhabad Hospital", "Farrukhabad Hospital"
      ],
      "Kannauj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kannauj Hospital", "Kannauj Hospital"
      ],
      "Etah": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Etah Hospital", "Etah Hospital"
      ],
      "Hathras": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Hathras Hospital", "Hathras Hospital"
      ],
      "Kasganj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kasganj Hospital", "Kasganj Hospital"
      ],
      "Aligarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Aligarh Hospital", "Aligarh Hospital"
      ],
      "Mathura": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mathura Hospital", "Mathura Hospital"
      ],
      "Agra": [
        "S.N. Medical College Hospital", "Apollo Hospital", "Pushpanjali Hospital",
        "Safdar Hospital", "Mohan Hospital", "Jeevan Hospital", "Agra Hospital"
      ],
      "Firozabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Firozabad Hospital", "Firozabad Hospital"
      ],
      "Mainpuri": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mainpuri Hospital", "Mainpuri Hospital"
      ],
      "Bulandshahr": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bulandshahr Hospital", "Bulandshahr Hospital"
      ],
      "Gautam Buddha Nagar": [
        "Yashoda Hospital", "Max Hospital", "Columbia Asia Hospital", "Pushpanjali Hospital",
        "Santosh Hospital", "Gautam Buddha Nagar Hospital", "Gautam Buddha Nagar Hospital"
      ],
      "Ghaziabad": [
        "Yashoda Hospital", "Max Hospital", "Columbia Asia Hospital", "Pushpanjali Hospital",
        "Santosh Hospital", "Ghaziabad Hospital", "Ghaziabad Hospital"
      ],
      "Hapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Hapur Hospital", "Hapur Hospital"
      ],
      "Baghpat": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Baghpat Hospital", "Baghpat Hospital"
      ],
      "Meerut": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Meerut Hospital", "Meerut Hospital"
      ],
      "Muzaffarnagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Muzaffarnagar Hospital", "Muzaffarnagar Hospital"
      ],
      "Saharanpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Saharanpur Hospital", "Saharanpur Hospital"
      ],
      "Shamli": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Shamli Hospital", "Shamli Hospital"
      ],
      "Bijnor": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bijnor Hospital", "Bijnor Hospital"
      ],
      "Amroha": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Amroha Hospital", "Amroha Hospital"
      ],
      "Moradabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Moradabad Hospital", "Moradabad Hospital"
      ],
      "Rampur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Rampur Hospital", "Rampur Hospital"
      ],
      "Bareilly": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bareilly Hospital", "Bareilly Hospital"
      ],
      "Pilibhit": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pilibhit Hospital", "Pilibhit Hospital"
      ],
      "Shahjahanpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Shahjahanpur Hospital", "Shahjahanpur Hospital"
      ],
      "Lakhimpur Kheri": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Lakhimpur Kheri Hospital", "Lakhimpur Kheri Hospital"
      ],
      "Sitapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sitapur Hospital", "Sitapur Hospital"
      ],
      "Hardoi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Hardoi Hospital", "Hardoi Hospital"
      ],
      "Unnao": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Unnao Hospital", "Unnao Hospital"
      ],
      "Lucknow": [
        "SGPGIMS", "KGMU", "Medanta Hospital", "Apollo Hospital", "Fortis Hospital",
        "CARE Hospital", "Sahara Hospital", "Dr. Ram Manohar Lohia Hospital",
        "Civil Hospital", "Queen Mary's Hospital", "Balrampur Hospital", "Mayo Hospital", "Lucknow Hospital"
      ],
      "Barabanki": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Barabanki Hospital", "Barabanki Hospital"
      ],
      "Rae Bareli": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Rae Bareli Hospital", "Rae Bareli Hospital"
      ],
      "Amethi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Amethi Hospital", "Amethi Hospital"
      ],
      "Ambedkar Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ambedkar Nagar Hospital", "Ambedkar Nagar Hospital"
      ],
      "Ayodhya": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ayodhya Hospital", "Ayodhya Hospital"
      ],
      "Sultanpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sultanpur Hospital", "Sultanpur Hospital"
      ],
      "Pratapgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pratapgarh Hospital", "Pratapgarh Hospital"
      ],
      "Kaushambi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kaushambi Hospital", "Kaushambi Hospital"
      ],
      "Allahabad": [
        "Moti Lal Nehru Hospital", "Swaroop Nehru Hospital", "Apollo Hospital",
        "Jeevan Jyoti Hospital", "Baba Raghav Das Hospital", "Allahabad Hospital"
      ],
      "Pratapgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pratapgarh Hospital", "Pratapgarh Hospital"
      ],
      "Jaunpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jaunpur Hospital", "Jaunpur Hospital"
      ],
      "Ghazipur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ghazipur Hospital", "Ghazipur Hospital"
      ],
      "Chandauli": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Chandauli Hospital", "Chandauli Hospital"
      ],
      "Varanasi": [
        "BHU Hospital", "Heritage Hospital", "Apollo Hospital", "Satyam Hospital",
        "Paras Hospital", "Sri Krishna Hospital", "Vijay Hospital", "Varanasi Hospital"
      ],
      "Sonbhadra": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sonbhadra Hospital", "Sonbhadra Hospital"
      ],
      "Mirzapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mirzapur Hospital", "Mirzapur Hospital"
      ],
      "Bhadohi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bhadohi Hospital", "Bhadohi Hospital"
      ],
      "Sant Ravidas Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sant Ravidas Nagar Hospital", "Sant Ravidas Nagar Hospital"
      ],
      "Jaunpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jaunpur Hospital", "Jaunpur Hospital"
      ],
      "Ghazipur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ghazipur Hospital", "Ghazipur Hospital"
      ],
      "Mau": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mau Hospital", "Mau Hospital"
      ],
      "Ballia": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ballia Hospital", "Ballia Hospital"
      ],
      "Azamgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Azamgarh Hospital", "Azamgarh Hospital"
      ],
      "Gorakhpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gorakhpur Hospital", "Gorakhpur Hospital"
      ],
      "Deoria": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Deoria Hospital", "Deoria Hospital"
      ],
      "Kushinagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kushinagar Hospital", "Kushinagar Hospital"
      ],
      "Maharajganj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Maharajganj Hospital", "Maharajganj Hospital"
      ],
      "Siddharthnagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Siddharthnagar Hospital", "Siddharthnagar Hospital"
      ],
      "Basti": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Basti Hospital", "Basti Hospital"
      ],
      "Sant Kabir Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sant Kabir Nagar Hospital", "Sant Kabir Nagar Hospital"
      ],
      "Shrawasti": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Shrawasti Hospital", "Shrawasti Hospital"
      ],
      "Balrampur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Balrampur Hospital", "Balrampur Hospital"
      ],
      "Gonda": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gonda Hospital", "Gonda Hospital"
      ],
      "Bahraich": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bahraich Hospital", "Bahraich Hospital"
      ],
      "Lakhimpur Kheri": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Lakhimpur Kheri Hospital", "Lakhimpur Kheri Hospital"
      ],
      "Pilibhit": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pilibhit Hospital", "Pilibhit Hospital"
      ],
      "Shahjahanpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Shahjahanpur Hospital", "Shahjahanpur Hospital"
      ],
      "Bareilly": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bareilly Hospital", "Bareilly Hospital"
      ],
      "Badaun": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Badaun Hospital", "Badaun Hospital"
      ],
      "Rampur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Rampur Hospital", "Rampur Hospital"
      ],
      "Moradabad": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Moradabad Hospital", "Moradabad Hospital"
      ],
      "Sambhal": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sambhal Hospital", "Sambhal Hospital"
      ],
      "Bijnor": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bijnor Hospital", "Bijnor Hospital"
      ],
      "Amroha": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Amroha Hospital", "Amroha Hospital"
      ],
      "Rampur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Rampur Hospital", "Rampur Hospital"
      ],
      "Bareilly": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bareilly Hospital", "Bareilly Hospital"
      ],
      "Pilibhit": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Pilibhit Hospital", "Pilibhit Hospital"
      ],
      "Lakhimpur Kheri": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Lakhimpur Kheri Hospital", "Lakhimpur Kheri Hospital"
      ],
      "Bahraich": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bahraich Hospital", "Bahraich Hospital"
      ],
      "Shrawasti": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Shrawasti Hospital", "Shrawasti Hospital"
      ],
      "Balrampur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Balrampur Hospital", "Balrampur Hospital"
      ],
      "Gonda": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gonda Hospital", "Gonda Hospital"
      ],
      "Siddharthnagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Siddharthnagar Hospital", "Siddharthnagar Hospital"
      ],
      "Basti": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Basti Hospital", "Basti Hospital"
      ],
      "Sant Kabir Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sant Kabir Nagar Hospital", "Sant Kabir Nagar Hospital"
      ],
      "Maharajganj": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Maharajganj Hospital", "Maharajganj Hospital"
      ],
      "Kushinagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kushinagar Hospital", "Kushinagar Hospital"
      ],
      "Gorakhpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Gorakhpur Hospital", "Gorakhpur Hospital"
      ],
      "Deoria": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Deoria Hospital", "Deoria Hospital"
      ],
      "Kushinagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Kushinagar Hospital", "Kushinagar Hospital"
      ],
      "Azamgarh": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Azamgarh Hospital", "Azamgarh Hospital"
      ],
      "Mau": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mau Hospital", "Mau Hospital"
      ],
      "Ballia": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ballia Hospital", "Ballia Hospital"
      ],
      "Ghazipur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Ghazipur Hospital", "Ghazipur Hospital"
      ],
      "Jaunpur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Jaunpur Hospital", "Jaunpur Hospital"
      ],
      "Chandauli": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Chandauli Hospital", "Chandauli Hospital"
      ],
      "Varanasi": [
        "BHU Hospital", "Heritage Hospital", "Apollo Hospital", "Satyam Hospital",
        "Paras Hospital", "Sri Krishna Hospital", "Vijay Hospital", "Varanasi Hospital"
      ],
      "Sonbhadra": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sonbhadra Hospital", "Sonbhadra Hospital"
      ],
      "Mirzapur": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Mirzapur Hospital", "Mirzapur Hospital"
      ],
      "Bhadohi": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Bhadohi Hospital", "Bhadohi Hospital"
      ],
      "Sant Ravidas Nagar": [
        "Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Sant Ravidas Nagar Hospital", "Sant Ravidas Nagar Hospital"
      ]
    },
    "Uttarakhand": {
      "Dehradun": [
        "AIIMS Rishikesh", "Doon Hospital", "Max Hospital", "Clement Hospital",
        "Himalayan Hospital", "Shri Mahant Indiresh Hospital", "Civil Hospital", "Dehradun Hospital"
      ],
      "Haridwar": [
        "Civil Hospital", "Shri Mahant Indiresh Hospital", "Apollo Hospital",
        "Mata Chanan Devi Hospital", "Jeevan Jyoti Hospital", "Haridwar Hospital"
      ],
      "Roorkee": [
        "Civil Hospital", "Roorkee Hospital", "Apollo Hospital", "CMI Hospital",
        "Shri Mahant Indiresh Hospital", "Roorkee Hospital"
      ],
      "Haldwani": [
        "Civil Hospital", "Apollo Hospital", "Shri Mahant Indiresh Hospital",
        "Haldwani Hospital", "Haldwani Hospital"
      ],
      "Rishikesh": [
        "AIIMS Rishikesh", "Civil Hospital", "Apollo Hospital",
        "Shri Mahant Indiresh Hospital", "Rishikesh Hospital"
      ],
      "Kashipur": [
        "Civil Hospital", "Apollo Hospital", "Shri Mahant Indiresh Hospital",
        "Kashipur Hospital", "Kashipur Hospital"
      ],
      "Rudrapur": [
        "Civil Hospital", "Apollo Hospital", "Shri Mahant Indiresh Hospital",
        "Rudrapur Hospital", "Rudrapur Hospital"
      ],
      "Kotdwar": [
        "Civil Hospital", "Apollo Hospital", "Shri Mahant Indiresh Hospital",
        "Kotdwar Hospital", "Kotdwar Hospital"
      ],
      "Pithoragarh": [
        "Civil Hospital", "Apollo Hospital", "Shri Mahant Indiresh Hospital",
        "Pithoragarh Hospital", "Pithoragarh Hospital"
      ],
      "Champawat": [
        "Civil Hospital", "Apollo Hospital", "Shri Mahant Indiresh Hospital",
        "Champawat Hospital", "Champawat Hospital"
      ]
    },
    "West Bengal": {
      "Kolkata": [
        "Apollo Gleneagles Hospital", "Fortis Hospital", "AMRI Hospitals", "Ruby General Hospital",
        "Medica Superspecialty Hospital", "Peerless Hospital", "Belle Vue Clinic",
        "Calcutta Medical Research Institute", "Woodlands Hospital", "Desun Hospital",
        "Ilsan Hospital", "Sri Aurobindo Seva Kendra", "BM Birla Heart Research Centre",
        "RG Kar Medical College", "Medical College Kolkata", "Sambhunath Hospital", "Kolkata Hospital"
      ],
      "Siliguri": [
        "North Bengal Medical College Hospital", "Apollo Hospital", "Siliguri Hospital",
        "Medica North Bengal Clinic", "Maya Hospital", "Srijan Hospital", "Siliguri Hospital"
      ],
      "Durgapur": [
        "Bardhaman Medical College Hospital", "Apollo Hospital", "Durgapur Steel Hospital",
        "City Hospital", "Medica Hospital", "Eskag Hospital", "Durgapur Hospital"
      ],
      "Asansol": [
        "Asansol District Hospital", "Medica Hospital", "Eskag Hospital",
        "Apollo Hospital", "City Hospital", "Asansol Hospital"
      ],
      "Bardhaman": [
        "Bardhaman Medical College Hospital", "Apollo Hospital", "City Hospital",
        "Medica Hospital", "Eskag Hospital", "Bardhaman Hospital"
      ],
      "Malda": [
        "Malda Medical College Hospital", "Apollo Hospital", "City Hospital",
        "Medica Hospital", "Eskag Hospital", "Malda Hospital"
      ],
      "Jalpaiguri": [
        "Jalpaiguri Medical College Hospital", "Apollo Hospital", "City Hospital",
        "Medica Hospital", "Eskag Hospital", "Jalpaiguri Hospital"
      ],
      "Darjeeling": [
        "Darjeeling Medical College Hospital", "Apollo Hospital", "City Hospital",
        "Medica Hospital", "Eskag Hospital", "Darjeeling Hospital"
      ],
      "Bankura": [
        "Bankura Medical College Hospital", "Apollo Hospital", "City Hospital",
        "Medica Hospital", "Eskag Hospital", "Bankura Hospital"
      ],
      "Purulia": [
        "Purulia Medical College Hospital", "Apollo Hospital", "City Hospital",
        "Medica Hospital", "Eskag Hospital", "Purulia Hospital"
      ]
    },
    "Andaman & Nicobar Islands": {
      "Port Blair": [
        "GB Pant Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Andaman Hospital"
      ],
      "Car Nicobar": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Car Nicobar Hospital"
      ],
      "Great Nicobar": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Great Nicobar Hospital"
      ],
      "Little Andaman": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Little Andaman Hospital"
      ],
      "Havelock": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Havelock Hospital"
      ],
      "Neil": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Neil Hospital"
      ],
      "Long Island": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Long Island Hospital"
      ],
      "Mayabunder": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Mayabunder Hospital"
      ],
      "Diglipur": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Diglipur Hospital"
      ],
      "Rangat": [
        "District Hospital", "Apollo Hospital", "Port Blair Hospital",
        "District Hospital", "Rangat Hospital"
      ]
    },
    "Chandigarh": {
      "Chandigarh": [
        "PGIMER", "Government Medical College Hospital", "Apollo Hospital", "Fortis Hospital",
        "Max Hospital", "Alchemist Hospital", "Mukat Hospital", "IVY Hospital", "Chandigarh Hospital"
      ]
    },
    "Dadra & Nagar Haveli & Daman & Diu": {
      "Silvassa": [
        "Civil Hospital", "Apollo Hospital", "Silvassa Hospital",
        "District Hospital", "Silvassa Hospital"
      ],
      "Daman": [
        "Civil Hospital", "Apollo Hospital", "Daman Hospital",
        "District Hospital", "Daman Hospital"
      ],
      "Diu": [
        "Civil Hospital", "Apollo Hospital", "Diu Hospital",
        "District Hospital", "Diu Hospital"
      ]
    },
    "Delhi": {
      "New Delhi": [
        "AIIMS", "Apollo Hospital", "Fortis Escorts Heart Institute", "Max Healthcare",
        "Sir Ganga Ram Hospital", "BLK Super Speciality Hospital", "Indraprastha Apollo",
        "Safdarjung Hospital", "Ram Manohar Lohia Hospital", "Lady Hardinge Medical College",
        "Moolchand Hospital", "Batra Hospital", "Primus Hospital", "Delhi Hospital"
      ],
      "Gurgaon": [
        "Artemis Hospital", "Medanta - The Medicity", "Columbia Asia Hospital",
        "Primus Hospital", "Batra Hospital", "Paras Hospital", "Fortis Hospital",
        "Max Hospital", "Park Hospital", "Wockhardt Hospital", "Gurgaon Hospital"
      ],
      "Noida": [
        "Fortis Hospital", "Max Hospital", "Jaypee Hospital", "Apollo Hospital",
        "Kailash Hospital", "Yatharth Hospital", "Metro Hospital", "Navin Hospital", "Noida Hospital"
      ],
      "Faridabad": [
        "Fortis Hospital", "Metro Hospital", "Sarvodaya Hospital", "QRG Hospital",
        "Asian Hospital", "Bharat Family Hospital", "Faridabad Hospital"
      ],
      "Ghaziabad": [
        "Yashoda Hospital", "Max Hospital", "Columbia Asia Hospital", "Pushpanjali Hospital",
        "Santosh Hospital", "Ghaziabad Hospital", "Shanti Gopal Hospital", "Ghaziabad Hospital"
      ],
      "Greater Noida": [
        "Jaypee Hospital", "Yatharth Hospital", "Metro Hospital", "Navin Hospital",
        "Kailash Hospital", "Fortis Hospital", "Apollo Hospital", "Greater Noida Hospital"
      ]
    },
    "Jammu & Kashmir": {
      "Srinagar": [
        "SMHS Hospital", "SKIMS Hospital", "Sher-e-Kashmir Hospital", "Apollo Hospital",
        "Government Medical College Hospital", "Lal Ded Hospital", "Srinagar Hospital"
      ],
      "Jammu": [
        "Government Medical College Hospital", "Apollo Hospital", "SMGS Hospital",
        "Shri Mata Vaishno Devi Hospital", "Civil Hospital", "Jammu Hospital"
      ],
      "Anantnag": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Anantnag Hospital"
      ],
      "Baramulla": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Baramulla Hospital"
      ],
      "Kupwara": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Kupwara Hospital"
      ],
      "Pulwama": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Pulwama Hospital"
      ],
      "Shopian": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Shopian Hospital"
      ],
      "Kulgam": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Kulgam Hospital"
      ],
      "Bandipora": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Bandipora Hospital"
      ],
      "Ganderbal": [
        "Government Medical College Hospital", "SKIMS Hospital", "Apollo Hospital",
        "Civil Hospital", "Sher-e-Kashmir Hospital", "Ganderbal Hospital"
      ]
    },
    "Ladakh": {
      "Leh": [
        "SNM Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Leh Hospital"
      ],
      "Kargil": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Kargil Hospital"
      ],
      "Zanskar": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Zanskar Hospital"
      ],
      "Nubra": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Nubra Hospital"
      ],
      "Changthang": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Changthang Hospital"
      ],
      "Khalatse": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Khalatse Hospital"
      ],
      "Diskit": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Diskit Hospital"
      ],
      "Pangong": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Pangong Hospital"
      ],
      "Siachen": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Siachen Hospital"
      ],
      "Khardung": [
        "District Hospital", "Apollo Hospital", "Leh Hospital",
        "District Hospital", "Khardung Hospital"
      ]
    },
    "Lakshadweep": {
      "Kavaratti": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Kavaratti Hospital"
      ],
      "Agatti": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Agatti Hospital"
      ],
      "Bangaram": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Bangaram Hospital"
      ],
      "Kadmat": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Kadmat Hospital"
      ],
      "Minicoy": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Minicoy Hospital"
      ],
      "Kalpeni": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Kalpeni Hospital"
      ],
      "Andrott": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Andrott Hospital"
      ],
      "Kiltan": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Kiltan Hospital"
      ],
      "Chetlat": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Chetlat Hospital"
      ],
      "Bitra": [
        "District Hospital", "Apollo Hospital", "Kavaratti Hospital",
        "District Hospital", "Bitra Hospital"
      ]
    },
    "Puducherry": {
      "Pondicherry": [
        "JIPMER", "Indira Gandhi Hospital", "Apollo Hospital", "GH Hospital",
        "Mahatma Gandhi Hospital", "Sri Venkateswara Hospital", "Pondicherry Hospital"
      ],
      "Karaikal": [
        "District Hospital", "Apollo Hospital", "Pondicherry Hospital",
        "District Hospital", "Karaikal Hospital"
      ],
      "Mahe": [
        "District Hospital", "Apollo Hospital", "Pondicherry Hospital",
        "District Hospital", "Mahe Hospital"
      ],
      "Yanam": [
        "District Hospital", "Apollo Hospital", "Pondicherry Hospital",
        "District Hospital", "Yanam Hospital"
      ]
    }
  };

  // Helper functions for state-city-hospital mapping
  const getCitiesForState = (state) => {
    if (!state) return [];
    return Object.keys(stateCityHospitalData[state] || {});
  };

  const getHospitalsForCity = (state, city) => {
    if (!state || !city) return [];
    return stateCityHospitalData[state]?.[city] || [];
  };

  // Get all states for dropdown
  const allStates = Object.keys(stateCityHospitalData);

  // Get all cities for dropdown (for backward compatibility)
  const allCities = Object.keys(stateCityHospitalData).flatMap(state => 
    Object.keys(stateCityHospitalData[state])
  );

  // Handle city change
  const handleRequestCityChange = (e) => {
    const selectedCity = e.target.value;
    setRequestModalForm({ 
      ...requestForm, 
      city: selectedCity, 
      hospital: "" // Reset hospital when city changes
    });
  };

  // Handle state change
  const handleRequestStateChange = (e) => {
    const selectedState = e.target.value;
    setRequestModalForm({ 
      ...requestForm, 
      state: selectedState, 
      city: "", // Reset city when state changes
      hospital: "" // Reset hospital when state changes
    });
  };

  // Handle hospital change
  const handleRequestHospitalChange = (e) => {
    const selectedHospital = e.target.value;
    setRequestModalForm({ ...requestForm, hospital: selectedHospital });
  };

  const openRequestModal = (req = null) => {
    if (req) {
      setRequestModalForm({
        patientName: sanitizePatientName(req.patientName, { forSubmit: true }),
        bloodGroup: req.bloodGroup,
        units: req.units,
        hospital: req.hospital,
        urgency: req.urgency,
        city: req.location?.city || ""
      });
      setEditingRequestId(req._id);
      setIsEditing(true);
    } else {
      setRequestModalForm({
        patientName: "",
        bloodGroup: "O+",
        units: "",
        hospital: "",
        urgency: "Normal",
        city: ""
      });
      setEditingRequestId(null);
      setIsEditing(false);
    }
    setShowRequestModal(true);
  };

  const [labForm, setLabForm] = useState({
    testType: "Complete Blood Count (CBC)",
    preferredDate: "",
    address: user?.location?.address || ""
  });

  const isRequestsPage = location.pathname.includes("/requests");
  const isFindPage = location.pathname.includes("/find");
  const isLabPage = location.pathname.includes("/lab");
  const isSettingsPage = location.pathname.includes("/settings");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, requestsData, campsData, banksData] = await Promise.all([
        getPatientStats(),
        getMyBloodRequests(),
        getAllCamps(),
        getAllBloodBanks()
      ]);
      setStats(statsData);
      setMyRequests(requestsData);
      setCamps(campsData);
      setRealBloodBanks(banksData || []);
    } catch (err) {
      console.error("Failed to fetch patient data:", err);
      setError(err?.response?.data?.message || err?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remove top-level city and prepare location
      const { city, ...formData } = requestForm;
      const sanitizedFormData = {
        ...formData,
        patientName: sanitizePatientName(formData.patientName, { forSubmit: true })
      };
      const payload = {
        ...sanitizedFormData,
        location: {
          type: "Point",
          coordinates: [72.8777, 19.0760], // Placeholder
          city: city
        }
      };

      if (isEditing) {
        await updateBloodRequest(editingRequestId, payload);
        toast.success("Blood request updated!");
      } else {
        await createBloodRequest(payload);
        toast.success("Blood request created!");
      }

      setShowRequestModal(false);
      setIsEditing(false);
      setEditingRequestId(null);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} request`);
    }
  };

  const handleDeleteRequest = async (id) => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (reason === null) return;
    try {
      await deleteBloodRequest(id, reason);
      toast.success("Request cancelled");
      fetchData();
    } catch (err) {
      toast.error("Failed to cancel request");
    }
  };

  const handleRateDonor = async (ratingData) => {
    setSubmittingRating(true);
    try {
      await rateDonor({
        donorId: ratingDonorId,
        requestId: ratingRequestId,
        ...ratingData
      });
      toast.success("Thank you for your rating!");
      setRatingDonorId(null);
      setRatingRequestId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleConfirmReceived = async (requestId) => {
    setConfirming(requestId);
    try {
      await verifyRequestCompletion(requestId, "patient");
      toast.success("Donation confirmed! Thank you.");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to confirm donation");
    } finally {
      setConfirming(null);
    }
  };

  const handleBookLabTest = async (e) => {
    e.preventDefault();
    try {
      await bookBloodTest({
        patientName: sanitizePatientName(user?.name || "", { forSubmit: true }),
        address: labForm.address,
        phone: user?.phone,
        testType: labForm.testType
      });
      setShowLabModal(false);
      toast.success(`Lab test appointment scheduled for ${labForm.preferredDate || 'soon'}!`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to book lab test");
    }
  };

  if (user && String(user.role).toLowerCase() !== "patient") {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Medical Data...</p>
    </div>
  );

  const renderContent = () => {
    if (isRequestsPage) {
      return (
        <div className="space-y-10">
          <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">All Blood Requests</h3>
              <Button onClick={() => openRequestModal()} className="bg-red-600 hover:bg-red-700">New Request</Button>
            </div>
            <div className="space-y-6">
              {myRequests.map((req, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all group flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-200 group-hover:rotate-6 transition-transform">{req.bloodGroup}</div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-black text-2xl text-gray-900">{req.units} Units</p>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>{req.urgency}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {req.hospital}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest ${
                        req.status === "Pending" ? "bg-amber-50 text-amber-600" :
                        req.status === "Accepted" ? "bg-blue-50 text-blue-600" :
                        req.status === "Cancelled" ? "bg-gray-100 text-gray-400" :
                        req.status === "Rejected" ? "bg-red-50 text-red-600" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>{req.status}</span>
                    </div>
                  </div>

                  {req.status === "Rejected" && req.rejectionReason && (
                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                      <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Blood Bank Rejection Reason</p>
                      <p className="text-sm font-bold text-gray-700">{req.rejectionReason}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Notification has been sent to local donors to assist.</p>
                    </div>
                  )}

                  {/* Conditional Actions/Info */}
                  <div className="pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                    {req.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => openRequestModal(req)}
                          variant="outline" 
                          className="h-10 px-6 text-xs font-black uppercase border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center gap-2"
                        >
                          <Edit3 size={14} /> Edit
                        </Button>
                        <Button 
                          onClick={() => handleDeleteRequest(req._id)}
                          variant="outline" 
                          className="h-10 px-6 text-xs font-black uppercase border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    )}

                    {(req.status === "Accepted" || req.status === "Completed") && (req.acceptedBy || req.assignedBloodBank) && (
                      <div className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-50">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                              {req.acceptedByRole === 'bloodbank' ? <Home size={24} /> : <User size={24} />}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                {req.acceptedByRole === 'bloodbank' ? 'Blood Bank Details' : 'Donor Details'}
                              </p>
                              <div className="flex items-center gap-4">
                                <p className="font-bold text-lg text-gray-900">
                                  {req.acceptedByRole === 'bloodbank' ? req.assignedBloodBank?.name : req.acceptedBy?.name}
                                </p>
                                {(req.donorContact || (req.acceptedByRole === 'bloodbank' ? req.assignedBloodBank?.phone : req.acceptedBy?.phone)) && (
                                  <a 
                                    href={`tel:${req.donorContact || (req.acceptedByRole === 'bloodbank' ? req.assignedBloodBank.phone : req.acceptedBy.phone)}`} 
                                    className="flex items-center gap-2 text-xs font-black text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <Phone size={12} /> Call {req.acceptedByRole === 'bloodbank' ? 'Bank' : 'Donor'}
                                  </a>
                                )}
                              </div>
                              {req.acceptedByRole === 'bloodbank' && req.assignedBloodBank?.location && (
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                                  <MapPin size={10} /> {req.assignedBloodBank.location.address || req.assignedBloodBank.location.city || "Location not specified"}
                                </p>
                              )}
                            </div>
                          </div>

                          {req.status === "Accepted" && (
                            !req.completedByPatient ? (
                              <Button 
                                onClick={() => handleConfirmReceived(req._id)}
                                disabled={confirming === req._id}
                                className="bg-emerald-600 h-12 px-8 rounded-xl text-xs font-black uppercase tracking-widest"
                              >
                                {confirming === req._id ? "Confirming..." : "Mark as Received"}
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-black uppercase">Confirmed by You</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {req.status === "Completed" && (
                      <div className="flex items-center justify-between w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-2">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={20} className="text-emerald-500" />
                          <p className="text-sm font-bold text-gray-900">
                            Request successfully fulfilled by {req.acceptedByRole === 'bloodbank' ? req.assignedBloodBank?.name : req.acceptedBy?.name}
                          </p>
                        </div>
                        {req.acceptedByRole === 'donor' && !req.isRated && (
                          <Button 
                            onClick={() => {
                              setRatingDonorId(req.acceptedBy?._id);
                              setRatingRequestId(req._id);
                            }}
                            className="bg-red-600 h-10 px-6 text-[10px] font-black uppercase tracking-widest"
                          >
                            Rate Donor
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (isFindPage) {
      return (
        <div className="space-y-10">
          <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Find Nearby Donors</h3>
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 w-full md:w-96 group focus-within:bg-white focus-within:border-red-200 transition-all">
              <Search size={18} className="text-gray-400 group-focus-within:text-red-500" />
              <input 
                type="text" 
                placeholder="Search blood group or name..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="bg-transparent border-none outline-none px-4 text-sm font-bold w-full" 
              />
            </div>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredDonors.map((donor, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{donor.bloodGroup}</div>
                      <div>
                        <p className="font-black text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{donor.name}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{donor.location?.city || "Nearby"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-600 font-black text-lg">{donor.donorInfo?.reliability || 100}%</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reliability</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <a href={`tel:${donor.phone}`} className="flex-1">
                      <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-black uppercase tracking-widest text-[10px]">Contact Donor</Button>
                    </a>
                  </div>
                </motion.div>
              ))}
              {filteredBanks.map((bank, i) => (
                <motion.div key={`bank-${i}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-black text-xl group-hover:bg-red-600 group-hover:text-white transition-all duration-300"><Home size={24} /></div>
                      <div>
                        <p className="font-black text-xl text-gray-900 group-hover:text-red-600 transition-colors">{bank.name}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{bank.location?.city || "Local Center"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-black text-lg">{bank.bloodStock?.length || 0}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Groups in Stock</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <a href={`tel:${bank.phone}`} className="flex-1">
                      <Button className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 font-black uppercase tracking-widest text-[10px]">Contact Center</Button>
                    </a>
                  </div>
                </motion.div>
              ))}
              {filteredDonors.length === 0 && filteredBanks.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 font-bold">No donors or blood banks found matching your search.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    if (isLabPage) {
      return (
        <div className="space-y-10">
          <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Home Lab Tests</h3>
              <Button onClick={() => setShowLabModal(true)} className="bg-blue-600 hover:bg-blue-700">Book New Test</Button>
            </div>
            <div className="space-y-6">
              {labTests.map((test, i) => (
                <div key={i} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all"><Activity size={24} /></div>
                    <div><p className="font-black text-gray-900 text-lg">{test.test}</p><p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{test.date}</p></div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${test.status === "Report Ready" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{test.status}</span>
                    {test.status === "Report Ready" && <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Download PDF</button>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (isSettingsPage) {
      return (
        <div className="space-y-10">
          <Button onClick={() => navigate(dashboardPath("patient"))} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Account Settings</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="p-6 bg-gray-50 rounded-2xl">
                <p className="font-black text-gray-900 mb-2">Profile Information</p>
                <p className="text-sm text-gray-500 font-bold">Update your personal details and blood group.</p>
                <Button className="mt-4 bg-red-600 h-10 text-xs">Edit Profile</Button>
              </div>
              <div className="p-6 bg-red-50 rounded-2xl">
                <p className="font-black text-gray-900 mb-2">Change Password</p>
                <p className="text-sm text-gray-500 font-bold">Secure your account with a new password.</p>
                <Button 
                  onClick={() => window.open('/forgot-password', '_blank')}
                  className="mt-4 bg-red-600 h-10 text-xs"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
              Hello, <span className="text-red-600">{user?.name?.split(" ")[0]}!</span>
            </h1>
            <p className="text-gray-400 font-bold text-lg">Your health portal is ready.</p>
          </motion.div>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => openRequestModal()}
              className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"
            >
              <Plus size={24} /> New Request
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowLabModal(true)}
              className="h-14 px-8 rounded-2xl border-2 border-blue-100 text-blue-600 hover:bg-blue-50 text-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all"
            >
              <Home size={24} /> Book Lab Test
            </Button>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
            <ShieldCheck className="text-amber-500" /> {error}
          </motion.div>
        )}

      {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<StatsCard 
  title="Active Requests" 
  value={stats?.activeRequests ?? 0} 
  icon={() => <HeartPulse size={28} className="text-red-600" />}
  color="from-red-500 to-pink-600" 
/>

<StatsCard 
  title="Donors Found" 
  value={stats?.donorsFound ?? 0} 
  icon={() => <User size={28} className="text-blue-600" />}
  color="from-blue-500 to-indigo-600" 
/>

<StatsCard 
  title="Nearby Centers" 
  value={stats?.nearbyCenters ?? 0} 
  icon={() => <Home size={28} className="text-emerald-600" />}
  color="from-emerald-500 to-teal-600" 
/>

</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Requests */}
          <Card variant="glass" className="lg:col-span-2 p-10 border-none shadow-2xl shadow-gray-100/50">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Blood Requests</h3>
              <button
                type="button"
                onClick={() => navigate("/patient/requests")}
                className="text-red-600 font-black uppercase text-xs tracking-widest hover:underline decoration-2 underline-offset-4"
              >
                View History
              </button>
            </div>
            
            <div className="space-y-6">
              {myRequests.map((req, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all group gap-8"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-200 group-hover:rotate-6 transition-transform">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-2xl text-gray-900">{req.units}</p>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          req.urgency === "Emergency" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {req.urgency}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {req.hospital}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-end gap-4">
                      {req.status === "Pending" && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openRequestModal(req)}
                            variant="outline" 
                            className="h-10 px-6 text-xs font-black uppercase border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center gap-2"
                          >
                            <Edit3 size={14} /> Edit
                          </Button>
                          <Button 
                            onClick={() => handleDeleteRequest(req._id)}
                            variant="outline" 
                            className="h-10 px-6 text-xs font-black uppercase border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Cancel
                          </Button>
                        </div>
                      )}
                      {req.status === "Accepted" && (
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                              {req.acceptedByRole === 'bloodbank' ? <Home size={20} /> : <User size={20} />}
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                                {req.acceptedByRole === 'bloodbank' ? 'Assigned Bank' : 'Assigned Donor'}
                              </p>
                              <div className="flex items-center gap-3">
                                <p className="font-black text-gray-900">{req.acceptedBy?.name || req.assignedBloodBank?.name}</p>
                                <a href={`tel:${req.donorContact || req.acceptedBy?.phone || req.assignedBloodBank?.phone}`} className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-blue-100 text-blue-600 text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                                  <Phone size={12} /> Call Now
                                </a>
                              </div>
                            </div>
                          </div>
                          {!req.completedByPatient ? (
                            <Button 
                              onClick={() => handleConfirmReceived(req._id)}
                              disabled={confirming === req._id}
                              className="bg-emerald-600 h-10 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
                            >
                              {confirming === req._id ? "Confirming..." : "Mark as Received"}
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 py-2 px-6 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <CheckCircle2 size={16} />
                              <span className="text-[10px] font-black uppercase">Received</span>
                            </div>
                          )}
                        </div>
                      )}
                      <span className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest ${
                        req.status === "Pending" ? "bg-amber-50 text-amber-600" : 
                        req.status === "Accepted" ? "bg-blue-50 text-blue-600" :
                        req.status === "Rejected" ? "bg-red-50 text-red-600" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    {req.status === "Rejected" && req.rejectionReason && (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mt-2">
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Rejection Reason</p>
                        <p className="text-sm font-bold text-gray-700">{req.rejectionReason}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Donors have been notified.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Nearby Donors Sidebar */}
          <div className="space-y-10">
            <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50 bg-gradient-to-br from-white to-blue-50/30">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Upcoming Camps</h3>
              <div className="space-y-6">
                {camps.map((camp, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white border border-gray-50 hover:border-red-100 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-black"><Calendar size={20} /></div>
                      <div><p className="font-black text-gray-900">{camp.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(camp.date).toLocaleDateString()}</p></div>
                    </div>
                    <p className="text-xs text-gray-500 font-bold flex items-center gap-2 mb-2"><MapPin size={12} /> {camp.location}</p>
                    {camp.createdBy?.name && (
                      <p className="text-[10px] text-blue-600 font-black uppercase mb-3">Host: {camp.createdBy.name}</p>
                    )}
                    <p className="text-[10px] text-gray-400 font-bold">Donors can register via Donor login → Find Camps.</p>
                  </div>
                ))}
                {camps.length === 0 && (
                  <p className="text-gray-400 font-bold text-center py-10">No camps scheduled yet.</p>
                )}
              </div>
            </Card>

            <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50 bg-gradient-to-br from-white to-blue-50/30">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Nearby Centers</h3>
              <div className="space-y-8">
                {realBloodBanks.slice(0, 3).map((bank, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 font-black text-lg shadow-xl shadow-blue-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                        <Home size={24} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 group-hover:text-red-600 transition-colors">{bank.name}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{bank.location?.city || "Local"}</p>
                      </div>
                    </div>
                    <a href={`tel:${bank.phone}`} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                      <Phone size={18} />
                    </a>
                  </div>
                ))}
                {realBloodBanks.length === 0 && (
                  <p className="text-gray-400 font-bold text-center py-4">No centers found.</p>
                )}
              </div>
              <Button 
                onClick={() => navigate("/patient/find")}
                variant="ghost" 
                className="w-full mt-10 h-14 rounded-2xl text-blue-600 font-black uppercase tracking-widest border-2 border-blue-50 hover:bg-blue-50"
              >
                Find More Centers
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20">
      {renderContent()}

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRequestModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-12">
                <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Request Blood</h3>
                <p className="text-gray-400 font-bold mb-10">Fill in the details for your urgent requirement</p>
                
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Patient Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma" 
                      value={requestForm.patientName}
                      onChange={(e) => setRequestModalForm({ ...requestForm, patientName: sanitizePatientName(e.target.value) })}
                      onKeyDown={(e) => {
                        // Block direct number entry (keeps UX aligned with sanitized value).
                        if (e.key.length === 1 && /[0-9]/.test(e.key)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text");
                        setRequestModalForm((prev) => ({
                          ...prev,
                          patientName: sanitizePatientName(text)
                        }));
                      }}
                      inputMode="text"
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Blood Group</label>
                      <select 
                        value={requestForm.bloodGroup}
                        onChange={(e) => setRequestModalForm({...requestForm, bloodGroup: e.target.value})}
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                      >
                        <option>O+</option>
                        <option>A+</option>
                        <option>B+</option>
                        <option>AB+</option>
                        <option>O-</option>
                        <option>A-</option>
                        <option>B-</option>
                        <option>AB-</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Units Required</label>
                      <input 
                        type="number" 
                        placeholder="2" 
                        value={requestForm.units}
                        onChange={(e) => setRequestModalForm({...requestForm, units: e.target.value})}
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">State</label>
                      <select 
                        value={requestForm.state}
                        onChange={handleRequestStateChange}
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none"
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
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">City</label>
                      <select 
                        value={requestForm.city}
                        onChange={handleRequestCityChange}
                        disabled={!requestForm.state}
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {requestForm.state ? "Select City" : "Select State First"}
                        </option>
                        {getCitiesForState(requestForm.state).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Hospital</label>
                      <select 
                        value={requestForm.hospital}
                        onChange={handleRequestHospitalChange}
                        disabled={!requestForm.state || !requestForm.city}
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-red-100 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {(!requestForm.state || !requestForm.city) ? "Select State & City First" : "Select Hospital"}
                        </option>
                        {getHospitalsForCity(requestForm.state, requestForm.city).map((hospital) => (
                          <option key={hospital} value={hospital}>
                            {hospital}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Urgency Level</label>
                    <div className="flex gap-4">
                      {["Normal", "Urgent", "Emergency"].map(level => (
                        <button 
                          key={level} 
                          type="button" 
                          onClick={() => setRequestModalForm({...requestForm, urgency: level})}
                          className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                            requestForm.urgency === level 
                            ? "bg-red-600 text-white shadow-lg shadow-red-200" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-16 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-lg shadow-2xl shadow-red-100 mt-8"
                  >
                    Submit Request
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Lab Test Modal */}
      <AnimatePresence>
        {showLabModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLabModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-12">
                <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Book Home Lab Test</h3>
                <p className="text-gray-400 font-bold mb-10">Schedule a convenient home collection for your medical tests.</p>
                
                <form onSubmit={handleBookLabTest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Select Test Type</label>
                    <select 
                      value={labForm.testType}
                      onChange={(e) => setLabForm({...labForm, testType: e.target.value})}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    >
                      <option>Complete Blood Count (CBC)</option>
                      <option>Liver Function Test (LFT)</option>
                      <option>Kidney Function Test (KFT)</option>
                      <option>Diabetes Screening (HbA1c)</option>
                      <option>Lipid Profile</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Preferred Collection Date</label>
                    <input 
                      type="date" 
                      value={labForm.preferredDate}
                      onChange={(e) => setLabForm({...labForm, preferredDate: e.target.value})}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Collection Address</label>
                    <textarea 
                      placeholder="Enter your full home address for sample collection" 
                      value={labForm.address}
                      onChange={(e) => setLabForm({...labForm, address: e.target.value})}
                      className="w-full h-32 bg-gray-50 border-none rounded-2xl p-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-lg shadow-2xl shadow-blue-100 mt-8"
                  >
                    Confirm Booking
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;
