/**
 * api.js – Central API layer for Smart Blood Donation
 * All user-module, blood-test booking, and push-notification calls live here.
 */

import API from "./axios";

// ═══════════════════════════════════════════════
// ─── AUTH ────────────────────────────────────
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// ─── USER PROFILE ────────────────────────────
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// ─── BLOOD BANK ──────────────────────────────
// ═══════════════════════════════════════════════

export const updateBloodStock = async (payload) => {
  const { data } = await API.post("/bloodbank/stock", payload);
  return data;
};

export const getBloodRequests = async () => {
  const { data } = await API.get("/bloodbank/requests");
  return data;
};

// ═══════════════════════════════════════════════
// ─── CAMPS ────────────────────────────────────
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// ─── BLOOD REQUESTS ──────────────────────────
// ═══════════════════════════════════════════════

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

export const issueBlood = async (payload) => {
  const { data } = await API.post("/requests/issue", payload);
  return data;
};

// ═══════════════════════════════════════════════
// ─── STATS (per role) ────────────────────────
// ═══════════════════════════════════════════════

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

export const getBloodBankStats = async () => {
  const { data } = await API.get("/bloodbank/stats");
  return data;
};

export const getDonorStats = async () => {
  const { data } = await API.get("/donor/stats");
  return data;
};

export const getPatientStats = async () => {
  const { data } = await API.get("/patient/stats");
  return data;
};

// ═══════════════════════════════════════════════
// ─── BLOOD TEST BOOKING ──────────────────────
// ═══════════════════════════════════════════════

export const getTestTypes = async () => {
  const { data } = await API.get("/bookings/tests/types");
  return data;
};

export const bookBloodTest = async (payload) => {
  const { data } = await API.post("/bookings/tests/book", payload);
  return data;
};

export const getMyBookings = async ({ status, page = 1, limit = 10 } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  const { data } = await API.get("/bookings/tests/my-bookings", { params });
  return data;
};

export const getBookingById = async (bookingId) => {
  const { data } = await API.get(`/bookings/tests/${bookingId}`);
  return data;
};

export const cancelBooking = async (bookingId) => {
  const { data } = await API.put(`/bookings/tests/${bookingId}/cancel`);
  return data;
};

// ═══════════════════════════════════════════════
// ─── NOTIFICATIONS ───────────────────────────
// ═══════════════════════════════════════════════

export const getNotifications = async ({ unreadOnly = false, page = 1, limit = 20 } = {}) => {
  const { data } = await API.get("/notifications", { params: { unreadOnly, page, limit } });
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

export const sendEmergencyNotification = async (payload) => {
  const { data } = await API.post("/notifications/emergency", payload);
  return data;
};

export const updateFcmToken = async (fcmToken) => {
  const { data } = await API.put("/notifications/fcm-token", { fcmToken });
  return data;
};

export const updateNotificationPreferences = async (prefs) => {
  const { data } = await API.put("/notifications/preferences", prefs);
  return data;
};
