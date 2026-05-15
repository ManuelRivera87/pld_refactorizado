import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000"
});

const storedToken = localStorage.getItem("pld.auth.token");

if (storedToken) {
  http.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete http.defaults.headers.common.Authorization;
};
