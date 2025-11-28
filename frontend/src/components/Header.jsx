import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  ChevronDown,
  Grid3x3,
  MapPin,
  Bell,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { getCategories } from "../api/categoryAPI.js";
import {
  getNotificationsByUser,
  markAllNotificationsAsRead,
} from "@/api/notificationAPI";
import { parseStoredUser } from "@/utils/storage";
import { getWishlistCount } from "@/api/wishlistAPI";

export default function Header() {
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [cartCount, _setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const userDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const [userState, setUserState] = useState(parseStoredUser() || {});

  const formatNotificationDate = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "--";

  const loadNotifications = useCallback(async () => {
    if (!userState?.id || !token) {
      setNotifications([]);
      setUnreadNotifications(0);
      return 0;
    }

    try {
      const data = await getNotificationsByUser(userState.id);
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      const unreadCount = list.filter((item) => !item.read).length;
      setUnreadNotifications(unreadCount);
      return unreadCount;
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      setNotifications([]);
      setUnreadNotifications(0);
      return 0;
    }
  }, [userState?.id, token]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(
          Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []
        );
      } catch (error) {
        console.error("Lỗi khi fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Load wishlist count
  useEffect(() => {
    const updateWishlistCount = () => {
      setWishlistCount(getWishlistCount());
    };

    updateWishlistCount();

    // Listen for storage changes to update count
    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlistUpdated", updateWishlistCount);

    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
    };
  }, []);

  // Update user state when profile changes elsewhere in the app
  useEffect(() => {
    const onUserUpdated = () => setUserState(parseStoredUser() || {});
    const onStorage = (e) => {
      if (
        !e.key ||
        e.key === "user" ||
        e.key === "accessToken" ||
        e.key === "role"
      ) {
        setUserState(parseStoredUser() || {});
      }
    };

    window.addEventListener("userUpdated", onUserUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("userUpdated", onUserUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryId) => {
    setIsCategoryDropdownOpen(false);
    navigate(`/products?category=${categoryId}`);
  };

  const handleToggleNotifications = async () => {
    if (!userState?.id || !token) {
      navigate("/login");
      return;
    }

    let unreadCount = unreadNotifications;
    if (!isNotificationDropdownOpen) {
      unreadCount = await loadNotifications();
    }

    const nextState = !isNotificationDropdownOpen;
    setIsNotificationDropdownOpen(nextState);

    if (!isNotificationDropdownOpen && unreadCount > 0) {
      try {
        await markAllNotificationsAsRead(userState.id);
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, read: true }))
        );
        setUnreadNotifications(0);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái thông báo:", error);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-primary text-brand-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => navigate("/home")}
            className="text-brand-primary-foreground text-xl md:text-2xl font-bold cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            WATCH STORE
          </div>

          {/* Category Dropdown */}
          <div className="relative hidden lg:block" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-brand-primary-foreground/10 hover:bg-brand-primary-foreground/20 text-brand-primary-foreground rounded-lg transition-colors"
            >
              <Grid3x3 size={18} />
              <span className="font-medium">Danh mục</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-card text-card-foreground rounded-lg shadow-xl py-2 border border-border max-h-96 overflow-y-auto">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Không có danh mục
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location Selector (Optional) */}
          <button className="cursor-pointer hidden md:flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors">
            <MapPin size={18} />
            <span className="text-sm font-medium">Hồ Chí Minh</span>
            <ChevronDown size={14} />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Bạn muốn mua gì hôm nay?"
                className="bg-brand-primary-foreground w-full px-4 py-2.5 pr-12 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary-foreground/20 text-brand-ink placeholder-text-muted"
              />
              <button
                onClick={handleSearch}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-primary hover:text-brand-primary-soft transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Wishlist */}
          <button
            onClick={() => navigate("/wishlist")}
            className="cursor-pointer relative flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors"
          >
            <Heart size={20} />
            <span className="hidden md:inline font-medium">Yêu thích</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="cursor-pointer relative flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors"
          >
            <ShoppingCart size={20} />
            <span className="hidden md:inline font-medium">Giỏ hàng</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={handleToggleNotifications}
              className="cursor-pointer relative flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="hidden md:inline font-medium">Thông báo</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>

            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-brand-primary-foreground rounded-lg shadow-xl border border-border overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Thông báo
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {unreadNotifications > 0
                      ? `${unreadNotifications} chưa đọc`
                      : "Đã đọc tất cả"}
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Chưa có thông báo nào
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 text-sm text-foreground transition-colors ${
                          notification.read ? "bg-card" : "bg-brand-accent-soft"
                        }`}
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                          {formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            {token ? (
              <>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors"
                >
                  {userState.avatarUrl ? (
                    <img
                      src={userState.avatarUrl}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <User size={20} />
                  )}

                  <span className="hidden md:inline font-medium">
                    {userState.fullName || userState.username || "User"}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-card text-card-foreground rounded-lg shadow-xl py-2 border border-border">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">
                        {userState.fullName || userState.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userState.email || ""}
                      </p>
                    </div>

                    {role === "ADMIN" && (
                      <button
                        onClick={() => {
                          navigate("/admin");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        <span>Quản trị</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigate("/profile");
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                    >
                      <User size={16} />
                      <span>Hồ sơ</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/wishlist");
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                    >
                      <Heart size={16} />
                      <span>Yêu thích</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/cart");
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                    >
                      <ShoppingCart size={16} />
                      <span>Giỏ hàng</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/orders");
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>Đơn hàng</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-accent hover:bg-brand-accent-soft transition-colors border-t border-border mt-1"
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 bg-brand-foreground rounded-lg font-semibold bg-brand-primary-foreground/10 hover:bg-brand-primary-foreground/20 text-brand-primary-foreground transition-colors"
              >
                <User size={18} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
