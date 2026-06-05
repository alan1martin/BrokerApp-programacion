// src/components/auth/protected-route.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // CORREGIDO: Buscamos "access" para unificar con el LoginPage y api.js
  const token = localStorage.getItem("access");

  // Si no hay token, lo rebotamos al Login inmediatamente
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, lo dejamos seguir a la ruta que quería ver
  return children;
}

export default ProtectedRoute;