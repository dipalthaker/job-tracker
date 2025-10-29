import axios from "axios";

export const api = axios.create({
    baseURL: "http://127.0.0.1:8000",  // or "http://localhost:8000"
  });
  
  (window as any).api = api;
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      // soft redirect
      if (location.pathname !== "/login") location.href = "/login";
    }
    return Promise.reject(err);
  }
);
