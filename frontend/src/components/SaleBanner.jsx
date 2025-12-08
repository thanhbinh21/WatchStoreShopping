import React, { useEffect, useState } from "react";
import { getPromotions } from "@/api/promotionAPI";
import { getProducts } from "@/api/productAPI";
import { Loader2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SaleBanner({ onAddToCart }) {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  const fetchDiscountedProducts = async () => {
    setLoading(true);
    try {
      // Lấy tất cả promotions từ endpoint summaries (public endpoint)
      let allPromotions = [];
      try {
        allPromotions = await getPromotions();
      } catch (promoError) {
        if (promoError.response?.status === 403) {
          console.warn("SaleBanner: Access denied (403). Hidden.");
          setDiscountedProducts([]);
          setLoading(false);
          return;
        }
        throw promoError;
      }

      if (!allPromotions || allPromotions.length === 0) {
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Lọc các promotion đang active
      const now = new Date();
      const activePromotions = allPromotions.filter((promo) => {
        if (!promo.startDate || !promo.endDate) return false;
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        return now >= startDate && now <= endDate;
      });

      if (activePromotions.length === 0) {
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Thu thập product IDs
      const allProductIds = new Set();
      const productPromotionMap = new Map();

      activePromotions.forEach((promo) => {
        if (promo.productIds && Array.isArray(promo.productIds)) {
          promo.productIds.forEach((productId) => {
            allProductIds.add(productId);
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
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Lấy products
      const productsResponse = await getProducts({ page: 0, size: 100 });
      const allProducts =
        productsResponse.content ||
        (Array.isArray(productsResponse) ? productsResponse : []);

      const productsWithDiscount = [];

      allProducts.forEach((product) => {
        const productId = product.id;
        if (allProductIds.has(productId)) {
          const promotion = productPromotionMap.get(productId);
          if (!promotion) return;

          const originalPrice = parseFloat(
            product.currentPrice || product.price || 0
          );

          if (originalPrice <= 0) return;

          const discountPercent = parseFloat(promotion.discount || 0);
          const discountedPrice = Math.round(
            originalPrice * (1 - discountPercent / 100)
          );

          productsWithDiscount.push({
            ...product,
            originalPrice,
            discountedPrice,
            discountPercent: Math.round(discountPercent),
            promotion: promotion,
            promotionId: promotion.id,
          });
        }
      });

      // Sort & Limit
      const sortedProducts = productsWithDiscount
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, 8); // Lấy 8 sản phẩm (chia hết cho 2 và 4 để đẹp grid)

      setDiscountedProducts(sortedProducts);
    } catch (error) {
      console.error("SaleBanner error:", error);
      setDiscountedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-linear-to-br from-red-50 to-orange-50">
        <div className="container mx-auto px-4 flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      </section>
    );
  }

  if (!discountedProducts || discountedProducts.length === 0) return null;

  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/300x300?text=No+Image";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `/images/products/${url}`;
  };

  return (
    <section className="py-10 md:py-16 bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background decoration - Adjusted sizes for mobile */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-primary text-brand-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-3 md:mb-4 shadow-sm">
            <Tag className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wide">
              Ưu đãi đặc biệt
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-3">
            Sản Phẩm Giảm Giá
          </h2>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
            Cơ hội sở hữu đồng hồ cao cấp với mức giá ưu đãi lên đến{" "}
            <span className="font-bold text-brand-primary text-base md:text-xl">
              {Math.max(...discountedProducts.map((p) => p.discountPercent))}%
            </span>
          </p>
        </div>

        {/* Products Grid: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {discountedProducts.map((product) => (
            <div key={product.id} className="group relative h-full">
              {/* Product Card */}
              <div
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-20 bg-red-600 text-white px-2.5 py-1 rounded-md font-bold text-xs md:text-sm shadow-md">
                  -{product.discountPercent}%
                </div>

                {/* Image Container */}
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={getImageUrl(
                      product.imageUrl || product.primaryImageUrl
                    )}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/300x300?text=No+Image";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4">
                  {/* Brand */}
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">
                    {typeof product.brand === "string"
                      ? product.brand
                      : product.brand?.name || "CHRONOS"}
                  </p>

                  {/* Name */}
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 mb-2 min-h-10 hover:text-brand-primary transition-colors">
                    {product.name}
                  </h3>

                  {/* Price Section */}
                  {product.originalPrice > 0 && (
                    <div className="mt-auto mb-3">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-red-600 font-bold text-base md:text-lg">
                          {product.discountedPrice.toLocaleString("vi-VN")}₫
                        </span>
                        <span className="text-gray-400 line-through text-xs md:text-sm">
                          {product.originalPrice.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rating (Hidden on very small screens to save space) */}
                  {/* {product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs font-medium text-gray-600">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({product.numOfRating || 0})
                      </span>
                    </div>
                  )} */}

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) onAddToCart(product);
                    }}
                    className="w-full bg-brand-primary text-white rounded-lg py-2.5 hover:bg-brand-primary-dark active:scale-95 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 md:mt-12">
          <button
            onClick={() => navigate("/promotional-products")}
            className="w-full sm:w-auto px-8 py-3 bg-white text-brand-primary border-2 border-brand-primary rounded-lg font-semibold hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95 text-sm md:text-base"
          >
            Xem tất cả khuyến mãi
          </button>
        </div>
      </div>
    </section>
  );
}
