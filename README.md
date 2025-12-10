# 🕐 Watch Store - E-Commerce Platform

> Hệ thống thương mại điện tử bán đồng hồ chính hãng với quản trị toàn diện

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.13-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Đóng góp](#-đóng-góp)
- [Tác giả](#-tác-giả)

## 🎯 Giới thiệu

**Watch Store** là một nền tảng thương mại điện tử hiện đại chuyên bán đồng hồ cao cấp chính hãng (Rolex, Omega, Casio, G-Shock, v.v.). Dự án được xây dựng với mục tiêu cung cấp trải nghiệm mua sắm tuyệt vời cho khách hàng và công cụ quản lý mạnh mẽ cho quản trị viên.

### 🎓 Dự án môn học
- **Môn học**: Lập trình WWW với Java
- **Nhóm**: 08
- **Học kỳ**: 7
- **Năm học**: 2024-2025

## ✨ Tính năng chính

### 👥 Dành cho Khách hàng
- 🛍️ **Mua sắm trực tuyến**: Duyệt và tìm kiếm sản phẩm với bộ lọc nâng cao
- 🛒 **Giỏ hàng thông minh**: Hỗ trợ cả user đã đăng nhập và khách
- 💳 **Thanh toán linh hoạt**: COD và VNPay gateway
- ⭐ **Đánh giá sản phẩm**: Review và rating từ người dùng thực
- 💬 **Chat real-time**: Hỗ trợ trực tiếp với admin
- 🤖 **AI Chatbot**: Trợ lý ảo hỗ trợ 24/7
- ❤️ **Wishlist**: Lưu sản phẩm yêu thích
- 📦 **Theo dõi đơn hàng**: Cập nhật trạng thái real-time
- 🎁 **Khuyến mãi**: Tự động áp dụng giảm giá
- 📱 **Responsive**: Tối ưu cho mọi thiết bị

### 👨‍💼 Dành cho Quản trị viên
- 📊 **Dashboard tổng quan**: Biểu đồ doanh thu, đơn hàng, khách hàng
- 📈 **Báo cáo chi tiết**: Theo ngày, tháng, năm
- 📦 **Quản lý sản phẩm**: CRUD với upload hình ảnh
- 🏷️ **Quản lý danh mục**: Categories, brands, suppliers
- 🎁 **Quản lý khuyến mãi**: Tạo và theo dõi chương trình giảm giá
- 👥 **Quản lý người dùng**: Phân quyền và theo dõi hoạt động
- 🛍️ **Quản lý đơn hàng**: Xử lý và cập nhật trạng thái
- 💬 **Admin Chat**: Trả lời tin nhắn từ khách hàng
- 📝 **CMS**: Quản lý bài viết, banner, nội dung
- 💰 **Quản lý thanh toán**: Theo dõi giao dịch VNPay
- 📊 **Quản lý kho**: Inventory tracking
- ⭐ **Quản lý review**: Duyệt và phản hồi đánh giá
- 🔔 **Thông báo**: Real-time notifications

### 🔐 Xác thực & Bảo mật
- 🔑 **JWT Authentication**: Token-based security
- 🌐 **OAuth 2.0**: Đăng nhập Google & Facebook
- 🔒 **Role-based access**: ADMIN, USER roles
- 🔐 **Password reset**: Quên mật khẩu qua email
- 🔄 **Session management**: Auto refresh token

## 🛠️ Công nghệ sử dụng

### Core Technologies
- **React 19.1.1** - UI Library
- **Vite 7.1.7** - Build tool & dev server
- **React Router 7.9.2** - Client-side routing
- **Axios 1.12.2** - HTTP client

### UI/UX
- **TailwindCSS 4.1.13** - Utility-first CSS
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **React Icons** - Additional icons
- **Recharts 3.5.1** - Data visualization
- **Sonner** - Toast notifications

### Real-time & Chat
- **@stomp/stompjs** - WebSocket messaging
- **SockJS Client** - WebSocket fallback

### Others
- **React Helmet Async** - SEO management
- **React Quill New** - Rich text editor
- **date-fns** - Date utilities
- **clsx & tailwind-merge** - Conditional styling

### Development Tools
- **ESLint** - Code linting
- **Vite Plugin React** - Fast refresh

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm >= 9.0.0 hoặc yarn >= 1.22.0
- Git

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/TanDuy274/WWW_JAVA_Nhom08.git
cd WWW_JAVA_Nhom08/frontend
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
yarn install
```

3. **Cấu hình môi trường**
```bash
# Tạo file .env trong thư mục frontend
cp .env.example .env
```

Cấu hình file `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_VNPAY_RETURN_URL=http://localhost:5173/vnpay-return
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

4. **Chạy development server**
```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## 🚀 Sử dụng

### Development Mode
```bash
npm run dev
```
- Hot Module Replacement (HMR)
- Fast refresh
- Development tools enabled

### Production Build
```bash
npm run build
```
- Optimized bundle
- Tree shaking
- Code splitting
- Minification

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 Cấu trúc dự án

```
frontend/
├── public/                      # Static assets
│   └── images/                  # Public images
│       ├── avatars/
│       ├── banners/
│       ├── brands/
│       ├── products/
│       └── ...
├── src/
│   ├── api/                     # API service layer
│   │   ├── axiosConfig.js       # Axios configuration
│   │   ├── authAPI.js           # Authentication APIs
│   │   ├── productAPI.js        # Product APIs
│   │   ├── cartAPI.js           # Cart APIs
│   │   ├── orderAPI.js          # Order APIs
│   │   ├── paymentAPI.js        # Payment APIs
│   │   ├── chatAPI.js           # Chat APIs
│   │   └── ...
│   ├── assets/                  # Asset files
│   │   ├── fonts/
│   │   └── images/
│   ├── components/              # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ChatWidget.jsx
│   │   ├── Admin/               # Admin components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── ...
│   │   └── ui/                  # UI primitives
│   │       ├── button.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       └── ...
│   ├── contexts/                # React contexts
│   │   └── ChatContext.jsx
│   ├── lib/                     # Utility libraries
│   │   ├── utils.js
│   │   ├── data.js
│   │   └── payment.js
│   ├── pages/                   # Page components
│   │   ├── Home.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Orders.jsx
│   │   ├── Login.jsx
│   │   ├── Admin.jsx
│   │   └── Admin/               # Admin pages
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProduct.jsx
│   │       ├── AdminOrders.jsx
│   │       └── ...
│   ├── routes/                  # Route guards
│   │   ├── PrivateRoute.jsx
│   │   └── PublicRoute.jsx
│   ├── utils/                   # Utility functions
│   │   ├── storage.js
│   │   └── bannerUtils.js
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── .gitignore
├── components.json              # shadcn/ui config
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML template
├── jsconfig.json                # JavaScript config
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md
```

## 🔌 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints
```
POST   /auth/register          # Đăng ký tài khoản
POST   /auth/login             # Đăng nhập
POST   /auth/refresh           # Refresh token
POST   /auth/google            # Google OAuth
POST   /auth/facebook          # Facebook OAuth
POST   /auth/reset-password    # Reset mật khẩu
```

### Product Endpoints
```
GET    /products               # Lấy danh sách sản phẩm
GET    /products/{id}          # Chi tiết sản phẩm
POST   /products               # Tạo sản phẩm (ADMIN)
PUT    /products/{id}          # Cập nhật sản phẩm (ADMIN)
DELETE /products/{id}          # Xóa sản phẩm (ADMIN)
```

### Order Endpoints
```
GET    /orders                 # Lịch sử đơn hàng
GET    /orders/{id}            # Chi tiết đơn hàng
POST   /orders                 # Tạo đơn hàng
PUT    /orders/{id}/status     # Cập nhật trạng thái (ADMIN)
```

### Payment Endpoints
```
POST   /payment/vnpay/create   # Tạo thanh toán VNPay
GET    /payment/vnpay/return   # VNPay callback
```

Xem chi tiết API documentation tại backend repository.

## 📸 Screenshots

### Customer Interface
- Trang chủ với banner slider và sản phẩm nổi bật
- Danh sách sản phẩm với bộ lọc nâng cao
- Chi tiết sản phẩm với review và rating
- Giỏ hàng và checkout
- Theo dõi đơn hàng

### Admin Dashboard
- Tổng quan doanh thu với biểu đồ
- Quản lý sản phẩm
- Quản lý đơn hàng
- Báo cáo chi tiết

## 🤝 Đóng góp

Chúng tôi luôn hoan nghênh mọi đóng góp! Nếu bạn muốn đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Coding Standards
- Sử dụng ESLint configuration có sẵn
- Tuân thủ React best practices
- Component names: PascalCase
- Function names: camelCase
- Viết comments cho logic phức tạp


## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên hệ

- 📧 Email: your-email@example.com
- 🌐 Website: [Watch Store](https://watchstore.com)
- 📱 Facebook: [Watch Store Official](https://facebook.com/watchstore)

## 🙏 Lời cảm ơn

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [VNPay](https://vnpay.vn/)

---

<p align="center">Made with ❤️ by Nhóm 08</p>
<p align="center">© 2024-2025 Watch Store. All rights reserved.</p>
