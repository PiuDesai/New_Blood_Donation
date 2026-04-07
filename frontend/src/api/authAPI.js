import API from "./axios";

export const loginUser = async (credentials) => {
  try {
    // Backend route: POST /api/login (mounted at /api in server.js)
    const response = await API.post("/login", credentials);
    const data = response.data;

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || "Login successful",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Login failed",
    };
  }
};

// ✅ ADMIN LOGIN (ADDED)
export const loginAdmin = async (credentials) => {
  // ✅ ADMIN LOGIN (FIXED)
  try {
    const response = await API.post("/admin/login", credentials);
    const data = response.data;
    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || "Login successful",
    };
  } catch (error) {
    console.warn("Admin API error:", error.message);

    // ❌ DO NOT allow fallback success for admin
    return {
      success: false, // ✅ IMPORTANT
      message:
        error.response?.data?.message ||
        "Invalid email or password",
    };
  }
};

export const registerUser = async (userData) => {
  try {
    // Backend route: POST /api/user/register
    const response = await API.post("/user/register", userData);
    return { success: true, ...response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Registration failed",
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
      donationCount: 0,
      nextEligibleAt: null,
      history: [],
    };
  }
};

// ───────────────── PROFILE & SETTINGS ─────────────────

export const getProfile = async () => {
  try {
    const response = await API.get("/me");
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch profile"
    };
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await API.put("/me", userData);
    return {
      success: true,
      user: response.data.user,
      message: response.data.message || "Profile updated successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile"
    };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await API.put("/change-password", passwordData);
    return {
      success: true,
      message: response.data.message || "Password changed successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change password"
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

export const getPendingDonors = async () => {
  const res = await API.get("/admin/pending-donors");
  return res.data;
};

// ✅ APPROVE DONOR
export const approveDonor = async (id) => {
  const res = await API.put(`/admin/approve-donor/${id}`);
  return res.data;
};


// ✅ GET BLOOD BANK REQUESTS
export const getPendingBloodBanks = async () => {
  const res = await API.get("/admin/pending-bloodbanks");
  return res.data;
};

// ✅ APPROVE BLOOD BANK
export const approveBloodBank = async (id) => {
  const res = await API.put(`/admin/approve-bloodbank/${id}`);
  return res.data;
};

// ── Admin: lists + user management ───────────────────────────────
export const getAllDonors = async () => {
  const res = await API.get("/admin/donors");
  return res.data;
};

export const getAllBloodBanks = async () => {
  const res = await API.get("/admin/bloodbanks");
  return res.data;
};

export const getUserDetails = async (id) => {
  const res = await API.get(`/admin/users/${id}`);
  return res.data;
};

export const removeUser = async (id) => {
  const res = await API.delete(`/admin/users/${id}`);
  return res.data;
};