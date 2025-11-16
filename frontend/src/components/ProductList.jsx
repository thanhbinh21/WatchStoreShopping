import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ProductCard from "./ProductCard";
import { getProducts } from "@/api/productAPI";

export default function ProductList({
  products: externalProducts,
  showViewAll = true,
}) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu có products từ props, sử dụng chúng
    if (externalProducts && externalProducts.length > 0) {
      setProducts(externalProducts);
    } else {
      // Nếu không có, fetch sản phẩm mặc định
      fetchDefaultProducts();
    }
  }, [externalProducts]);

  const fetchDefaultProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts({ page: 0, size: 8 });
      const productsList = result?.content || result || [];
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    // Scroll to top và có thể navigate đến trang products hoặc load thêm
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Hoặc có thể navigate đến trang products nếu có
    // navigate("/products");
  };

  if (loading) {
    return (
      <div className="py-16 container mx-auto px-4">
        <div className="text-center text-gray-600">
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-16 container mx-auto px-4">
        <div className="text-center text-gray-600 text-lg">
          Không có sản phẩm nào 😢
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg">
            Discover our handpicked selection of premium watches
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Products Button */}
        {showViewAll && (
          <div className="text-center">
            <button
              onClick={handleViewAll}
              className="px-8 py-3 bg-purple-100 text-purple-900 border-2 border-purple-900 rounded-lg font-semibold hover:bg-purple-900 hover:text-white transition-all duration-300"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
