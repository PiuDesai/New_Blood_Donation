import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default API;

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.userMessage || error?.message || "Something went wrong";
