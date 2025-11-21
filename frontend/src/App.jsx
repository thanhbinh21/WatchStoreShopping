import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Admin } from "./pages/Admin";
import { AdminPromotions } from "./pages/Admin/AdminPromotions";
import { AdminUser } from "./pages/Admin/AdminUser";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { AdminMethodPayments } from "./pages/Admin/AdminMethodPayments";
import { AdminInvoice } from "./pages/Admin/AdminInvoice";
import { AdminOrders } from "./pages/Admin/AdminOrders";
import { AdminPricing } from "./pages/Admin/AdminPricing";
import { AdminProduct } from "./pages/Admin/AdminProduct";
import { AdminSettings } from "./pages/Admin/AdminSettings";
import { AdminStock } from "./pages/Admin/AdminStock";
import { AdminTable } from "./pages/Admin/AdminTable";
import { AdminTeam } from "./pages/Admin/AdminTeam";
import { AdminReview } from "./pages/Admin/AdminReview";
import { AdminViewReport } from "./pages/Admin/AdminViewReport";
import { Dashboard } from "./pages/Dashboard";
import { AdminBanner } from "./pages/Admin/AdminBanner";
import { default as Login, default as LoginRegister } from "./pages/Login";
import NotFound from "./pages/NotFound";
import { User } from "./pages/User";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Cart from "@/pages/Cart.jsx";
import { AdminCategories } from "./pages/Admin/AdminCategories";
import ProductDetail from "./pages/ProductDetail";
import { Home } from "./pages/Home";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProductList from "./pages/ProductList";
import { AdminPostCategory } from "./pages/Admin/AdminPostCategory";
import { AdminPost } from "./pages/Admin/AdminPost";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<ProductList />} />

        {/* Private */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <Admin />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProduct />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="banners" element={<AdminBanner />} />
          <Route path="post-categories" element={<AdminPostCategory />} />
          <Route path="posts" element={<AdminPost />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="payments" element={<AdminMethodPayments />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="reviews" element={<AdminReview />} />
          <Route path="users" element={<AdminUser />} />
          <Route path="invoice" element={<AdminInvoice />} />
          <Route path="reports" element={<AdminViewReport />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="table" element={<AdminTable />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* User routes */}
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
