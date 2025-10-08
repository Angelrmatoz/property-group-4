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
    // Normalize to have a consistent error shape
    const error = err;
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
