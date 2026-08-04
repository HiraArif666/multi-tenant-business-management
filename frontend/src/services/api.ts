import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: "http://192.168.1.172:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("FULL ERROR:", error);
    console.log("MESSAGE:", error.message);
    console.log("CODE:", error.code);
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);

    return Promise.reject(error);
  }
);
export default api;