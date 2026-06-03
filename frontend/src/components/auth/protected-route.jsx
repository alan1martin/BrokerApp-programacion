// src/components/auth/protected-route.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Buscamos si existe el token de acceso que nos va a dar Django
  const token = localStorage.getItem("access_token");

  // Si no hay token, lo rebotamos al Login inmediatamente
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, lo dejamos seguir a la ruta que quería ver
  return children;
}

export default ProtectedRoute;
