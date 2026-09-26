import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // console.log("AUTH HEADER:", config.headers.Authorization);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
