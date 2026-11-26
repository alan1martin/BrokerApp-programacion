// src/services/auth-service.js
import api from "./api";

export async function loginUser(username, password) {
  const response = await api.post("token/", {
    username,
    password,
  });

  return response.data;
}

export async function registerUser({ full_name, email, dni, password, password_confirm, username }) {
  const response = await api.post("register/", {
    full_name,
    email,
    dni,
    password,
    password_confirm,
    username,
  });

  return response.data;
}

export async function getCurrentUserProfile() {
  const response = await api.get("user/me/");
  return response.data;
}

export async function logoutUser() {
  try {
    await api.post("logout/");
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
}
