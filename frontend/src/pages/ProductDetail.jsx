import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "@/api/productAPI";
import { addToCart } from "@/api/cartAPI";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { parseStoredUser } from "@/utils/storage";
import Header from "@/components/Header";
import Navbar from "@/components/Breadcrumb";
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
        const token = localStorage.getItem("accessToken");
        const user = parseStoredUser();

        if (!token || !user?.id) {
            toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
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

    const renderStars = (rating) => {
        if (!rating) return null;
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star
                    key={i}
                    className="size-4 fill-yellow-400 text-yellow-400"
                />
            );
        }
        if (hasHalfStar) {
            stars.push(
                <Star
                    key="half"
                    className="size-4 fill-yellow-200 text-yellow-400"
                />
            );
        }
        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} className="size-4 text-gray-300" />
            );
        }
        return stars;
    };

    // SVG placeholder
    const svgPlaceholder =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return svgPlaceholder;
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
                <Breadcrumb selectedCategory={null} />
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Đang tải sản phẩm...
                        </p>
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
                <Navbar selectedCategory={null} />
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <Package className="size-20 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Không tìm thấy sản phẩm
                        </h2>
                        <div className="flex gap-4 justify-center mt-6">
                            <Button
                                onClick={() => navigate("/home")}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Home className="size-4 mr-2" />
                                Về trang chủ
                            </Button>
                            <Button
                                onClick={() => navigate(-1)}
                                variant="outline"
                            >
                                <ArrowLeft className="size-4 mr-2" />
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </div>
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
    const categoryForNav = product.categoryName
        ? {
              id: product.categoryId,
              name: product.categoryName,
          }
        : null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <Navbar selectedCategory={categoryForNav} />

            <div className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Back Button */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="hover:bg-gray-100"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Quay lại
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/home")}
                            className="hover:bg-gray-100"
                        >
                            <Home className="size-4 mr-2" />
                            Trang chủ
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Product Image */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Main Image */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 aspect-square flex items-center justify-center">
                                <img
                                    src={displayImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = svgPlaceholder;
                                    }}
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {product.productImages &&
                                product.productImages.length > 1 && (
                                    <div className="grid grid-cols-4 gap-4">
                                        {product.productImages.map((img) => (
                                            <div
                                                key={img.id}
                                                onClick={() =>
                                                    setSelectedImage(img)
                                                }
                                                className={`relative bg-white rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
                                                    selectedImage?.id === img.id
                                                        ? "ring-2 ring-blue-900 shadow-md"
                                                        : "ring-1 ring-gray-200"
                                                }`}
                                            >
                                                <img
                                                    src={getImageUrl(
                                                        img.imageUrl
                                                    )}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            svgPlaceholder;
                                                    }}
                                                />
                                                {img.isPrimary && (
                                                    <Badge className="absolute -top-2 -right-2 text-xs bg-blue-900">
                                                        Chính
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

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
                                        Thông số kỹ thuật
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex justify-between py-3 border-b">
                                            <span className="text-gray-600">
                                                ID Sản phẩm:
                                            </span>
                                            <span className="font-medium">
                                                #{product.id}
                                            </span>
                                        </div>
                                        {product.brand && (
                                            <div className="flex justify-between py-3 border-b">
                                                <span className="text-gray-600">
                                                    Thương hiệu:
                                                </span>
                                                <span className="font-medium">
                                                    {product.brand}
                                                </span>
                                            </div>
                                        )}
                                        {product.categoryName && (
                                            <div className="flex justify-between py-3 border-b">
                                                <span className="text-gray-600">
                                                    Danh mục:
                                                </span>
                                                <span className="font-medium">
                                                    {product.categoryName}
                                                </span>
                                            </div>
                                        )}
                                        {product.supplierName && (
                                            <div className="flex justify-between py-3 border-b">
                                                <span className="text-gray-600">
                                                    Nhà cung cấp:
                                                </span>
                                                <span className="font-medium">
                                                    {product.supplierName}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between py-3 border-b">
                                            <span className="text-gray-600">
                                                Tình trạng:
                                            </span>
                                            <Badge
                                                className={
                                                    product.status === "ACTIVE"
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                }
                                            >
                                                {product.status === "ACTIVE"
                                                    ? "Còn hàng"
                                                    : "Hết hàng"}
                                            </Badge>
                                        </div>
                                        {product.stockQuantity !==
                                            undefined && (
                                            <div className="flex justify-between py-3 border-b">
                                                <span className="text-gray-600">
                                                    Số lượng kho:
                                                </span>
                                                <span className="font-medium">
                                                    {product.stockQuantity}
                                                </span>
                                            </div>
                                        )}
                                    </div>
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
                                                    ({product.numOfRating} đánh
                                                    giá)
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div className="pb-4 border-b">
                                        <p className="text-3xl font-bold text-blue-900">
                                            {product.price
                                                ? `${Number(
                                                      product.price
                                                  ).toLocaleString("vi-VN")}₫`
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
                                                    disabled={
                                                        quantity >=
                                                        (product.stockQuantity ||
                                                            999)
                                                    }
                                                >
                                                    <Plus className="size-4" />
                                                </button>
                                            </div>
                                            {product.stockQuantity && (
                                                <span className="text-sm text-gray-500">
                                                    {product.stockQuantity} sản
                                                    phẩm có sẵn
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-4">
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={
                                                addingToCart ||
                                                product.status !== "ACTIVE"
                                            }
                                            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-6 text-base font-semibold"
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
                                            variant="outline"
                                            className="w-full py-6"
                                        >
                                            <Heart className="size-5 mr-2" />
                                            Yêu thích
                                        </Button>
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Truck className="size-5 text-blue-900" />
                                            <span className="text-gray-700">
                                                Miễn phí vận chuyển cho đơn hàng
                                                trên 500.000₫
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Shield className="size-5 text-blue-900" />
                                            <span className="text-gray-700">
                                                Bảo hành chính hãng 12 tháng
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <RotateCcw className="size-5 text-blue-900" />
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
