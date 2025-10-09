import axios from "axios";

// Use relative baseURL so services call the frontend proxy (e.g. /api/..)
const api = axios.create({
  baseURL: undefined,
  timeout: 15000,
  // withCredentials: true, // enable only if calling backend directly and CORS allows credentials
});

// Basic response interceptor to normalize errors if needed
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Build a richer, consistent error object so callers can inspect status/data
    const errorInfo = {
      message: err?.message ?? "",
      name: err?.name ?? "",
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      config: err?.config,
    };
    return Promise.reject(errorInfo);
  }
);

export default api;
