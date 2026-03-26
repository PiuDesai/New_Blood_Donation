import axios from "axios";

export const analyzeReport = (formData) => {
  return axios.post("http://localhost:5000/api/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};