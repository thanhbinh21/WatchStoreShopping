import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("accessToken"); // kiểm tra token
  const role = localStorage.getItem("role");

  if (token) {
    if (role === "ADMIN") return <Navigate to="/admin" />; // nếu đã login => redirect dashboard
    if (role === "USER") return <Navigate to="/user" />;
  }

  return children; // chưa login => cho vào route
}
