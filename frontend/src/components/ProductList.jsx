import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "@/api/cartAPI";
import { toast } from "sonner";

export default function ProductList({ products }) {
    const navigate = useNavigate();
    const [loadingItem, setLoadingItem] = useState(null);

    const handleAddToCart = async (productId) => {
        // Lấy user từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
            toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
            return;
        }

        console.log("User ID:", user.id);

        setLoadingItem(productId);
        try {
            const res = await addToCart(user.id, productId, 1);
            toast.success("Đã thêm vào giỏ hàng ✅");
            console.log("Cart updated:", res);
        } catch (err) {
            console.error(err);
            toast.error("Thêm vào giỏ hàng thất bại 😢");
        } finally {
            setLoadingItem(null);
        }
    };

    if (!products || products.length === 0) {
        return (
            <div className="mt-24 text-center text-gray-600 text-lg">
                Không có sản phẩm nào 😢
            </div>
        );
    }

    return (
        <div className="mt-24 container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Danh sách sản phẩm
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((prd) => (
                    <div
                        key={prd.id}
                        className="bg-white shadow-lg rounded-2xl p-4 flex flex-col hover:scale-105 transition-transform duration-300"
                    >
                        <div 
                            onClick={() => navigate(`/product/${prd.id}`)}
                            className="cursor-pointer"
                        >
                            <img
                                src={prd.primaryImageUrl || "https://via.placeholder.com/150"}
                                className="w-full h-48 object-cover rounded-xl mb-3"
                            />
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                                {prd.name}
                            </h3>
                            <p className="text-red-600 font-bold mt-2">
                                {prd.currentPrice?.toLocaleString("vi-VN")}₫
                            </p>
                        </div>
                        <button
                            onClick={() => handleAddToCart(prd.id)}
                            disabled={loadingItem === prd.id}
                            className="mt-auto bg-red-600 text-white rounded-xl py-2 hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loadingItem === prd.id ? "Đang thêm..." : "Thêm vào giỏ"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
