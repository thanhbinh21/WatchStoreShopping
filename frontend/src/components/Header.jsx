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
  Clock, // Icon cho Danh mục
  Hash, // Icon cho Thương hiệu
  Gift, // Icon cho Khuyến mãi
  FileText, // Icon cho Bài viết
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
import { searchProducts, getProducts } from "@/api/productAPI";
import { MdTrendingUp } from "react-icons/md";
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
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [settings, setSettings] = useState({
    siteName: "WATCH STORE",
    logo: "",
  });

  // Animation State
  const [cartAnimation, setCartAnimation] = useState(false);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationAnimation, setNotificationAnimation] = useState(false);

  const userDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const searchInputRef = useRef(null);


  // User info
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const [userState, setUserState] = useState(parseStoredUser() || {});

  // Load search history từ localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Lỗi khi đọc lịch sử tìm kiếm:", error);
        setSearchHistory([]);
      }
    }
  }, []);

  // Load trending products (6 sản phẩm mới nhất)
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const data = await getProducts({
          page: 0,
          size: 6,
          sortBy: "createdAt",
          order: "desc"
        });
        setTrendingProducts(data.content || []);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm trending:", error);
        setTrendingProducts([]);
      }
    };
    fetchTrendingProducts();
  }, []);

  // Lưu search history vào localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Xử lý tìm kiếm realtime
