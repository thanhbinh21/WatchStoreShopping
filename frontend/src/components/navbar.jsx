import React, { useEffect, useState, useRef } from "react";
import { getCategories } from "../api/categoryAPI.js";
import { getProductsByCategoryId, searchProductsByName } from "../api/findAPI.js";
import { useNavigate } from "react-router";

export default function Navbar({ onProductsChange }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  const HIDE_DELAY = 200;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Lỗi khi fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Đóng dropdown user khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = async (id, name) => {
    setSelectedCategory({ id, name });
    setSearchTerm("");
    try {
      const products = await getProductsByCategoryId(id);
      if (onProductsChange) onProductsChange(Array.isArray(products) ? products : []);
    } catch (err) {
      console.error("Lỗi fetch sản phẩm:", err);
      if (onProductsChange) onProductsChange([]);
    }
    setIsDropdownOpen(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      if (onProductsChange) onProductsChange([]);
      setSelectedCategory(null);
      return;
    }
    try {
      const results = await searchProductsByName(searchTerm);
      if (onProductsChange) onProductsChange(results);
      setSelectedCategory(null);
    } catch (err) {
      console.error("Lỗi tìm sản phẩm:", err);
      if (onProductsChange) onProductsChange([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <header className="fixed top-0 z-50 w-full bg-red-600 shadow-md">
        <div className="container mx-auto flex items-center h-16 px-4">
          <p className="text-white animate-pulse">Đang tải cấu hình...</p>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-red-600 shadow-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 overflow-visible">
        {/* LOGO */}
        <div className="text-white text-2xl font-bold cursor-pointer flex-shrink-0">
          WATCH STORE
        </div>

        {/* Dropdown danh mục */}
        <div
          className="relative flex-shrink-0"
          onMouseEnter={() => {
            if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
            setIsDropdownOpen(true);
          }}
          onMouseLeave={() => {
            dropdownTimeoutRef.current = setTimeout(() => setIsDropdownOpen(false), HIDE_DELAY);
          }}
        >
          <button className="flex items-center justify-center min-w-[120px] px-3 py-2 bg-white/20 rounded-lg text-white font-medium hover:bg-white/30 transition-all duration-200 whitespace-nowrap">
            {selectedCategory ? selectedCategory.name : "Danh mục"}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 py-2">
              {categories.length === 0 ? (
                <p className="px-4 py-2 text-gray-600">Không có danh mục.</p>
              ) : (
                <ul className="text-gray-800">
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-150"
                      onClick={() => handleCategoryClick(cat.id, cat.name)}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Ô tìm kiếm */}
        <div className="flex-1 mx-4 max-w-xl">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Bạn muốn mua gì hôm nay?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 pl-3 pr-12 rounded-lg bg-white text-gray-700 outline-none border border-transparent focus:border-red-400 transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
            >
              🔍
            </button>
          </div>
        </div>

        {/* Giỏ hàng + user */}
        <div className="flex items-center space-x-4 flex-shrink-0" ref={userDropdownRef}>
          <button
            onClick={() => navigate("/cart")}
            className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30"
          >
            🛒 Giỏ hàng
          </button>

          {localStorage.getItem("accessToken") ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-100 transition"
              >
                👤
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 py-2">
                  <button
                    onClick={() => {
                      navigate("/user-profile");
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Trang cá nhân
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-white rounded-lg text-red-600 font-bold hover:bg-red-100 transition"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
