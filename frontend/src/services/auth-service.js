// src/services/auth-service.js
import api from "./api";

export async function loginUser(username, password) {
  const response = await api.post("token/", {
    username,
    password,
  });

  return response.data;
}

export async function registerUser({ username, email, password, password_confirm }) {
  const response = await api.post("register/", {
    username,
    email,
    password,
    password_confirm,
  });

  return response.data;
}
