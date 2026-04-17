import API from "./axios";


//AUTH 


export const registerUser = async (userData) => {
  const { data } = await API.post("/user/register", userData);
  return data;
};

export const registerBloodBank = async (bbData) => {
  const { data } = await API.post("/bloodbank/register", bbData);
  return data;
};

export const loginUser = async (credentials, role) => {
  const url = role === "admin" ? "/admin/login" : "/login";
  const { data } = await API.post(url, credentials);

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

export const logoutUser = async () => {
  try {
    const { data } = await API.post("/logout");
    return data;
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};


//ADMIN 


export const getAdminStats = async () => {
  const { data } = await API.get("/admin/stats");
  return data;
};

export const getPendingBloodBanks = async () => {
  const { data } = await API.get("/admin/pending-blood-banks");
  return data;
};

export const approveBloodBank = async (id) => {
  const { data } = await API.post(`/admin/approve-blood-bank/${id}`);
  return data;
};

export const getPendingDonors = async () => {
  const { data } = await API.get("/admin/pending-donors");
  return data;
};

export const approveDonor = async (id) => {
  const { data } = await API.put(`/admin/approve-donor/${id}`);
  return data;
};

export const removeUser = async (id) => {
  const { data } = await API.delete(`/admin/users/${id}`);
  return data;
};


//USER PROFILE


export const getProfile = async () => {
  const { data } = await API.get("/me");
  return data;
};

export const updateProfile = async (updates) => {
  const { data } = await API.put("/me", updates);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await API.put("/change-password", payload);
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await API.post("/forgot-password", { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await API.patch(`/reset-password/${token}`, { password });
  return data;
};

export const checkDonorEligibility = async () => {
  const { data } = await API.get("/eligibility");
  return data;
};

export const recordDonation = async () => {
  const { data } = await API.post("/record-donation");
  return data;
};

export const getAllBloodBanks = async () => {
  const { data } = await API.get("/blood-banks");
  return data;
};


//BLOOD BANK 


export const updateBloodStock = async (payload) => {
  const { data } = await API.post("/bloodbank/stock", payload);
  return data;
};

export const getBloodRequests = async () => {
  const { data } = await API.get("/bloodbank/requests");
  return data;
};

/** Donors in the same city (or pincode) as the logged-in blood bank; optional bloodGroup filter */
export const getDonorsNearby = async (bloodGroup) => {
  const { data } = await API.get("/bloodbank/donors/nearby", {
    params: bloodGroup ? { bloodGroup } : {},
  });
  return data;
};

//CAMPS


export const createCamp = async (payload) => {
  const { data } = await API.post("/camps/create", payload);
  return data;
};

export const getMyCamps = async () => {
  const { data } = await API.get("/camps/my-camps");
  return data;
};

export const getAllCamps = async () => {
  const { data } = await API.get("/camps/all");
  return data;
};

export const getCampStats = async () => {
  const { data } = await API.get("/camps/total-units");
  return data;
};

export const updateCamp = async (id, payload) => {
  const { data } = await API.put(`/camps/update/${id}`, payload);
  return data;
};

export const deleteCamp = async (id) => {
  const { data } = await API.delete(`/camps/delete/${id}`);
  return data;
};

export const registerForCamp = async (campId) => {
  const { data } = await API.post("/camps/register-donor", { campId });
  return data;
};

export const getCampBankDetail = async (campId) => {
  const { data } = await API.get(`/camps/bank/detail/${campId}`);
  return data;
};

export const markCampDonation = async ({ campId, donorId, units = 1 }) => {
  const { data } = await API.post("/camps/bank/mark-donated", { campId, donorId, units });
  return data;
};

export const confirmCampDonation = async (campId) => {
  const { data } = await API.post("/camps/donor/confirm-donation", { campId });
  return data;
};

export const declineCampDonation = async (campId) => {
  const { data } = await API.post("/camps/donor/decline-donation", { campId });
  return data;
};

export const getMyCampRegistrations = async () => {
  const { data } = await API.get("/camps/my-registrations");
  return data;
};

export const getCampCertificateData = async (campId) => {
  const { data } = await API.get(`/camps/certificate/${campId}`);
  return data;
};

export const completeCampEvent = async (campId) => {
  const { data } = await API.put(`/camps/complete-event/${campId}`);
  return data;
};


//BLOOD REQUESTS


export const createBloodRequest = async (payload) => {
  const { data } = await API.post("/requests/create", payload);
  return data;
};

export const getMyBloodRequests = async () => {
  const { data } = await API.get("/requests/my-requests");
  return data;
};

export const getAllBloodRequests = async () => {
  const { data } = await API.get("/requests/all");
  return data;
};

export const getUrgentBloodRequests = async () => {
  const { data } = await API.get("/requests/urgent");
  return data;
};

export const acceptBloodRequest = async (requestId) => {
  const { data } = await API.post("/requests/accept", { requestId });
  return data;
};


export const rejectBloodRequest = async (requestId, reason) => {
  const { data } = await API.post("/requests/reject", { requestId, reason });
  return data;
};

export const issueBlood = async (payload) => {
  const { data } = await API.post("/requests/issue", payload);
  return data;
};

export const verifyRequestCompletion = async (requestId, role) => {
  const { data } = await API.post("/requests/verify-completion", { requestId, role });
  return data;
};

export const updateBloodRequest = async (id, payload) => {
  const { data } = await API.put(`/requests/${id}`, payload);
  return data;
};

export const deleteBloodRequest = async (id, cancelReason) => {
  const { data } = await API.delete(`/requests/${id}`, { data: { cancelReason } });
  return data;
};

export const completeBloodDonation = async (requestId) => {
  const { data } = await API.post("/requests/complete", { requestId });
  return data;
};


//BLOOD TEST BOOKING


export const getTestTypes = async () => {
  const { data } = await API.get("/tests/types");
  return data;
};

export const bookBloodTest = async (payload) => {
  const { data } = await API.post("/tests/book", payload);
  return data;
};

export const getMyBookings = async ({ status, page = 1, limit = 10 } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;

  const { data } = await API.get("/tests/my-bookings", { params });
  return data;
};

export const getBookingById = async (bookingId) => {
  const { data } = await API.get(`/tests/${bookingId}`);
  return data;
};

export const cancelBooking = async (bookingId) => {
  const { data } = await API.put(`/tests/${bookingId}/cancel`);
  return data;
};

export const getAllTestBookings = async (status) => {
  const { data } = await API.get("/tests/all", { params: { status } });
  return data;
};

export const acceptTestBooking = async (payload) => {
  const { data } = await API.post("/tests/accept", payload);
  return data;
};

export const rejectTestBooking = async (payload) => {
  const { data } = await API.post("/tests/reject", payload);
  return data;
};

export const uploadTestReport = async (payload) => {
  const { data } = await API.post("/tests/upload-report", payload);
  return data;
};


//NOTIFICATIONS


export const getNotifications = async ({ unreadOnly = false, page = 1, limit = 20 } = {}) => {
  const { data } = await API.get("/notifications", {
    params: { unreadOnly, page, limit },
  });
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await API.put(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await API.put("/notifications/mark-all-read");
  return data;
};

export const deleteNotification = async (notificationId) => {
  const { data } = await API.delete(`/notifications/${notificationId}`);
  return data;
};

export const updateFcmToken = async (fcmToken) => {
  const { data } = await API.put("/notifications/fcm-token", { fcmToken });
  return data;
};

// analyzer
export const analyzeReport = (formData) =>
  API.post("/report/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


// STATS


export const getPatientStats = async () => {
  const { data } = await API.get("/patient/stats");
  return data;
};

export const getDonorStats = async () => {
  const { data } = await API.get("/donor/stats");
  return data;
};

export const getBloodBankStats = async () => {
  const { data } = await API.get("/bloodbank/stats");
  return data;
};


//GAMIFICATION 


export const getLeaderboard = async () => {
  const { data } = await API.get("/gamification/leaderboard");
  return data;
};

export const getRewards = async () => {
  const { data } = await API.get("/gamification/rewards");
  return data;
};

export const claimReward = async (rewardId) => {
  const { data } = await API.post("/gamification/claim-reward", { rewardId });
  return data;
};

export const getMyRewards = async () => {
  const { data } = await API.get("/gamification/my-rewards");
  return data;
};

export const rateDonor = async (payload) => {
  const { data } = await API.post("/gamification/rate", payload);
  return data;
};

