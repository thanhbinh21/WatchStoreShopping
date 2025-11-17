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

// Icon cho Google và Zalo (dùng tạm SVG inline)
// const GoogleIcon = () => (
//   <svg
//     width="800px"
//     height="800px"
//     viewBox="-3 0 262 262"
//     xmlns="http://www.w3.org/2000/svg"
//     preserveAspectRatio="xMidYMid"
//   >
//     <path
//       d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
//       fill="#4285F4"
//     />
//     <path
//       d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
//       fill="#34A853"
//     />
//     <path
//       d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
//       fill="#FBBC05"
//     />
//     <path
//       d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
//       fill="#EB4335"
//     />
//   </svg>
// );

// const ZaloIcon = () => (
//   <svg
//     width="50"
//     height="50"
//     viewBox="0 0 50 50"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path
//       fill-rule="evenodd"
//       clip-rule="evenodd"
//       d="M22.782 0.166016H27.199C33.2653 0.166016 36.8103 1.05701 39.9572 2.74421C43.1041 4.4314 45.5875 6.89585 47.2557 10.0428C48.9429 13.1897 49.8339 16.7347 49.8339 22.801V27.1991C49.8339 33.2654 48.9429 36.8104 47.2557 39.9573C45.5685 43.1042 43.1041 45.5877 39.9572 47.2559C36.8103 48.9431 33.2653 49.8341 27.199 49.8341H22.8009C16.7346 49.8341 13.1896 48.9431 10.0427 47.2559C6.89583 45.5687 4.41243 43.1042 2.7442 39.9573C1.057 36.8104 0.166016 33.2654 0.166016 27.1991V22.801C0.166016 16.7347 1.057 13.1897 2.7442 10.0428C4.43139 6.89585 6.89583 4.41245 10.0427 2.74421C13.1707 1.05701 16.7346 0.166016 22.782 0.166016Z"
//       fill="#0068FF"
//     />
//     <path
//       opacity="0.12"
//       fill-rule="evenodd"
//       clip-rule="evenodd"
//       d="M49.8336 26.4736V27.1994C49.8336 33.2657 48.9427 36.8107 47.2555 39.9576C45.5683 43.1045 43.1038 45.5879 39.9569 47.2562C36.81 48.9434 33.265 49.8344 27.1987 49.8344H22.8007C17.8369 49.8344 14.5612 49.2378 11.8104 48.0966L7.27539 43.4267L49.8336 26.4736Z"
//       fill="#001A33"
//     />
//     <path
//       fill-rule="evenodd"
//       clip-rule="evenodd"
//       d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892Z"
//       fill="white"
//     />
//     <path
//       d="M20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17Z"
//       fill="#0068FF"
//     />
//     <path
//       d="M32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947Z"
//       fill="#0068FF"
//     />
//     <path
//       d="M25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184Z"
//       fill="#0068FF"
//     />
//     <path
//       d="M40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181Z"
//       fill="#0068FF"
//     />
//     <path
//       d="M29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z"
//       fill="#0068FF"
//     />
//   </svg>
// );

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
    <>
      {/* Popup thành công (giữ nguyên) */}
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Giao diện chính mới */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
                    <item.icon className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
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

              {/* Bạn có thể thêm ảnh mascot ở đây nếu muốn */}
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
                  {isLogin ? "Số điện thoại" : "Tên đăng nhập"}
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder={
                    isLogin ? "Nhập số điện thoại" : "Nhập tên đăng nhập"
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
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Quên mật khẩu?
                  </a>
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

            {/* Phần đăng nhập bằng MXH (chỉ hiển thị khi đăng nhập) */}
            {isLogin && (
              <>
                <div className="flex items-center my-6">
                  <hr className="flex-grow border-gray-300" />
                  <span className="mx-4 text-sm text-gray-500">
                    Hoặc đăng nhập bằng
                  </span>
                  <hr className="flex-grow border-gray-300" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center w-30"
                  >
                    <GoogleIcon />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center w-30"
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
  );
}
