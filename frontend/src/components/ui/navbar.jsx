import React, { useEffect, useState } from "react";
import { getCategories } from "../../api/categoryAPI";
// Thêm icon cho giao diện đẹp hơn (ví dụ: lucide-react, giả định đã có)
// Sử dụng inline SVG hoặc mô phỏng icon bằng text
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const ChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State quản lý dropdown

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Dữ liệu API trả về không phải là mảng:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Lỗi khi fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Hiển thị trạng thái tải
  if (isLoading) {
    return (
        <header className="fixed top-0 z-50 w-full bg-red-600 shadow-md">
            <div className="container mx-auto flex items-center h-16 px-4">
                <p className="text-white animate-pulse">Đang tải cấu hình...</p>
            </div>
        </header>
    );
  }

  // Render thanh điều hướng chính
  return (
    // Đặt Navbar cố định, z-index cao và màu nền đỏ (giống ảnh mẫu)
    <header className="fixed top-0 z-50 w-full bg-red-600 shadow-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        
        {/* Phần 1: Logo và Dropdown Danh mục */}
        <div className="flex items-center space-x-8">
          <div className="text-white text-2xl font-bold cursor-pointer">
            {/* Thay thế bằng logo thực tế */}
            WATCH STORE
          </div>
          
          {/* Dropdown Danh mục */}
          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="flex items-center space-x-1 p-2 bg-white/20 rounded-lg text-white font-medium hover:bg-white/30 transition">
              <MenuIcon />
              <span>Danh mục</span>
              <ChevronDown />
            </button>

            {/* Danh sách Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 py-2">
                {categories.length === 0 ? (
                    <p className="px-4 py-2 text-gray-600">Không có danh mục.</p>
                ) : (
                    <ul className="text-gray-800">
                        {categories.map((cat) => (
                          <li 
                            key={cat.id || cat.name}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-150"
                          >
                            {cat.name}
                          </li>
                        ))}
                    </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phần 2: Thanh Tìm kiếm */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Bạn muốn mua gì hôm nay?"
              className="w-full h-10 pl-12 pr-4 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            />
            <button className="absolute left-0 top-0 h-full w-10 flex items-center justify-center text-gray-500 hover:text-red-600 transition">
                <SearchIcon />
            </button>
          </div>
        </div>
        
        {/* Phần 3: Giỏ hàng và Đăng nhập/Đăng ký */}
        <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 p-2 bg-red-700/50 rounded-lg text-white font-medium hover:bg-red-700 transition">
                <span>Giỏ hàng</span>
                <span className="bg-white text-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">0</span>
            </button>
            <button className="px-4 py-2 bg-white rounded-lg text-red-600 font-bold hover:bg-red-100 transition">
                Đăng nhập
            </button>
        </div>

      </div>
    </header>
  );
}
