import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "@/api/productAPI";
import { addToCart, getCart } from "@/api/cartAPI";
import {
  getReviewsByProduct,
  getReviewByUserAndProduct,
  updateReview,
  createReview,
} from "@/api/reviewAPI";
import { getOrdersByUserId } from "@/api/orderAPI";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/api/wishlistAPI";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { parseStoredUser } from "@/utils/storage";
import Header from "@/components/Header";
import { addToGuestCart } from "@/api/guestCart.js";


import Footer from "@/components/Footer";
import {
  ShoppingCart,
  Star,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
  Home,
  RotateCcw,
  Info,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const user = parseStoredUser();

  useEffect(() => {
    // Scroll to top when page opens
    window.scrollTo(0, 0);
    
    fetchProductDetail();
    fetchReviews();
    checkIfCanReview();
    setIsFavorite(isInWishlist(id));
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await getProductById(id);
      setProduct(res);
      // Set ảnh chính hoặc ảnh đầu tiên từ productImages hoặc imageUrl
      if (res?.productImages?.length > 0) {
        const primary = res.productImages.find((img) => img.isPrimary);
        setSelectedImage(primary || res.productImages[0]);
      } else if (res?.imageUrl) {
        // Nếu không có productImages, dùng imageUrl
        setSelectedImage({ imageUrl: res.imageUrl, isPrimary: true });
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await getReviewsByProduct(id);
      setReviews(Array.isArray(data) ? data : []);

      // Kiểm tra xem user đã đánh giá chưa
      if (user?.id) {
        const userReview = await getReviewByUserAndProduct(user.id, id);
        if (userReview) {
          setExistingReview(userReview);
          // Kiểm tra xem có thể chỉnh sửa không (trong vòng 30 ngày)
          const reviewDate = new Date(userReview.createdAt);
          const daysSinceReview =
            (new Date() - reviewDate) / (1000 * 60 * 60 * 24);
          setIsEditingReview(daysSinceReview <= 30);
        } else {
          setExistingReview(null);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkIfCanReview = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user?.id) {
      console.log("❌ Không có token hoặc user ID");
      setCanReview(false);
      return;
    }

    try {
      const orders = await getOrdersByUserId(user.id);
      console.log("📦 Tất cả đơn hàng:", orders);
      console.log("🎯 Product ID cần kiểm tra:", id);

      // Kiểm tra xem user có đơn hàng COMPLETED chứa sản phẩm này không
      // Backend trả về OrderResponse với field 'items' (không phải 'orderItems')
      const hasPurchased = orders.some((order) => {
        const isCompleted = order.status === "COMPLETED";
        const hasItems = order.items && order.items.length > 0;

        console.log(`📋 Đơn hàng #${order.id}:`, {
          status: order.status,
          isCompleted,
          hasItems,
          itemCount: order.items?.length || 0,
        });

        if (isCompleted && hasItems) {
          const hasProduct = order.items.some((item) => {
            // OrderItemResponse có productId trực tiếp
            const productId = item.productId;
            const matches = productId === parseInt(id);
            console.log(`  🔍 Item:`, {
              productId,
              productName: item.productName,
              targetId: parseInt(id),
              matches,
            });
            return matches;
          });
          return hasProduct;
        }
        return false;
      });

      console.log("✅ Có thể đánh giá:", hasPurchased);
      setCanReview(hasPurchased);
    } catch (err) {
      console.error("❌ Lỗi khi kiểm tra quyền đánh giá:", err);
      setCanReview(false);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      const success = removeFromWishlist(parseInt(id));
      if (success) {
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } else {
      const success = addToWishlist(product);
      if (success) {
        setIsFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích ❤️");
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        toast.info("Sản phẩm đã có trong danh sách yêu thích");
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token || !user?.id) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    try {
      // ReviewRequest format: { comment, rating, user: { id }, product: { id } }
      const reviewData = {
        comment: reviewComment.trim(),
        rating: reviewRating,
        user: {
          id: user.id,
        },
        product: {
          id: parseInt(id),
        },
      };

      if (existingReview && isEditingReview) {
        // Cập nhật review hiện tại
        await updateReview(existingReview.id, reviewData);
        toast.success("Đã cập nhật đánh giá của bạn!");
      } else {
        // Tạo review mới
        await createReview(reviewData);
        toast.success("Đánh giá của bạn đã được gửi thành công!");
      }

      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
      setExistingReview(null);
      setIsEditingReview(false);
      fetchReviews();
      checkIfCanReview(); // Refresh lại trạng thái canReview
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể gửi đánh giá. Vui lòng thử lại!"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
  
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();
  
    // 🚨 FIX: Nếu chưa login → lưu vào guest cart
    if (!token || !user?.id) {
      // guest cart flow
      addToGuestCart(product, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng (khách) 🛒`);
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }
  
    // Nếu đăng nhập → xử lý như cũ
    const maxStock = Number.isFinite(product?.stockQuantity)
      ? product.stockQuantity
      : Number.isFinite(product?.stock)
      ? product.stock
      : Infinity;
  
    if (maxStock <= 0) {
      toast.error("Sản phẩm hết hàng");
      return;
    }
  
    setAddingToCart(true);
    try {
      const cart = await getCart(user.id);
      const existingItem = (cart.items || []).find(
        (i) => i.productId === product.id || i.id === product.id
      );
      const currentQty = existingItem ? existingItem.quantity : 0;
  
      if (currentQty + quantity > maxStock) {
        toast.error(`Không thể thêm vượt quá tồn kho. Còn lại ${maxStock - currentQty} sản phẩm`);
        return;
      }
  
      await addToCart(user.id, product.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    } finally {
      setAddingToCart(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stockQuantity || 999)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="size-4 fill-yellow-200 text-yellow-400" />
      );
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="size-4 text-gray-300" />);
    }
    return stars;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If already full URL (http/https) or data URI, use as is
    if (imageUrl.startsWith("http") || imageUrl.startsWith("data:"))
      return imageUrl;
    // If relative path, prepend with /images/products/ (from public folder)
    return `/images/products/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Breadcrumb items={[]} />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Breadcrumb items={[]} />
        <Footer />
      </div>
    );
  }

  const displayImage = selectedImage
    ? getImageUrl(selectedImage.imageUrl)
    : product.imageUrl
    ? getImageUrl(product.imageUrl)
    : null;

  // Category cho breadcrumb (nếu có)
  const breadcrumbItems = (() => {
    if (!product) return [];
    const items = [{ label: "Sản phẩm", href: "/products" }];
    if (product.categoryName) {
      items.push({
        label: product.categoryName,
        href: `/products?category=${product.categoryId}`,
      });
    }
    if (product.brand) {
      items.push({
        label: product.brand,
        href: `/products?brand=${product.brand}`,
      });
    }
    items.push({ label: product.name, isCurrent: true });
    return items;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Product Image */}
            <div className="lg:col-span-2 space-y-4">
              {/* Main Image with Zoom */}
              <div
                className="bg-white rounded-2xl shadow-lg p-8 aspect-square flex items-center justify-center overflow-hidden relative cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={
                      isZoomed
                        ? {
                            transform: "scale(2)",
                            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                          }
                        : {}
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package className="size-20 mb-4" />
                    <p className="text-sm">Không có hình ảnh</p>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {(() => {
                // If only 1 image, duplicate it to show 3 times
                let imagesToDisplay = product.productImages || [];
                
                if (imagesToDisplay.length === 1) {
                  const singleImage = imagesToDisplay[0];
                  imagesToDisplay = [
                    { ...singleImage, id: `${singleImage.id}-1`, displayId: singleImage.id },
                    { ...singleImage, id: `${singleImage.id}-2`, displayId: singleImage.id, isPrimary: false },
                    { ...singleImage, id: `${singleImage.id}-3`, displayId: singleImage.id, isPrimary: false }
                  ];
                }
                
                return imagesToDisplay.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {imagesToDisplay.map((img, index) => {
                      const thumbUrl = getImageUrl(img.imageUrl);
                      return (
                        <div
                          key={`${img.id}-${index}`}
                          onClick={() => setSelectedImage(img)}
                          className={`relative bg-white rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
                            selectedImage?.id === img.id || selectedImage?.displayId === img.displayId
                              ? "ring-2 ring-brand-primary/50 shadow-md"
                              : "ring-1 ring-gray-200"
                          }`}
                        >
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="size-8" />
                            </div>
                          )}
                          {img.isPrimary && (
                            <Badge className="absolute -top-2 -right-2 text-xs bg-brand-primary">
                              Chính
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              })()}

              {/* Product Description */}
              {product.description && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="size-5" />
                      Mô tả sản phẩm
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Specifications */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin sản phẩm
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">ID Sản phẩm:</span>
                      <span className="font-medium">#{product.id}</span>
                    </div>
                    {product.brand && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">Thương hiệu:</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.categoryName && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">Danh mục:</span>
                        <span className="font-medium">
                          {product.categoryName}
                        </span>
                      </div>
                    )}
                    {product.supplierName && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">Nhà cung cấp:</span>
                        <span className="font-medium">
                          {product.supplierName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Tình trạng:</span>
                      <Badge
                        className={
                          product.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }
                      >
                        {product.status === "ACTIVE" ? "Còn hàng" : "Hết hàng"}
                      </Badge>
                    </div>
                    {product.stockQuantity !== undefined && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">Số lượng kho:</span>
                        <span className="font-medium">
                          {product.stockQuantity}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thông số kỹ thuật
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {product.productSpecs &&
                      product.productSpecs.length > 0 &&
                      product.productSpecs.map((spec) => (
                        <div
                          key={spec.id || spec.keyName}
                          className="flex justify-between py-3 border-b"
                        >
                          <span className="text-gray-600">{spec.keyName}:</span>
                          <span className="font-medium">{spec.value}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="size-5 text-yellow-500 fill-yellow-500" />
                    Đánh giá sản phẩm
                    {reviews.length > 0 && (
                      <span className="text-sm font-normal text-gray-500">
                        ({reviews.length} đánh giá)
                      </span>
                    )}
                  </h3>

                  {/* Review Form for customers who purchased */}
                  {canReview && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      {!showReviewForm ? (
                        <div className="space-y-2">
                          {existingReview && isEditingReview ? (
                            <Button
                              onClick={() => {
                                setReviewRating(existingReview.rating);
                                setReviewComment(existingReview.comment || "");
                                setShowReviewForm(true);
                              }}
                              className="w-full bg-brand-primary hover:bg-brand-primary-soft"
                            >
                              <Star className="size-4 mr-2" />
                              Chỉnh sửa đánh giá
                            </Button>
                          ) : existingReview ? (
                            <div className="text-sm text-gray-600 text-center py-2">
                              Bạn đã đánh giá sản phẩm này. Chỉ có thể chỉnh sửa
                              trong vòng 30 ngày.
                            </div>
                          ) : (
                            <Button
                              onClick={() => setShowReviewForm(true)}
                              className="w-full bg-brand-primary hover:bg-brand-primary-soft"
                            >
                              <Star className="size-4 mr-2" />
                              Viết đánh giá
                            </Button>
                          )}
                        </div>
                      ) : (
                        <form
                          onSubmit={handleSubmitReview}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Đánh giá của bạn *
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`size-8 ${
                                      star <= reviewRating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nhận xét
                            </label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={submittingReview}
                              className="flex-1 bg-brand-primary hover:bg-brand-primary-soft"
                            >
                              {submittingReview
                                ? existingReview
                                  ? "Đang cập nhật..."
                                  : "Đang gửi..."
                                : existingReview
                                ? "Cập nhật đánh giá"
                                : "Gửi đánh giá"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowReviewForm(false);
                                setReviewComment("");
                                setReviewRating(5);
                              }}
                            >
                              Hủy
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {loadingReviews ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">
                        Đang tải đánh giá...
                      </p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="size-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        Chưa có đánh giá nào cho sản phẩm này
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Hãy là người đầu tiên đánh giá!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">
                                  {review.userFullName ||
                                    review.username ||
                                    "Khách hàng"}
                                </p>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">
                                {review.createdAt
                                  ? new Date(
                                      review.createdAt
                                    ).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Purchase Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  {/* Product Name */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    {product.brand && (
                      <p className="text-sm text-gray-500 uppercase tracking-wide">
                        {product.brand}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-2 pb-4 border-b">
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {product.rating.toFixed(1)}
                      </span>
                      {product.numOfRating && (
                        <span className="text-sm text-gray-500">
                          ({product.numOfRating} đánh giá)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="pb-4 border-b">
                    <p className="text-3xl font-bold text-brand-primary">
                      {product.price
                        ? `${Number(product.price).toLocaleString("vi-VN")}₫`
                        : "Liên hệ"}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Số lượng:
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={decreaseQuantity}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors"
                          disabled={quantity <= 1}
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="px-6 py-2 font-semibold border-x border-gray-300">
                          {quantity}
                        </span>
                        <button
                          onClick={increaseQuantity}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors"
                          disabled={quantity >= (product.stockQuantity || 999)}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      {product.stockQuantity && (
                        <span className="text-sm text-gray-500">
                          {product.stockQuantity} sản phẩm có sẵn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={
                        addingToCart || product.status !== "ACTIVE" || (Number.isFinite(product?.stockQuantity) ? product.stockQuantity <= 0 : product.stock <= 0)
                      }
                      className="cursor-pointer w-full bg-brand-primary hover:bg-brand-primary-soft text-white py-6 text-base font-semibold"
                    >
                      {addingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang thêm...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="size-5 mr-2" />
                          Thêm vào giỏ hàng
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleToggleFavorite}
                      variant="outline"
                      className={`w-full py-6 ${
                        isFavorite
                          ? "border-red-500 text-red-500 hover:bg-red-50"
                          : ""
                      }`}
                    >
                      <Heart
                        className={`size-5 mr-2 ${
                          isFavorite ? "fill-red-500" : ""
                        }`}
                      />
                      {isFavorite ? "Đã yêu thích" : "Yêu thích"}
                    </Button>
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="size-5 text-brand-primary" />
                      <span className="text-gray-700">
                        Miễn phí vận chuyển cho đơn hàng trên 500.000₫
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="size-5 text-brand-primary" />
                      <span className="text-gray-700">
                        Bảo hành chính hãng 12 tháng
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <RotateCcw className="size-5 text-brand-primary" />
                      <span className="text-gray-700">
                        Đổi trả trong 30 ngày
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
