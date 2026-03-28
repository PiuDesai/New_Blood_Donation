import API from "./axios";

// Fallback user data
const getFallbackUser = (role) => ({
  _id: "demo_id_123",
  name: "Demo User",
  email: "demo@example.com",
  role: role.toLowerCase(),
  bloodGroup: "O+",
  phone: "1234567890",
  location: { city: "Demo City", state: "DS" },
});

export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    console.warn("API Login failed, using fallback:", error.message);
    // If backend fails, we return a successful fallback response
    return {
      success: true,
      token: "demo_token_xyz_123",
      user: getFallbackUser(credentials.role || "patient"),
      message: "Connected in Demo Mode (Backend Offline)",
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await API.post("/users/register", userData);
    return response.data;
  } catch (error) {
    console.warn("API Registration failed, using fallback:", error.message);
    return {
      success: true,
      token: "demo_token_xyz_123",
      user: { ...userData, _id: "demo_id_123" },
      message: "Account created in Demo Mode (Backend Offline)",
    };
  }
};

export const getStats = async () => {
  try {
    const response = await API.get("/admin/stats");
    return response.data;
  } catch (error) {
    return {
      totalDonors: 0,
      totalPatients: 0,
      bloodRequests: 0,
      availableUnits: 0,
      recentRequests: [],
    };
  }
};

export const getBloodBankStats = async () => {
  try {
    const response = await API.get("/bloodbank/stats");
    return response.data;
  } catch (error) {
    return {
      totalUnits: 0,
      todayDonations: 0,
      activeRequests: 0,
      lowStockAlerts: 0,
      inventory: [],
    };
  }
};

export const getDonorStats = async () => {
  try {
    const response = await API.get("/donor/stats");
    return response.data;
  } catch (error) {
    return {
      totalDonations: 0,
      livesSaved: 0,
      nextEligible: "N/A",
      history: [],
    };
  }
};

export const getPatientStats = async () => {
  try {
    const response = await API.get("/patient/stats");
    return response.data;
  } catch (error) {
    return {
      activeRequests: 0,
      donorsFound: 0,
      nearbyCenters: 0,
      requests: [],
    };
  }
};
