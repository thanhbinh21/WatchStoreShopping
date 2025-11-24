import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-secondary text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-brand-secondary-foreground mb-4">
              WATCH STORE
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Chuyên cung cấp các sản phẩm đồng hồ cao cấp, từ các thương hiệu
              nổi tiếng trên thế giới.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-secondary-soft rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-secondary-soft rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-secondary-soft rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-brand-secondary-foreground mb-4">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Trang chủ
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Sản phẩm
                </a>
              </li>
              <li>
                <a
                  href="/collections"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Bộ sưu tập
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-brand-secondary-foreground mb-4">
              Danh mục
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/categories/mechanical"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Đồng hồ Cơ khí
                </a>
              </li>
              <li>
                <a
                  href="/categories/quartz"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Đồng hồ Pin
                </a>
              </li>
              <li>
                <a
                  href="/categories/smartwatch"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Đồng hồ Thông minh
                </a>
              </li>
              <li>
                <a
                  href="/categories/diving"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Đồng hồ Lặn
                </a>
              </li>
              <li>
                <a
                  href="/categories/fashion"
                  className="hover:text-brand-secondary-foreground transition-colors text-sm"
                >
                  Đồng hồ Thời trang
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-brand-secondary-foreground mb-4">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  123 Đường Lê Lợi, Quận 1<br />
                  Thành phố Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="flex-shrink-0" />
                <a
                  href="tel:+84901234567"
                  className="text-sm hover:text-brand-secondary-foreground transition-colors"
                >
                  +84 90 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="flex-shrink-0" />
                <a
                  href="mailto:info@watchstore.com"
                  className="text-sm hover:text-brand-secondary-foreground transition-colors"
                >
                  info@watchstore.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">Thứ 2 - Chủ nhật: 9:00 - 22:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-sebg-brand-secondary-soft mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} WATCH STORE. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="/privacy"
                className="hover:text-brand-secondary-foreground transition-colors"
              >
                Chính sách bảo mật
              </a>
              <a
                href="/terms"
                className="hover:text-brand-secondary-foreground transition-colors"
              >
                Điều khoản sử dụng
              </a>
              <a
                href="/returns"
                className="hover:text-brand-secondary-foreground transition-colors"
              >
                Chính sách đổi trả
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
