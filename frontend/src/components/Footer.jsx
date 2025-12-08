// Footer.jsx
import React, { useState, useEffect } from "react";
import { getGeneralSettings } from "@/api/settingsAPI";
import {
  Youtube,
  Facebook,
  Instagram,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const [settings, setSettings] = useState({
    siteName: "WATCH STORE",
    logo: "",
    email: "",
    hotline: "",
    address: "",
    copyright: "",
    slogan: "",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    zaloUrl: "",
    paymentMethods: "[]",
    socialMedia: "[]",
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getGeneralSettings();
        setSettings(data);

        try {
          const methods = JSON.parse(data.paymentMethods || "[]");
          setPaymentMethods(methods);
        } catch (e) {
          console.error("Failed to parse payment methods:", e);
          setPaymentMethods([]);
        }

        try {
          const social = JSON.parse(data.socialMedia || "[]");
          setSocialMedia(social);
        } catch (e) {
          console.error("Failed to parse social media:", e);
          setSocialMedia([]);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!subscribeEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Đăng ký nhận tin thành công!");
      setSubscribeEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="bg-gray-100 text-gray-800 mt-16 w-full">
      <div className="w-full max-w-[1280px] mx-auto px-4 py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 border-b border-gray-300 mb-8">
          {/* Logo & Company */}
          <div>
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-14 w-auto mb-4 object-contain"
              />
            ) : (
              <h3 className="text-2xl font-bold mb-4">{settings.siteName}</h3>
            )}
            {settings.slogan && (
              <p className="text-sm italic text-gray-600">{settings.slogan}</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            {settings.address && (
              <p className="text-sm mb-3 flex items-start gap-2">
                <span>📍</span>
                <span>{settings.address}</span>
              </p>
            )}
            {settings.hotline && (
              <p className="text-sm mb-3 flex items-center gap-2">
                <span>📞</span>
                <strong>{settings.hotline}</strong>
              </p>
            )}
            {settings.email && (
              <p className="text-sm flex items-center gap-2">
                <span>✉️</span>
                <span>{settings.email}</span>
              </p>
            )}
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-3">Đăng ký nhận tin</h3>
            <p className="text-sm text-gray-600 mb-3">
              Nhận thông tin khuyến mãi và sản phẩm mới
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-soft transition disabled:bg-gray-400"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Policy */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase">Chính sách</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-blue-600 cursor-pointer transition">
                Hướng dẫn mua hàng
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Phương thức thanh toán
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Chính sách giao hàng
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Chính sách đổi trả
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase">
              Về chúng tôi
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-blue-600 cursor-pointer transition">
                Giới thiệu công ty
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Tin tức & Sự kiện
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Hệ thống cửa hàng
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Liên hệ hợp tác
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase">Hỗ trợ</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-blue-600 cursor-pointer transition">
                Chính sách bảo hành
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Kiểm tra bảo hành
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Chính sách bảo mật
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Điều khoản sử dụng
              </li>
            </ul>
          </div>

          {/* Connect & Payment */}
          <div>
            {socialMedia.length > 0 && (
              <>
                <h3 className="font-semibold mb-4 text-sm uppercase">
                  Kết nối
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      className="hover:opacity-80 transition"
                    >
                      <img
                        src={social.imageUrl}
                        alt={social.name}
                        className="h-10 w-10 object-contain rounded-lg"
                      />
                    </a>
                  ))}
                </div>
              </>
            )}

            {paymentMethods.length > 0 && (
              <>
                <h3 className="font-semibold mb-3 text-sm uppercase">
                  Thanh toán
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method, index) => (
                    <img
                      key={index}
                      src={method.imageUrl}
                      alt={method.name}
                      title={method.name}
                      className="h-7 object-contain bg-white p-1 rounded border"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-200 text-gray-600 text-sm text-center py-4 w-full mt-8">
        {settings.copyright ||
          `© ${new Date().getFullYear()} ${
            settings.siteName
          }. All rights reserved.`}
      </div>
    </footer>
  );
}
