import axios from "axios";

const API = "https://project-s-i-a-t-ai.onrender.com";

const api = axios.create({
  baseURL: API,
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ If token expired → redirect to landing page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/"; // landing page
    }
    return Promise.reject(err);
  }
);

export default api;
