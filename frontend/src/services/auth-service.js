// src/services/auth-service.js
import api from "./api";

export async function loginUser(username, password) {
  // Como 'api' ahora tiene la baseURL con "/api", solo le concatenamos "/token/"
  const response = await api.post("/token/", {
    username,
    password,
  });

  return response.data;
}