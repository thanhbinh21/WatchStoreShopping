import React, { useEffect, useState } from "react";
import { getProductsByCategoryId } from "../api/findAPI.js";

export default function ProductList({ categoryId }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let data = [];
                if (categoryId) {
                    const res = await getProductsByCategoryId(categoryId);
                    // kiểm tra nếu res có field "data"
                    data = Array.isArray(res)
                        ? res
                        : Array.isArray(res.data)
                            ? res.data
                            : [];
                } else {
                    const res = await fetch("http://localhost:8080/api/products");
                    const json = await res.json();
                    data = Array.isArray(json)
                        ? json
                        : Array.isArray(json.data)
                            ? json.data
                            : [];
                }

                setProducts(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách sản phẩm:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categoryId]);

    if (loading) {
        return (
            <div className="mt-24 flex justify-center">
                <p className="text-gray-500 animate-pulse text-lg">
                    Đang tải sản phẩm...
                </p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="mt-24 text-center text-gray-600 text-lg">
                Không có sản phẩm nào trong danh mục này 😢
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
                        <img
                            src={prd.imageUrl || "https://via.placeholder.com/150"}
                            // alt={prd.name}
                            className="w-full h-48 object-cover rounded-xl mb-3"
                        />
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {prd.name}
                        </h3>
                        <p className="text-red-600 font-bold mt-2">
                            {prd.price?.toLocaleString("vi-VN")}₫
                        </p>
                        <button className="mt-auto bg-red-600 text-white rounded-xl py-2 hover:bg-red-700 transition">
                            Thêm vào giỏ
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
