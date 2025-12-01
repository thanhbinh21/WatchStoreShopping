import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPromotions } from "@/api/promotionAPI";
import { getProducts, getProductById  } from "@/api/productAPI";
import { addToCart, getCart } from "@/api/cartAPI";
import { addToGuestCart } from "@/api/guestCart";
import { toast } from "sonner";
import { Loader2, Tag, ShoppingCart, Calendar, Percent, Package, Clock } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { parseStoredUser } from "@/utils/storage";

export default function PromotionalProducts() {
  const navigate = useNavigate();
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [activePromotions, setActivePromotions] = useState([]);
  const [upcomingPromotions, setUpcomingPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDiscountedProducts();
    // Cập nhật thời gian hiện tại mỗi phút để đếm ngược chính xác
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval);
  }, []);

  const fetchDiscountedProducts = async () => {
    setLoading(true);
    try {
      console.log("PromotionalProducts: Fetching promotions...");

      // Lấy tất cả promotions từ endpoint summaries
      let allPromotions = [];
      try {
        allPromotions = await getPromotions();
      } catch (promoError) {
        if (promoError.response?.status === 403) {
          console.warn(
            "PromotionalProducts: Access denied to promotions API (403)."
          );
          setDiscountedProducts([]);
          setLoading(false);
          return;
        }
        throw promoError;
      }

      if (!allPromotions || allPromotions.length === 0) {
        console.log("PromotionalProducts: No promotions found");
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Phân loại promotions: đang diễn ra và sắp diễn ra
      const now = new Date();
      const active = [];
      const upcoming = [];

      allPromotions.forEach((promo) => {
        if (!promo.startDate || !promo.endDate) return;
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);

        if (now >= startDate && now <= endDate) {
          // Đang diễn ra
          active.push(promo);
        } else if (now < startDate) {
          // Sắp diễn ra
          upcoming.push(promo);
        }
      });

      // Sắp xếp upcoming theo startDate (sắp diễn ra nhất trước)
      upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      setActivePromotions(active);
      setUpcomingPromotions(upcoming);

      if (active.length === 0) {
        console.log("PromotionalProducts: No active promotions found");
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Thu thập tất cả product IDs từ các promotion active
      const allProductIds = new Set();
      const productPromotionMap = new Map();

      active.forEach((promo) => {
        if (promo.productIds && Array.isArray(promo.productIds)) {
          promo.productIds.forEach((productId) => {
            allProductIds.add(productId);
            // Nếu sản phẩm chưa có promotion hoặc promotion hiện tại có discount cao hơn
            if (
              !productPromotionMap.has(productId) ||
              parseFloat(promo.discount) >
                parseFloat(productPromotionMap.get(productId).discount)
            ) {
              productPromotionMap.set(productId, promo);
            }
          });
        }
      });

      if (allProductIds.size === 0) {
        console.log("PromotionalProducts: No products found in active promotions");
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Lấy tất cả sản phẩm (lấy nhiều để đảm bảo có đủ)
      const productsResponse = await getProducts({ page: 0, size: 1000 });
      const allProducts =
        productsResponse.content ||
        (Array.isArray(productsResponse) ? productsResponse : []);

      const productsWithDiscount = [];

      // Match products với promotions
      allProducts.forEach((product) => {
        const productId = product.id;
        if (allProductIds.has(productId)) {
          const promotion = productPromotionMap.get(productId);

          if (!promotion) return;

          // Tính giá sau giảm
          const originalPrice = parseFloat(
            product.currentPrice || product.price || 0
          );

          if (originalPrice <= 0) return;

          const discountPercent = parseFloat(promotion.discount || 0);
          const discountedPrice = Math.round(
            originalPrice * (1 - discountPercent / 100)
          );

          const discountPercentage = Math.round(discountPercent);

          productsWithDiscount.push({
            ...product,
            originalPrice,
            discountedPrice,
            discountPercent: discountPercentage,
            promotion: promotion,
            promotionId: promotion.id,
          });
        }
      });

      // Sắp xếp theo phần trăm giảm giảm dần
      const sortedProducts = productsWithDiscount.sort(
        (a, b) => b.discountPercent - a.discountPercent
      );

      console.log(
        `PromotionalProducts: Found ${sortedProducts.length} products with discounts`
      );
      setDiscountedProducts(sortedProducts);
    } catch (error) {
      console.error("PromotionalProducts: Error fetching discounted products:", error);
      toast.error("Không thể tải sản phẩm khuyến mãi");
      setDiscountedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();
  
    // Fetch full product data vì wishlist product không đủ thông tin
    const full = await getProductById(product.id);
    if (!full) {
      toast.error("Không lấy được thông tin sản phẩm 😢");
      return;
    }
  
    // Guest cart
    if (!token || !user?.id) {
      addToGuestCart(full, 1);
      toast.success("Đã thêm vào giỏ hàng (Khách) 🛒");
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }
  
    const maxStock = Number.isFinite(full.stockQuantity)
      ? full.stockQuantity
      : Number.isFinite(full.stock)
      ? full.stock
      : Infinity;
  
    if (maxStock <= 0) {
      toast.error("Sản phẩm hết hàng");
      return;
    }
  
    try {
      const cart = await getCart(user.id);
      const existing = (cart.items || []).find(
        (i) => i.productId === full.id || i.id === full.id
      );
  
      const currentQty = existing ? existing.quantity : 0;
  
      if (currentQty + 1 > maxStock) {
        toast.error("Không thể thêm vượt quá tồn kho");
        return;
      }
  
      await addToCart(user.id, full.id, 1);
      toast.success("Đã thêm vào giỏ hàng ✅");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm khuyến mãi", isCurrent: true },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-primary text-brand-primary-foreground px-4 py-2 rounded-full mb-4">
            <Tag className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Ưu đãi đặc biệt
            </span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            Chương Trình Khuyến Mãi
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {loading
              ? "Đang tải..."
              : "Khám phá các chương trình khuyến mãi hấp dẫn và sản phẩm đang được giảm giá"}
          </p>
        </div>

        {/* Promotions Section */}
        {!loading && (
          <>
            {/* Active Promotions */}
            {activePromotions.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-8 bg-brand-primary rounded-full"></div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Đang Diễn Ra
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {activePromotions.length} chương trình
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {activePromotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-brand-primary"
                    >
                      <div className="p-6">
                        {/* Promotion Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {promo.name || "Chương trình khuyến mãi"}
                            </h3>
                            {promo.description && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {promo.description}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 bg-brand-primary text-brand-primary-foreground px-3 py-1 rounded-lg font-bold text-lg">
                            -{Math.round(parseFloat(promo.discount || 0))}%
                          </div>
                        </div>

                        {/* Promotion Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(promo.startDate).toLocaleDateString("vi-VN")} -{" "}
                              {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          {promo.productIds && Array.isArray(promo.productIds) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Package className="w-4 h-4" />
                              <span>{promo.productIds.length} sản phẩm</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                            <Clock className="w-4 h-4" />
                            <span>Đang diễn ra</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Promotions */}
            {upcomingPromotions.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Sắp Diễn Ra
                  </h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                    {upcomingPromotions.length} chương trình
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {upcomingPromotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-orange-300"
                    >
                      <div className="p-6">
                        {/* Promotion Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {promo.name || "Chương trình khuyến mãi"}
                            </h3>
                            {promo.description && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {promo.description}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-lg">
                            -{Math.round(parseFloat(promo.discount || 0))}%
                          </div>
                        </div>

                        {/* Promotion Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Bắt đầu: {new Date(promo.startDate).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Kết thúc: {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          {promo.productIds && Array.isArray(promo.productIds) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Package className="w-4 h-4" />
                              <span>{promo.productIds.length} sản phẩm</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
                            <Clock className="w-4 h-4" />
                            <span>
                              {(() => {
                                const daysLeft = Math.ceil(
                                  (new Date(promo.startDate) - new Date()) / (1000 * 60 * 60 * 24)
                                );
                                return daysLeft > 0
                                  ? `Còn ${daysLeft} ngày`
                                  : "Sắp bắt đầu";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Products Section */}
            {discountedProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-8 bg-brand-primary rounded-full"></div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Sản Phẩm Đang Giảm Giá
                  </h2>
                  <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-semibold">
                    {discountedProducts.length} sản phẩm
                  </span>
                </div>
              </section>
            )}
          </>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
          </div>
        ) : discountedProducts.length === 0 && activePromotions.length === 0 && upcomingPromotions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <div className="text-gray-400 mb-4">
              <Tag size={64} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              Không có chương trình khuyến mãi nào
            </p>
            <p className="text-gray-400 text-sm">
              Vui lòng quay lại sau để xem các ưu đãi mới
            </p>
          </div>
        ) : discountedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {discountedProducts.map((product) => (
              <div key={product.id} className="relative">
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-20 bg-brand-primary text-brand-primary-foreground px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                  -{product.discountPercent}%
                </div>

                {/* Product Card */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  {/* Image Container */}
                  <div
                    className="relative w-full h-56 lg:h-64 overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img
                      src={
                        product.imageUrl ||
                        product.primaryImageUrl ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 lg:p-5">
                    {/* Brand Name */}
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {typeof product.brand === "string"
                        ? product.brand
                        : product.brand?.name || "CHRONOS"}
                    </p>

                    {/* Product Name */}
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 mb-3 min-h-12">
                      {product.name}
                    </h3>

                    {/* Price */}
                    {product.originalPrice > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-gray-900 font-bold text-lg lg:text-xl">
                            {product.discountedPrice.toLocaleString("vi-VN")}₫
                          </p>
                          <p className="text-gray-400 line-through text-sm">
                            {product.originalPrice.toLocaleString("vi-VN")}₫
                          </p>
                        </div>
                        <p className="text-xs text-brand-primary font-medium mt-1">
                          Tiết kiệm{" "}
                          {(
                            product.originalPrice - product.discountedPrice
                          ).toLocaleString("vi-VN")}
                          ₫
                        </p>
                      </div>
                    )}

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

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="mt-auto w-full bg-gradient-to-r from-brand-primary to-orange-600 text-brand-primary-foreground rounded-lg py-2.5 hover:from-red-700 hover:to-orange-700 transition-all duration-300 font-medium text-sm lg:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

