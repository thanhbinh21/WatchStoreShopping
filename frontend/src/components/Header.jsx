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
  LifeBuoy,
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cartCount, _setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);
  const [notificationAnimation, setNotificationAnimation] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "WATCH STORE",
    logo: "",
  });
  const userDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const [userState, setUserState] = useState(parseStoredUser() || {});

  const formatNotificationDate = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "--";

  // Hàm phân loại thông báo dựa vào title và message
  const getNotificationType = (notification) => {
    const title = notification.title?.toLowerCase() || "";
    const message = notification.message?.toLowerCase() || "";

    if (title.includes("khuyến mãi") || title.includes("🎉")) {
      return "promotion";
    }
    if (title.includes("đơn hàng") || message.includes("đơn hàng")) {
      return "order";
    }
    if (title.includes("đánh giá")) {
      return "review";
    }
    return "general";
  };

  // Hàm xử lý click vào thông báo
  const handleNotificationClick = async (notification) => {
    const type = getNotificationType(notification);

    // Đánh dấu thông báo là đã đọc
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

    // Đóng dropdown
    setIsNotificationDropdownOpen(false);

    // Điều hướng đến trang tương ứng
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
        // Không điều hướng nếu là thông báo general
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

  // Fetch categories, brands and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesData = await getCategories();
        const categoriesArray = Array.isArray(categoriesData)
          ? categoriesData
          : Array.isArray(categoriesData.data)
          ? categoriesData.data
          : [];
        // Chỉ lấy categories có status ACTIVE
        const activeCategories = categoriesArray.filter(
          (cat) => cat.status === "ACTIVE"
        );
        setCategories(activeCategories);

        // Fetch brands
        const brandsData = await getBrands();
        setBrands(
          Array.isArray(brandsData)
            ? brandsData
            : Array.isArray(brandsData.data)
            ? brandsData.data
            : []
        );

        // Fetch settings
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

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!userState?.id || !token) {
      return;
    }

    console.log("🔌 Setting up WebSocket for user:", userState.id);

    const handleNewNotification = (notification) => {
      console.log("📬 New notification received via WebSocket:", notification);

      // Add new notification to the list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadNotifications((prev) => prev + 1);

      // Trigger animation
      setNotificationAnimation(true);
      setTimeout(() => setNotificationAnimation(false), 600);

      // Show toast notification
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });

      // Play notification sound (optional)
      try {
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore if audio fails to play
        });
      } catch (error) {
        // Ignore audio errors
      }
    };

    const ws = connectNotificationWebSocket(
      userState.id,
      handleNewNotification
    );

    return () => {
      console.log("🔌 Cleaning up WebSocket connection");
      disconnectNotificationWebSocket();
    };
  }, [userState?.id, token]);

  // Load wishlist count
  useEffect(() => {
    const updateWishlistCount = () => {
      const newCount = getWishlistCount();
      const oldCount = wishlistCount;
      setWishlistCount(newCount);

      // Trigger animation if count increased
      if (newCount > oldCount) {
        setWishlistAnimation(true);
        setTimeout(() => setWishlistAnimation(false), 600);
      }
    };

    updateWishlistCount();

    // Listen for storage changes to update count
    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlistUpdated", updateWishlistCount);

    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
    };
  }, [wishlistCount]);
  // cart count
  useEffect(() => {
    const updateCartCount = () => {
      const token = localStorage.getItem("accessToken");
      const user = parseStoredUser();

      if (!token || !user?.id) {
        _setCartCount(getGuestCartCount());
      } else {
        // Nếu user đã login thì gọi API
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

    // Dispatch event để các component khác biết user đã thay đổi
    window.dispatchEvent(new Event("userUpdated"));

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

    if (!isNotificationDropdownOpen) {
      await loadNotifications();
    }

    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-primary text-brand-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => navigate("/home")}
            className="cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="text-brand-primary-foreground text-xl md:text-2xl font-bold whitespace-nowrap">
                {settings.siteName}
              </div>
            )}
          </div>

          {/* Category Mega Menu Dropdown */}
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

          {/* Location Selector (Optional) */}
          {/* <button className="cursor-pointer hidden md:flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors">
            <MapPin size={18} />
            <span className="text-sm font-medium">Hồ Chí Minh</span>
            <ChevronDown size={14} />
          </button> */}

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
            className={`cursor-pointer relative flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
              wishlistAnimation ? "animate-bounce scale-110" : ""
            }`}
          >
            <Heart
              size={20}
              className={`transition-all ${
                wishlistAnimation ? "scale-125 text-red-400" : ""
              }`}
            />
            <span className="hidden md:inline font-medium">Yêu thích</span>
            {wishlistCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 transition-all ${
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
            className={`cursor-pointer relative flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
              cartAnimation ? "animate-bounce scale-110" : ""
            }`}
          >
            <ShoppingCart
              size={20}
              className={`transition-all ${
                cartAnimation ? "scale-125 text-green-400" : ""
              }`}
            />
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
              className={`cursor-pointer relative flex items-center gap-2 px-3 py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
                notificationAnimation ? "animate-bounce scale-110" : ""
              }`}
            >
              <Bell
                size={20}
                className={`transition-all ${
                  notificationAnimation ? "scale-125 text-yellow-400" : ""
                }`}
              />
              <span className="hidden md:inline font-medium">Thông báo</span>
              {unreadNotifications > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 transition-all ${
                    notificationAnimation ? "animate-ping" : ""
                  }`}
                >
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
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 text-sm text-foreground transition-colors cursor-pointer hover:bg-brand-accent-soft/50 ${
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
                        navigate("/support");
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                    >
                      <LifeBuoy size={16} />
                      <span>Hỗ trợ khách hàng</span>
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
