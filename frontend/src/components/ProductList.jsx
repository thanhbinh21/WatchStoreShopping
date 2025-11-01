import React from "react";

export default function ProductList({ products }) {
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
