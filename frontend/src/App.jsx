import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { User } from "./pages/User";
import NotFound from "./pages/NotFound";
import { AdminProduct } from "./pages/AdminProduct";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminFavorites } from "./pages/AdminFavorites";
import { AdminInbox } from "./pages/AdminInbox";
import { AdminOrders } from "./pages/AdminOrders";
import { AdminStock } from "./pages/AdminStock";
import { AdminPricing } from "./pages/AdminPricing";
import { AdminCalendar } from "./pages/AdminCalendar";
import { AdminTodo } from "./pages/AdminTodo";
import { AdminContact } from "./pages/AdminContact";
import { AdminInvoice } from "./pages/AdminInvoice";
import { AdminUIElements } from "./pages/AdminUIElements";
import { AdminTeam } from "./pages/AdminTeam";
import { AdminTable } from "./pages/AdminTable";
import { AdminSettings } from "./pages/AdminSettings";

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
