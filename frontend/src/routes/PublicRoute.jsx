import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token"); // kiểm tra token
  if (token) {
    return <Navigate to="/dashboard" />; // nếu đã login => redirect dashboard
  }
  return children; // chưa login => cho vào route
}
