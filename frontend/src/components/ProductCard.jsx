import React, { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { addToCart } from "@/api/cartAPI";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setFavorite(!favorite);
  };

  const handleCardClick = () => {
    // Điều hướng đến trang chi tiết sản phẩm
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    // Kiểm tra đăng nhập
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      // Chuyển đến trang login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(user.id, product.id, 1);
      toast.success("Đã thêm vào giỏ hàng ✅");
      // Gọi callback nếu có
      if (onAddToCart) {
        onAddToCart(product.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    } finally {
      setIsAdding(false);
    }
  };

  // Determine badge based on product data
  const getBadge = () => {
    // Logic để xác định badge dựa trên product properties
    // Có thể dựa vào createdAt (new), rating (popular), sales (best seller), stock (limited)
    if (!product.createdAt) return null;

    const daysSinceCreation = Math.floor(
      (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation < 30) {
      return { text: "New", color: "bg-orange-500" };
    }
    if (product.rating && product.rating >= 4.7) {
      return { text: "Popular", color: "bg-orange-400" };
    }
    if (product.numOfRating && product.numOfRating > 100) {
      return { text: "Best Seller", color: "bg-orange-500" };
    }
    // You can add more logic here for "Limited" based on stock
    return null;
  };

  const badge = getBadge();
  // Get brand name - handle both string and object cases
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || product.brandName || "CHRONOS";

  // SVG placeholder
  const svgPlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Helper to get proper image URL
  const getImageUrl = (url) => {
    if (!url) return svgPlaceholder;
    // If already full URL (http/https) or data URI, use as is
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    // If relative path, prepend with /images/products/ (from public folder)
    return `/images/products/${url}`;
  };

  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() =>
    getImageUrl(product.imageUrl || product.primaryImageUrl)
  );

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      e.target.src = svgPlaceholder;
      setImageSrc(svgPlaceholder);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full h-56 lg:h-64 overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={handleImageError}
        />

        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-3 left-3 ${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full`}
          >
            {badge.text}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 lg:p-5">
        {/* Brand Name */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {brandName}
        </p>

        {/* Product Name */}
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 mb-2 min-h-12">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-gray-900 font-bold text-lg lg:text-xl mb-2">
          {product.currentPrice
            ? `${product.currentPrice.toLocaleString("vi-VN")}₫`
            : product.price
            ? `${Number(product.price).toLocaleString("vi-VN")}₫`
            : "Liên hệ"}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-4">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm font-medium text-gray-700">
              {product.rating.toFixed(1)}
            </span>
            {product.numOfRating && (
              <span className="text-xs text-gray-500 ml-1">
                ({product.numOfRating})
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button and Favorite */}
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-900 text-white rounded-lg py-2.5 hover:bg-purple-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium text-sm lg:text-base"
          >
            {isAdding ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Đang thêm...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors"
            aria-label="Yêu thích"
          >
            <Heart
              size={18}
              className={
                favorite ? "text-red-500 fill-red-500" : "text-gray-600"
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}