useEffect(() => {
  const delayDebounceFn = setTimeout(async () => {
    if (!isSearchInputFocused) {
      return;
    }
    if (searchTerm.trim() === "") {
      setSearchSuggestions(null);
      if (isSearchInputFocused) {
        setIsSearchDropdownOpen(true);
      }
      return;
    }
    if (searchTerm.trim().length < 1) {
      setSearchSuggestions({
        exactMatches: [],
        suggestedProducts: []
      });
      return;
    }
    setIsLoading(true);
    try {
      const searchResults = await searchProducts(searchTerm);
      console.log("Header: raw searchResults:", searchResults);
      // Đảm bảo là array
      const results = Array.isArray(searchResults) ? searchResults : [];
      console.log("Header: normalized results length:", results.length);
      const suggestions = {
        exactMatches: results.slice(0, 5),
        suggestedProducts: results.slice(5, 10)
      };
      setSearchSuggestions(suggestions);

      if (isSearchInputFocused) {
        setIsSearchDropdownOpen(true);
      }
    } catch (error) {
      setSearchSuggestions({
        exactMatches: [],
        suggestedProducts: []
      });
    } finally {
      setIsLoading(false);
    }
  }, 300);

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

  return () => {
    clearTimeout(delayDebounceFn);
  };
}, [searchTerm, isSearchInputFocused]);

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

  // Load notifications
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
        const brandsArray = Array.isArray(brandsData)
          ? brandsData
          : Array.isArray(brandsData.data)
          ? brandsData.data
          : [];
        const activeBrands = brandsArray.filter((b) => b.status === "ACTIVE");
        setBrands(activeBrands);
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
        audio.play().catch(() => {});
      } catch (error) {}
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

  // Cart count
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
              ? res.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
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

  // Update user state
  useEffect(() => {
    const onUserUpdated = () => setUserState(parseStoredUser() || {});
    const onStorage = (e) => {
      if (!e.key || e.key === "user" || e.key === "accessToken" || e.key === "role") {
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
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
        setIsSearchInputFocused(false);
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
    const term = searchTerm.trim();
    if (!term) return;

    // Lưu vào lịch sử tìm kiếm
    const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    // Đóng dropdown và điều hướng
    setIsSearchDropdownOpen(false);

    console.log("zzzz",term);
    navigate(`/products?name=${encodeURIComponent(term)}`);

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

  const handleClearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleRemoveSearchHistoryItem = (index) => {
    const newHistory = [...searchHistory];
    newHistory.splice(index, 1);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleSuggestionClick = (product) => {
    setIsSearchDropdownOpen(false);
    setSearchTerm("");
    navigate(`/product/${product.productId || product.id}`);
  };

const formatPrice = (product) => {
  // Nếu product có currentPrice
  if (product.currentPrice) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(product.currentPrice);
  }

  // Nếu product có price
  if (product.price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(product.price);
  }

  // Nếu product có productPrices
  if (product.productPrices && Array.isArray(product.productPrices)) {
    const currentPrice = product.productPrices.find(p => p.isCurrent);
    if (currentPrice && currentPrice.price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(currentPrice.price);
    }
  }

  return 'Liên hệ';
};

// Helper to get a product's primary image URL safely
const getPrimaryImage = (product) => {
  if (!product) return "https://via.placeholder.com/80";
  // Prefer common flattened fields
  if (product.imageUrl) return product.imageUrl;
  if (product.primaryImageUrl) return product.primaryImageUrl;
  // Support nested productImages array
  if (Array.isArray(product.productImages)) {
    const primary = product.productImages.find((img) => img.isPrimary);
    if (primary && primary.imageUrl) return primary.imageUrl;
    if (product.productImages.length > 0 && product.productImages[0].imageUrl) return product.productImages[0].imageUrl;
  }
  // Support method-style accessor
  if (typeof product.getPrimaryImageUrl === "function") return product.getPrimaryImageUrl();
  return "https://via.placeholder.com/80";
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
{/* Search Bar */}
          <div className="flex-1 max-w-2xl relative" ref={searchDropdownRef}>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Không tự động mở dropdown khi gõ, chỉ mở khi click/focus
                }}
                onFocus={() => {
              setIsSearchInputFocused(true); // Đánh dấu input đang được focus
              setIsSearchDropdownOpen(true); // Mở dropdown khi focus
            }}
                onKeyDown={handleKeyDown}
                placeholder="Bạn muốn mua gì hôm nay?"
                className="bg-brand-primary-foreground w-full px-4 py-2.5 pr-12 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary-foreground/20 text-brand-ink placeholder-text-muted"
              />
              <button
                onClick={handleSearch}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-primary hover:text-brand-primary-soft transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
                ) : (
                  <Search size={20} />
                )}
              </button>
            </div>

            {/* Search Dropdown */}
            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto z-50">
                {/* Khi chưa nhập gì - Hiển thị lịch sử và trending */}
                {!searchTerm.trim() && (
                  <div className="p-4">
                    {/* Lịch sử tìm kiếm - Chỉ hiển thị 5 cái gần nhất */}
                    {searchHistory.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Clock size={16} />
                            Lịch sử tìm kiếm
                          </h3>
                          <button
                            onClick={handleClearSearchHistory}
                            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                          >
                            Xóa tất cả
                          </button>
                        </div>
                        <div className="space-y-2">
                          {searchHistory.slice(0, 5).map((item, index) => ( // Chỉ lấy 5 cái đầu
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group"
                              onClick={() => {
                                setSearchTerm(item);
                                setIsSearchDropdownOpen(false);
                                setIsSearchInputFocused(false);
                                navigate(`/products?name=${encodeURIComponent(item)}`);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Clock size={16} className="text-gray-400" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSearchHistoryItem(index);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Xu hướng tìm kiếm */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <MdTrendingUp className="text-xl text-blue-500" />
                        Xu hướng tìm kiếm
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {trendingProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => {
                              setIsSearchDropdownOpen(false);
                              handleSuggestionClick(product);
                            }}
                          >
                            <img
                              src={product.imageUrl || product.getPrimaryImageUrl?.() || "https://via.placeholder.com/80"}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 truncate">{product.name}</p>
                              <p className="text-sm font-semibold text-brand-primary">
                                {formatPrice(product.price || product.currentPrice || 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

          {/* Khi đã nhập - Hiển thị suggestions */}
          {searchTerm.trim() && (
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                  <span className="ml-3 text-gray-500">Đang tìm kiếm...</span>
                </div>
              ) : searchSuggestions ? (
                <>
                  {/* Debug info */}
                  <div className="mb-2 text-xs text-gray-400">
                    Tìm thấy {searchSuggestions.exactMatches?.length + searchSuggestions.suggestedProducts?.length} kết quả
                  </div>
                  
                  {/* Có phải bạn muốn tìm */}
                  {(searchSuggestions.exactMatches?.length > 0) && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Có phải bạn muốn tìm
                      </h3>
                      <div className="space-y-3">
                        {searchSuggestions.exactMatches.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"

                            onClick={() => {
                              setIsSearchDropdownOpen(false);
                              setIsSearchInputFocused(false);
                              handleSuggestionClick(product);
                            }}
                          >
                            <img
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80';
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                {product.name}
                              </p>
                              <p className="text-sm font-semibold text-brand-primary mt-1">
                                {formatPrice(product)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sản phẩm gợi ý */}
                  {(searchSuggestions.suggestedProducts?.length > 0) && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Sản phẩm gợi ý
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {searchSuggestions.suggestedProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => {
                              setIsSearchDropdownOpen(false);
                              setIsSearchInputFocused(false);
                              handleSuggestionClick(product);
                            }}
                          >
                            <img
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80';
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 truncate">{product.name}</p>
                              <p className="text-sm font-semibold text-brand-primary">
                                {formatPrice(product)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Không tìm thấy kết quả */}
                  {searchSuggestions.exactMatches?.length === 0 && 
                  searchSuggestions.suggestedProducts?.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
                      <p className="text-sm text-gray-400 mt-1">Từ khóa: "{searchTerm}"</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nhập từ khóa để tìm kiếm</p>
                </div>
              )}
            </div>
          )}
              </div>
            )}
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
