import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getWishlist, removeFromWishlist } from "@/api/wishlistAPI";
import { addToCart, getCart } from "@/api/cartAPI";
import { addToGuestCart } from "@/api/guestCart";
import { parseStoredUser } from "@/utils/storage";
import Breadcrumb from "@/components/Breadcrumb";

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist từ localStorage
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    setLoading(true);
    const items = getWishlist();
    setWishlist(items);
    setLoading(false);
  };

  // Handle xóa sản phẩm khỏi wishlist
  const handleRemove = (productId) => {
    const success = removeFromWishlist(productId);
    if (success) {
      toast.success("Đã xóa khỏi danh sách yêu thích");
      loadWishlist();
      // Dispatch event để cập nhật count ở Header
      window.dispatchEvent(new Event("wishlistUpdated"));
    } else {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  // Handle thêm vào giỏ hàng
  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();

      // If not logged in -> add to guest cart
      if (!token || !user?.id) {
        addToGuestCart(product, 1);
        toast.success("Đã thêm vào giỏ hàng (Khách) 🛒");
        window.dispatchEvent(new Event("cartUpdated"));
        return;
      }

    const maxStock = Number.isFinite(product?.stockQuantity)
      ? product.stockQuantity
      : Number.isFinite(product?.stock)
      ? product.stock
      : Infinity;
    if (maxStock <= 0) {
      toast.error("Sản phẩm hết hàng");
      return;
    }

    try {
      try {
        const cart = await getCart(user.id);
        const existing = (cart.items || []).find((i) => i.productId === product.id || i.id === product.id);
        const currentQty = existing ? existing.quantity : 0;
        if (currentQty + 1 > maxStock) {
          toast.error("Không thể thêm vượt quá tồn kho");
          return;
        }
      } catch (e) {
        // ignore
      }
      await addToCart(user.id, product.id, 1);
      toast.success("Đã thêm vào giỏ hàng ✅");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    }
  };

  // Handle điều hướng đến trang chi tiết sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // SVG placeholder
  const svgPlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Helper to get proper image URL
  const getImageUrl = (url) => {
    if (!url) return svgPlaceholder;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `/images/products/${url}`;
  };

  const getBrandName = (product) => {
    return typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || product.brandName || "CHRONOS";
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Breadcrumb items={[{ label: "Danh sách yêu thích", isCurrent: true }]} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="text-red-500 fill-red-500" size={32} />
              Danh sách yêu thích
            </h1>
            <p className="text-gray-600 mt-2">
              Bạn có {wishlist.length} sản phẩm yêu thích
            </p>
          </div>

          {/* Empty State */}
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Heart className="mx-auto text-gray-300" size={64} />
              <h2 className="text-2xl font-semibold text-gray-900 mt-4">
                Chưa có sản phẩm yêu thích
              </h2>
              <p className="text-gray-600 mt-2 mb-6">
                Hãy thêm sản phẩm yêu thích để dễ dàng theo dõi và mua sắm
              </p>
              <button
                onClick={() => navigate("/products")}
                className="bg-brand-primary text-white px-8 py-3 rounded-lg hover:bg-brand-primary-soft transition-colors font-medium"
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image */}
                  <div
                    onClick={() => handleProductClick(product.id)}
                    className="relative w-full h-56 lg:h-64 overflow-hidden bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = svgPlaceholder;
                      }}
                    />
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(product.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                      aria-label="Xóa khỏi yêu thích"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Brand */}
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {getBrandName(product)}
                    </p>

                    {/* Product Name */}
                    <h3
                      onClick={() => handleProductClick(product.id)}
                      className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 min-h-12 cursor-pointer hover:text-brand-primary transition-colors"
                    >
                      {product.name}
                    </h3>

                    {/* Price */}
                    <p className="text-gray-900 font-bold text-xl mb-2">
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

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white rounded-lg py-2.5 hover:bg-brand-primary-soft transition-colors font-medium"
                      >
                        <ShoppingCart size={16} />
                        <span>Thêm vào giỏ</span>
                      </button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
                        aria-label="Xóa"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
