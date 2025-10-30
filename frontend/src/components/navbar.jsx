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
    const [selectedCategory, setSelectedCategory] = useState(null); // 🆕 null ban đầu
    const dropdownTimeoutRef = useRef(null);

    const HIDE_DELAY = 200;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Lỗi khi fetch categories:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();

        //  Khi vừa load, xóa sản phẩm hiển thị
        if (onProductsChange) onProductsChange([]);

        return () => {
            if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        };
    }, []);

    //  Chọn danh mục
    const handleCategoryClick = async (categoryId, categoryName) => {
        setSelectedCategory({ id: categoryId, name: categoryName });
        setSearchTerm(""); // reset ô tìm kiếm khi chọn danh mục
        try {
            const res = await getProductsByCategoryId(categoryId);
            const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
            if (onProductsChange) onProductsChange(data);
        } catch (error) {
            console.error("Lỗi fetch sản phẩm theo danh mục:", error);
            if (onProductsChange) onProductsChange([]);
        }
        setIsDropdownOpen(false);
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };

    //  Tìm sản phẩm
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            // nếu input trống → không hiện sản phẩm
            if (onProductsChange) onProductsChange([]);
            setSelectedCategory(null); // reset danh mục
            return;
        }
        try {
            const results = await searchProductsByName(searchTerm);
            if (onProductsChange) onProductsChange(results);
            setSelectedCategory(null); // reset danh mục khi search
        } catch (err) {
            console.error("Lỗi tìm sản phẩm:", err);
            if (onProductsChange) onProductsChange([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    //Nếu chưa chọn danh mục và chưa nhập tìm kiếm → không hiển thị sản phẩm
    useEffect(() => {
        if (!selectedCategory && !searchTerm.trim()) {
            if (onProductsChange) onProductsChange([]);
        }
    }, [selectedCategory, searchTerm]);

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
            <div className="container mx-auto flex items-center justify-between h-16 px-4">
                {/* LOGO */}
                <div className="text-white text-2xl font-bold cursor-pointer">
                    WATCH STORE
                </div>

                {/* Dropdown danh mục */}
                <div
                    className="relative"
                    onMouseEnter={() => {
                        if (dropdownTimeoutRef.current)
                            clearTimeout(dropdownTimeoutRef.current);
                        setIsDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                        dropdownTimeoutRef.current = setTimeout(() => {
                            setIsDropdownOpen(false);
                        }, HIDE_DELAY);
                    }}
                >
                    <button className="flex items-center justify-center min-w-[120px] px-3 py-2 bg-white/20 rounded-lg text-white font-medium hover:bg-white/30 transition-all duration-200 whitespace-nowrap">
                        <span>
                            {selectedCategory ? selectedCategory.name : "Danh mục "}
                        </span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 py-2">
                            {categories.length === 0 ? (
                                <p className="px-4 py-2 text-gray-600">
                                    Không có danh mục.
                                </p>
                            ) : (
                                <ul className="text-gray-800">
                                    {categories.map((cat) => (
                                        <li
                                            key={cat.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-150"
                                            onClick={() =>
                                                handleCategoryClick(cat.id, cat.name)
                                            }
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
                <div className="flex-1 max-w-xl mx-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Bạn muốn mua gì hôm nay?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full h-10 pl-3 pr-12 rounded-lg bg-white text-gray-700
             outline-none border border-transparent
             focus:border-red-400 transition-all duration-200"
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
                <div className="flex items-center space-x-4">
                    <button className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30">
                        🛒 Giỏ hàng
                    </button>
                    {localStorage.getItem("accessToken") ? (
                        <button
                            onClick={() => navigate("/user")}
                            className="p-2 bg-white rounded-full text-red-600 hover:bg-red-100 transition"
                        >
                            👤
                        </button>
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
