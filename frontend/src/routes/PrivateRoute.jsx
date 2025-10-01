import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken"); // đổi tên key đúng với Login
  if (!token) {
    return <Navigate to="/login" />; // chưa login => redirect login
  }
  return children; // đã login => vào route
}
