import { api } from "../api";
import axios from "axios";

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const res = await axios.post("/register", data); // Adjust base URL in axios config if needed
  return res.data;
};


export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
