import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "@/api/productAPI";
import { addToCart } from "@/api/cartAPI";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ShoppingCart,
  Star,
  StarHalf,
  Package,
  Tag,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await getProductById(id);
      setProduct(res);
      if (res?.productImages?.length > 0) {
        const primary = res.productImages.find((img) => img.isPrimary);
        setSelectedImage(primary || res.productImages[0]);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(user.id, product.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng ✅`);
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

  const renderStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="size-5 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="size-5 fill-yellow-400 text-yellow-400" />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="size-5 text-gray-300" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="size-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="size-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg p-6 aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={
                  selectedImage
                    ? `/images/products/${selectedImage.imageUrl}`
                    : product.primaryImageUrl || "https://via.placeholder.com/500"
                }
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            {product.productImages && product.productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.productImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`relative bg-white rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedImage?.id === img.id
                        ? "ring-2 ring-red-600 shadow-md"
                        : "ring-1 ring-gray-200"
                    }`}
                  >
                    <img
                      src={`/images/products/${img.imageUrl}`}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {img.isPrimary && (
                      <Badge className="absolute -top-2 -right-2 text-xs">
                        Chính
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Product Name & Status */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600">
                  <Heart className="size-6" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant={product.status === "ACTIVE" ? "default" : "secondary"}
                  className="text-sm"
                >
                  {product.status === "ACTIVE" ? "Còn hàng" : "Hết hàng"}
                </Badge>
                {product.category && (
                  <Badge variant="outline" className="text-sm">
                    <Tag className="size-3 mr-1" />
                    {product.category.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">{renderStars(4.5)}</div>
              <span className="text-lg font-semibold text-gray-900">4.5</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">128 đánh giá</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">256 đã bán</span>
            </div>

            {/* Price */}
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-red-600">
                    {product.currentPrice?.toLocaleString("vi-VN")}₫
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.currentPrice && (
                      <>
                        <span className="text-xl text-gray-400 line-through">
                          {product.originalPrice?.toLocaleString("vi-VN")}₫
                        </span>
                        <Badge variant="destructive" className="text-sm">
                          -
                          {Math.round(
                            ((product.originalPrice - product.currentPrice) /
                              product.originalPrice) *
                              100
                          )}
                          %
                        </Badge>
                      </>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Brand & Supplier */}
            <div className="grid grid-cols-2 gap-4">
              {product.brand && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Package className="size-4" />
                      <span className="text-sm">Thương hiệu</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {product.brand.name}
                    </p>
                  </CardContent>
                </Card>
              )}
              {product.supplier && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Truck className="size-4" />
                      <span className="text-sm">Nhà cung cấp</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {product.supplier.name}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Số lượng
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-12 w-12 rounded-none hover:bg-gray-100"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(
                        Math.max(1, Math.min(val, product.stockQuantity || 999))
                      );
                    }}
                    className="w-16 h-12 text-center font-semibold text-lg border-none focus:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={increaseQuantity}
                    disabled={quantity >= (product.stockQuantity || 999)}
                    className="h-12 w-12 rounded-none hover:bg-gray-100"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <span className="text-gray-600">
                  {product.stockQuantity
                    ? `${product.stockQuantity} sản phẩm có sẵn`
                    : "Còn hàng"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || product.status !== "ACTIVE"}
                className="flex-1 h-14 text-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingCart className="size-5 mr-2" />
                {addingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
              </Button>
              <Button
                variant="outline"
                className="h-14 px-8 text-lg font-semibold border-2 border-red-600 text-red-600 hover:bg-red-50"
              >
                Mua ngay
              </Button>
            </div>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Shield className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Bảo hành chính hãng
                      </p>
                      <p className="text-xs text-gray-600">12 tháng</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Truck className="size-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Miễn phí vận chuyển
                      </p>
                      <p className="text-xs text-gray-600">Đơn từ 500k</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Mô tả sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description ||
                    "Sản phẩm chất lượng cao, được nhập khẩu chính hãng. Đảm bảo nguồn gốc xuất xứ rõ ràng và có đầy đủ giấy tờ chứng nhận."}
                </p>

                {/* Specifications */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-4">Thông số kỹ thuật</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">ID Sản phẩm:</span>
                      <span className="font-medium">#{product.id}</span>
                    </div>
                    {product.brand && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Thương hiệu:</span>
                        <span className="font-medium">{product.brand.name}</span>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Danh mục:</span>
                        <span className="font-medium">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Tình trạng:</span>
                      <span className="font-medium">
                        {product.status === "ACTIVE" ? "Còn hàng" : "Hết hàng"}
                      </span>
                    </div>
                    {product.stockQuantity && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Số lượng kho:</span>
                        <span className="font-medium">{product.stockQuantity}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-medium">
                        {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Đánh giá sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Rating Summary */}
                <div className="flex items-center gap-8 pb-6 border-b mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      4.5
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(4.5)}
                    </div>
                    <p className="text-sm text-gray-600">128 đánh giá</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-sm">{star}</span>
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {star === 5 ? 90 : star === 4 ? 26 : star === 3 ? 6 : star === 2 ? 4 : 2}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {[
                    {
                      name: "Nguyễn Văn A",
                      rating: 5,
                      date: "15/11/2025",
                      comment:
                        "Sản phẩm rất tốt, đúng như mô tả. Giao hàng nhanh chóng.",
                    },
                    {
                      name: "Trần Thị B",
                      rating: 4,
                      date: "12/11/2025",
                      comment:
                        "Chất lượng ổn, giá cả hợp lý. Sẽ ủng hộ shop tiếp.",
                    },
                    {
                      name: "Lê Văn C",
                      rating: 5,
                      date: "10/11/2025",
                      comment:
                        "Đóng gói cẩn thận, sản phẩm đẹp. Rất hài lòng!",
                    },
                  ].map((review, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.name}
                            </p>
                            <p className="text-xs text-gray-500">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700 ml-13">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-6">
                  Xem tất cả đánh giá
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Seller Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin người bán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.supplier && (
                  <>
                    <div className="text-center pb-4 border-b">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                        {product.supplier.name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {product.supplier.name}
                      </h3>
                      {product.supplier.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {product.supplier.address}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Đánh giá:</span>
                        <span className="font-semibold text-green-600">
                          98% tích cực
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Sản phẩm:</span>
                        <span className="font-semibold">1.2k+</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Phản hồi:</span>
                        <span className="font-semibold text-green-600">
                          Trong vài giờ
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Tham gia:</span>
                        <span className="font-semibold">2 năm trước</span>
                      </div>
                    </div>
                    {product.supplier.contactInfo && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">Liên hệ:</p>
                        <p className="text-sm font-medium">
                          {product.supplier.contactInfo}
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full">
                      Xem shop
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
