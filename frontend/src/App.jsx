import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Admin } from "./pages/Admin";
import { AdminCalendar } from "./pages/Admin/AdminCalendar";
import { AdminContact } from "./pages/Admin/AdminContact";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { AdminFavorites } from "./pages/Admin/AdminFavorites";
import { AdminInbox } from "./pages/Admin/AdminInbox";
import { AdminInvoice } from "./pages/Admin/AdminInvoice";
import { AdminOrders } from "./pages/Admin/AdminOrders";
import { AdminPricing } from "./pages/Admin/AdminPricing";
import { AdminProduct } from "./pages/Admin/AdminProduct";
import { AdminSettings } from "./pages/Admin/AdminSettings";
import { AdminStock } from "./pages/Admin/AdminStock";
import { AdminTable } from "./pages/Admin/AdminTable";
import { AdminTeam } from "./pages/Admin/AdminTeam";
import { AdminTodo } from "./pages/Admin/AdminTodo";
import { AdminUIElements } from "./pages/Admin/AdminUIElements";
import { Dashboard } from "./pages/Dashboard";
import { default as Login, default as LoginRegister } from "./pages/Login";
import NotFound from "./pages/NotFound";
import { User } from "./pages/User";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { AdminCategories } from "./pages/Admin/AdminCategories";

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
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginRegister />
            </PublicRoute>
          }
        />

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
          <Route path="favorites" element={<AdminFavorites />} />
          <Route path="inbox" element={<AdminInbox />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="todo" element={<AdminTodo />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="invoice" element={<AdminInvoice />} />
          <Route path="ui-elements" element={<AdminUIElements />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="table" element={<AdminTable />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* User routes */}
        <Route
          path="/user"
          element={
            <PrivateRoute allowedRoles={["USER"]}>
              <User />
            </PrivateRoute>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
