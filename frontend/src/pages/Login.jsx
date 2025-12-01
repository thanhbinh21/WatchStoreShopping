"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosConfig";
import { User, Lock, Mail, Loader2, Gift, ShieldCheck } from "lucide-react"; // Thêm icon Gift
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { ZaloIcon } from "@/components/ui/ZaloIcon";
import { getGuestCart, clearGuestCart } from "@/api/guestCart";
import { addToCart } from "@/api/cartAPI";


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
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  const syncGuestCart = async (userId) => {
    const guestItems = getGuestCart();
    if (!guestItems || guestItems.length === 0) return;

    for (const item of guestItems) {
      try {
        const maxStock = Number.isFinite(item?.stock) ? item.stock : Infinity;
        if (maxStock <= 0) {
          toast.error(`Sản phẩm ${item.productName || item.id} đã hết hàng`);
          continue;
        }
        const qty = Math.min(item.quantity, maxStock);
        if (qty < item.quantity) {
          toast.warning(`Số lượng sản phẩm ${item.productName || item.id} đã được điều chỉnh theo tồn kho`);
        }
        await addToCart(userId, item.id, qty);
      } catch (err) {
        console.error("Sync cart error:", err);
      }
    }

    clearGuestCart();
  };


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

        const { data } = res;

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", data.role);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          localStorage.removeItem("user");
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        await syncGuestCart(data.user.id);

        // Chuyển đến /home cho cả admin và user
        navigate("/home");
        toast.success("Đăng nhập thành công!");
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
      const errorMsg =
        err.response?.data ||
        (isLogin
          ? "Tên đăng nhập hoặc mật khẩu không đúng"
          : "Đăng ký thất bại. Vui lòng thử lại.");
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: ShieldCheck,
      text: "Chiết khấu đến 5% khi mua các sản phẩm tại CellphoneS",
    },
    { icon: Gift, text: "Miễn phí giao hàng cho thành viên SMEM, SVIP" },
    { icon: Gift, text: "Tặng voucher sinh nhật đến 500.000đ" },
    { icon: Gift, text: "Trợ giá thu cũ lên đến 1 triệu" },
    { icon: Gift, text: "Thăng hạng nhận voucher đến 300.000đ" },
    {
      icon: Gift,
      text: "Đặc quyền S-Student/S-Teacher ưu đãi thêm đến 10%",
    },
  ];

  return (
    <div className="min-h-screen w-full relative">
      {/* Lavender Blush Flow Gradient (Top Left to Bottom Right) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, #E1BEE7 0%, #F3E5F5 20%, #FCE4EC 40%, #FFF0F5 60%, #F8BBD9 80%, #E1BEE7 100%)`,
        }}
      />
      {/* Your Content/Components */}
      <>
        {/* Popup thành công */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>🎉 Đăng ký thành công!</DialogTitle>
              <DialogDescription>
                Tài khoản của bạn đã được tạo. Hãy đăng nhập để bắt đầu hành
                trình mới.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setIsLogin(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Đăng nhập ngay
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Giao diện chính mới */}
        <div className="flex items-center justify-center min-h-screen min-w-screen p-4 absolute z-10">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
            {/* Cột trái: Quảng cáo */}
            <div className="w-full md:w-1/2 p-8 md:p-12 relative bg-white">
              {/* Box đỏ viền */}
              <div className="border-2 border-red-600 rounded-lg p-6 h-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Nhập hội khách hàng thành viên{" "}
                  <span className="text-red-600">SMEMBER</span>
                </h2>
                <p className="text-gray-600 mb-6">
                  Để không bỏ lỡ các ưu đãi hấp dẫn từ CellphoneS
                </p>

                <ul className="space-y-4">
                  {benefits.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <item.icon className="h-5 w-5 text-red-600 mr-3 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className="text-red-600 hover:underline font-medium mt-6 inline-block"
                >
                  Xem chi tiết chính sách ưu đãi Smember
                </a>

                {/* <img src="/path/to/mascot.png" alt="Mascot" className="absolute bottom-0 right-0 w-1/2" /> */}
              </div>
            </div>

            {/* Cột phải: Form */}
            <div className="w-full md:w-1/2 p-8 md:p-12">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                {isLogin ? "Đăng nhập SMEMBER" : "Đăng ký thành viên"}
              </h2>

              {error && (
                <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Trường chung: Tên đăng nhập */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {isLogin ? "Tên đăng nhập hoặc email" : "Tên đăng nhập"}
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder={
                      isLogin
                        ? "Nhập tên đăng nhập hoặc email"
                        : "Nhập tên đăng nhập"
                    }
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {/* Trường chỉ có khi Đăng ký */}
                {!isLogin && (
                  <>
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        placeholder="Nhập họ và tên"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Nhập email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </>
                )}

                {/* Trường chung: Mật khẩu */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Nhập mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {/* Trường chỉ có khi Đăng ký */}
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                )}

                {/* Link Quên mật khẩu (chỉ hiển thị khi đăng nhập) */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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

              {/* Dialog: Forgot password */}
              {forgotOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-2">
                      Đặt lại mật khẩu
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
                    </p>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Email của bạn"
                      className="w-full mb-4 px-3 py-2 border rounded"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setForgotOpen(false)}
                      >
                        Huỷ
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!forgotEmail) {
                            toast.error("Vui lòng nhập email");
                            return;
                          }
                          setForgotLoading(true);
                          try {
                            await axiosInstance.post("/auth/forgot-password", {
                              email: forgotEmail,
                            });
                            toast.success(
                              "Đã gửi link xác nhận thay đổi mật khẩu về mail"
                            );
                            setForgotOpen(false);
                            setForgotEmail("");
                          } catch (err) {
                            console.error("Forgot password error", err);
                            toast.error("Có lỗi xảy ra, vui lòng thử lại");
                          } finally {
                            setForgotLoading(false);
                          }
                        }}
                        disabled={forgotLoading}
                        className="bg-[#e7000b]"
                      >
                        {forgotLoading ? "Đang gửi..." : "Gửi link"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Phần đăng nhập bằng MXH (chỉ hiển thị khi đăng nhập) */}
              {isLogin && (
                <>
                  <div className="flex items-center my-6">
                    <hr className="grow border-gray-300" />
                    <span className="mx-4 text-sm text-gray-500">
                      Hoặc đăng nhập bằng
                    </span>
                    <hr className="grow border-gray-300" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center w-30"
                      onClick={() => toast.info("Sắp ra mắt")}
                    >
                      <GoogleIcon />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center w-30"
                      onClick={() => toast.info("Sắp ra mắt")}
                    >
                      <ZaloIcon />
                      Zalo
                    </Button>
                  </div>
                </>
              )}

              {/* Link chuyển đổi Đăng nhập/Đăng ký */}
              <div className="mt-6 text-center text-sm text-gray-600">
                {isLogin ? "Bạn chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="text-red-600 hover:underline font-medium"
                >
                  {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
