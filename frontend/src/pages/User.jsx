import React, { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/navbar.jsx";
import ProductList from "../components/ProductList.jsx";

export const User = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };
  const [products, setProducts] = useState([]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <>
        <Navbar onProductsChange={setProducts} />
        <ProductList products={products} />
      </>
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Chào mừng đến Dashboard!
        </h1>
        <p className="mb-6">Bạn đã đăng nhập thành công role USER.</p>

        <button
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};
