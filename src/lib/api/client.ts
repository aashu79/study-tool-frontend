import axios from "axios";
import toast from "react-hot-toast";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || "An error occurred";
    const headers = error.config?.headers as
      | Record<string, unknown>
      | undefined;
    const skipErrorToast =
      headers?.["X-Skip-Error-Toast"] === "true" ||
      headers?.["X-Skip-Error-Toast"] === true ||
      headers?.["x-skip-error-toast"] === "true" ||
      headers?.["x-skip-error-toast"] === true;

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    if (!skipErrorToast) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
