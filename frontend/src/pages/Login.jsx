"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosConfig";
import { User, Lock, Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await axiosInstance.post("/auth/login", {
          username: form.username,
          password: form.password,
        });

        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("role", res.role);
        localStorage.setItem("user", JSON.stringify(res.user));
        if (res.refreshToken) {
          localStorage.setItem("refreshToken", res.refreshToken);
        }

        if (res.role === "ADMIN") navigate("/admin");
        else if (res.role === "USER") navigate("/user");
        else setError("Không xác định vai trò người dùng");
      } else {
        await axiosInstance.post("/auth/register", {
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        });
        setShowSuccess(true);
        setForm({
          username: "",
          password: "",
          confirmPassword: "",
          email: "",
          fullName: "",
        });
      }
    } catch (err) {
      console.error("Auth error", err);
      toast.error(err.response.data);
      setError(
        isLogin
          ? "Tên đăng nhập hoặc mật khẩu không đúng"
          : "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Popup thành công */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Đăng ký thành công!</DialogTitle>
            <DialogDescription>
              Tài khoản của bạn đã được tạo. Hãy đăng nhập để bắt đầu hành trình
              mới.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setShowSuccess(false);
                setIsLogin(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Giao diện chính */}
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              {isLogin ? "Đăng nhập" : "Tạo tài khoản mới"}
            </h2>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {!isLogin && (
                <>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Họ và tên"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : isLogin ? (
                  "Đăng nhập"
                ) : (
                  "Đăng ký tài khoản"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-indigo-600 hover:underline font-medium"
              >
                {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </div>
          </div>

          <div className="bg-indigo-100 text-center py-3 text-sm text-gray-600 font-medium">
            {isLogin
              ? "Chào mừng trở lại 👋"
              : "Tạo tài khoản để bắt đầu hành trình mới 🚀"}
          </div>
        </div>
      </div>
    </>
  );
}
