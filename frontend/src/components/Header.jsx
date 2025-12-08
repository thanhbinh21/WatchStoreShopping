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
  Bell,
  Heart,
  LifeBuoy,
  Menu, // Thêm icon Menu
  X, // Thêm icon X đóng menu
  ChevronRight,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { getCategories } from "../api/categoryAPI.js";
import { getBrands } from "../api/brandAPI.js";
import {
  getNotificationsByUser,
  markNotificationAsRead,
} from "@/api/notificationAPI";
import {
  connectNotificationWebSocket,
  disconnectNotificationWebSocket,
} from "@/api/notificationWebSocket";
import { parseStoredUser } from "@/utils/storage";
import { getWishlistCount } from "@/api/wishlistAPI";
import { getCart, getCartCount } from "@/api/cartAPI";
import { getGuestCartCount } from "@/api/guestCart";
import { getGeneralSettings } from "@/api/settingsAPI";
import MegaMenu from "./MegaMenu";

export default function Header() {
  const navigate = useNavigate();
  // State quản lý UI
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State cho mobile menu
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // State cho thanh search mobile

  // Data State
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cartCount, _setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [settings, setSettings] = useState({
    siteName: "WATCH STORE",
    logo: "",
  });

  // Animation State
  const [cartAnimation, setCartAnimation] = useState(false);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);
  const [notificationAnimation, setNotificationAnimation] = useState(false);

  // Refs
  const userDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // User info
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const [userState, setUserState] = useState(parseStoredUser() || {});

  const formatNotificationDate = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "--";

  // --- Logic cũ giữ nguyên ---
  const getNotificationType = (notification) => {
    const title = notification.title?.toLowerCase() || "";
    const message = notification.message?.toLowerCase() || "";

    if (title.includes("khuyến mãi") || title.includes("🎉"))
      return "promotion";
    if (title.includes("đơn hàng") || message.includes("đơn hàng"))
      return "order";
    if (title.includes("đánh giá")) return "review";
    return "general";
  };

  const handleNotificationClick = async (notification) => {
    const type = getNotificationType(notification);
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id, userState.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      }
    }
    setIsNotificationDropdownOpen(false);
    switch (type) {
      case "promotion":
        navigate("/promotional-products");
        break;
      case "order":
        navigate("/orders");
        break;
      case "review":
        navigate("/profile");
        break;
      default:
        break;
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(
          Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []
        );
        const brandsData = await getBrands();
        setBrands(
          Array.isArray(brandsData)
            ? brandsData
            : Array.isArray(brandsData.data)
            ? brandsData.data
            : []
        );
        const settingsData = await getGeneralSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error("Lỗi khi fetch data:", error);
        setCategories([]);
        setBrands([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!userState?.id || !token) return;
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadNotifications((prev) => prev + 1);
      setNotificationAnimation(true);
      setTimeout(() => setNotificationAnimation(false), 600);
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });
      try {
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (error) {}
    };
    const ws = connectNotificationWebSocket(
      userState.id,
      handleNewNotification
    );
    return () => disconnectNotificationWebSocket();
  }, [userState?.id, token]);

  useEffect(() => {
    const updateWishlistCount = () => {
      const newCount = getWishlistCount();
      if (newCount > wishlistCount) {
        setWishlistAnimation(true);
        setTimeout(() => setWishlistAnimation(false), 600);
      }
      setWishlistCount(newCount);
    };
    updateWishlistCount();
    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
    };
  }, [wishlistCount]);

  useEffect(() => {
    const updateCartCount = () => {
      const token = localStorage.getItem("accessToken");
      const user = parseStoredUser();
      if (!token || !user?.id) {
        _setCartCount(getGuestCartCount());
      } else {
        getCart(user.id)
          .then((res) => {
            const totalQuantity = Array.isArray(res?.items)
              ? res.items.reduce(
                  (sum, it) => sum + (Number(it.quantity) || 0),
                  0
                )
              : 0;
            _setCartCount(totalQuantity);
          })
          .catch(() => _setCartCount(0));
      }
    };
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

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
    window.dispatchEvent(new Event("userUpdated"));
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsMobileSearchOpen(false); // Close mobile search
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryId) => {
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false); // Close mobile menu
    navigate(`/products?category=${categoryId}`);
  };

  const handleToggleNotifications = async () => {
    if (!userState?.id || !token) {
      navigate("/login");
      return;
    }
    if (!isNotificationDropdownOpen) {
      await loadNotifications();
    }
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-primary text-brand-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-4">
          {/* --- MOBILE: Hamburger Menu --- */}
          <button
            className="lg:hidden p-2 -ml-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* --- Logo --- */}
          <div
            onClick={() => navigate("/home")}
            className="cursor-pointer hover:opacity-90 transition-opacity shrink-0 mr-auto lg:mr-0"
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-10 md:h-12 w-auto object-contain"
              />
            ) : (
              <div className="text-brand-primary-foreground text-lg md:text-2xl font-bold whitespace-nowrap">
                {settings.siteName}
              </div>
            )}
          </div>

          {/* --- DESKTOP: Category Mega Menu --- */}
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

            <MegaMenu
              categories={categories}
              brands={brands}
              isOpen={isCategoryDropdownOpen}
              onClose={() => setIsCategoryDropdownOpen(false)}
            />
          </div>

          {/* --- DESKTOP: Search Bar --- */}
          <div className="flex-1 max-w-2xl hidden lg:block">
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

          {/* --- ACTION ICONS GROUP --- */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* MOBILE ONLY: Search Toggle Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden cursor-pointer p-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className={`cursor-pointer relative flex items-center gap-2 p-2 md:px-3 md:py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
                wishlistAnimation ? "animate-bounce scale-110" : ""
              }`}
            >
              <Heart
                size={20}
                className={`transition-all ${
                  wishlistAnimation ? "scale-125 text-red-400" : ""
                }`}
              />
              <span className="hidden xl:inline font-medium">Yêu thích</span>
              {wishlistCount > 0 && (
                <span
                  className={`absolute top-0 right-0 md:-top-1 md:-right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-4 h-4 md:min-w-[18px] md:h-[18px] flex items-center justify-center px-1 transition-all ${
                    wishlistAnimation ? "animate-ping" : ""
                  }`}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className={`cursor-pointer relative flex items-center gap-2 p-2 md:px-3 md:py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
                cartAnimation ? "animate-bounce scale-110" : ""
              }`}
            >
              <ShoppingCart
                size={20}
                className={`transition-all ${
                  cartAnimation ? "scale-125 text-green-400" : ""
                }`}
              />
              <span className="hidden xl:inline font-medium">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 md:-top-1 md:-right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-4 h-4 md:min-w-[18px] md:h-[18px] flex items-center justify-center px-1">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={handleToggleNotifications}
                className={`cursor-pointer relative flex items-center gap-2 p-2 md:px-3 md:py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
                  notificationAnimation ? "animate-bounce scale-110" : ""
                }`}
              >
                <Bell
                  size={20}
                  className={`transition-all ${
                    notificationAnimation ? "scale-125 text-yellow-400" : ""
                  }`}
                />
                <span className="hidden xl:inline font-medium">Thông báo</span>
                {unreadNotifications > 0 && (
                  <span
                    className={`absolute top-0 right-0 md:-top-1 md:-right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-4 h-4 md:min-w-[18px] md:h-[18px] flex items-center justify-center px-1 transition-all ${
                      notificationAnimation ? "animate-ping" : ""
                    }`}
                  >
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>

              {isNotificationDropdownOpen && (
                <div className="fixed inset-x-4 top-16 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-80 bg-brand-primary-foreground rounded-lg shadow-xl border border-border overflow-hidden z-50">
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
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 text-sm text-foreground transition-colors cursor-pointer hover:bg-brand-accent-soft/50 ${
                            notification.read
                              ? "bg-card"
                              : "bg-brand-accent-soft"
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

            {/* User Menu (Hidden on Mobile - Moved to Sidebar) */}
            <div className="relative hidden md:block" ref={userDropdownRef}>
              {token ? (
                <>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="cursor-pointer flex items-center gap-2 px-2 py-2 md:px-3 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors"
                  >
                    {userState.avatarUrl ? (
                      <img
                        src={userState.avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <span className="hidden xl:inline font-medium max-w-[100px] truncate">
                      {userState.fullName || userState.username || "User"}
                    </span>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-card text-card-foreground rounded-lg shadow-xl py-2 border border-border z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {userState.fullName || userState.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
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
                          navigate("/orders");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                      >
                        <Package size={16} />
                        <span>Đơn hàng</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/support");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                      >
                        <LifeBuoy size={16} />
                        <span>Hỗ trợ</span>
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
                  className="flex items-center gap-2 px-3 py-2 bg-brand-foreground rounded-lg font-semibold bg-brand-primary-foreground/10 hover:bg-brand-primary-foreground/20 text-brand-primary-foreground transition-colors"
                >
                  <User size={18} />
                  <span className="hidden xl:inline">Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- MOBILE: Search Bar Expand --- */}
        {isMobileSearchOpen && (
          <div className="pb-3 lg:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                placeholder="Bạn muốn mua gì?"
                className="bg-brand-primary-foreground w-full px-4 py-2.5 pr-12 rounded-lg border-0 focus:outline-none text-brand-ink placeholder-text-muted text-sm shadow-inner"
              />
              <button
                onClick={handleSearch}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-primary"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MOBILE MENU SIDEBAR (Drawer) --- */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-60 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-70 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="flex items-center justify-between mb-6">
            <div className="font-bold text-xl text-brand-primary">Menu</div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* User Info Section Mobile */}
          {token ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
              {userState.avatarUrl ? (
                <img
                  src={userState.avatarUrl}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <User size={24} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {userState.fullName || userState.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userState.email}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="w-full mb-6 py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-soft transition-colors"
            >
              Đăng nhập / Đăng ký
            </button>
          )}

          {/* Navigation Links */}
          <div className="flex-1 space-y-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-2">
              Danh mục
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full flex items-center justify-between px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <span>{cat.name}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}

            <div className="border-t border-gray-100 my-4"></div>

            {token && (
              <>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Tài khoản
                </div>
                {role === "ADMIN" && (
                  <button
                    onClick={() => {
                      navigate("/admin");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <LayoutDashboard size={18} /> Quản trị
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <User size={18} /> Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => {
                    navigate("/orders");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Package size={18} /> Đơn hàng của tôi
                </button>
                <button
                  onClick={() => {
                    navigate("/wishlist");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Heart size={18} /> Sản phẩm yêu thích
                </button>

                <div className="border-t border-gray-100 my-4"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
