import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrdersByUserId, cancelOrder } from "../api/orderAPI";
import { getReviewByUserAndProduct } from "../api/reviewAPI";
import { addToCart, getCart } from "../api/cartAPI";
import { getProductById } from "../api/productAPI";
import { parseStoredUser } from "@/utils/storage";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Star,
  ShoppingCart,
  RotateCcw,
  X,
  User,
  MapPin,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

const orderStatusLabels = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800",
    Icon: Clock,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "bg-blue-100 text-blue-800",
    Icon: CreditCard,
  },
  SHIPPED: {
    label: "Đang giao hàng",
    color: "bg-purple-100 text-purple-800",
    Icon: Truck,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-800",
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800",
    Icon: XCircle,
  },
};

const paymentMethodLabels = {
  CASH: "Tiền mặt khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  CREDIT_CARD: "Thẻ tín dụng",
  DEBIT_CARD: "Thẻ ghi nợ",
  MOMO: "Ví MoMo",
  ZALOPAY: "ZaloPay",
  VNPAY: "VNPay",
  SHOPEEPAY: "ShopeePay",
};

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [productReviews, setProductReviews] = useState({});

  const { orderId } = location.state || {};

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem("accessToken");
      const user = parseStoredUser();
      
      if (!token || !user?.id) {
        console.log("Không có token hoặc user ID, redirect đến login");
        toast.error("Vui lòng đăng nhập");
        navigate("/login");
        return;
      }

      const orderList = await getOrdersByUserId(user.id);

      if (Array.isArray(orderList)) {
        setOrders(orderList);
        // Load reviews cho các sản phẩm trong đơn hàng COMPLETED
        await loadReviewsForOrders(orderList, user.id);
      } else if (orderList) {
        setOrders([orderList]);
        await loadReviewsForOrders([orderList], user.id);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      
      // Nếu lỗi là 401 (Unauthorized), redirect về login
      if (error.response?.status === 401) {
        console.log("Token không hợp lệ, redirect đến login");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }
      
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Có lỗi xảy ra khi tải đơn hàng";
      toast.error(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewsForOrders = async (orderList, userId) => {
    const reviews = {};
    for (const order of orderList) {
      if (order.status === "COMPLETED" && order.items) {
        for (const item of order.items) {
          if (item.productId) {
            const review = await getReviewByUserAndProduct(
              userId,
              item.productId
            );
            if (review) {
              reviews[item.productId] = review;
            }
          }
        }
      }
    }
    setProductReviews(reviews);
  };

  const handleReorder = async (order) => {
    try {
      const user = parseStoredUser();
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập");
        navigate("/login");
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const failedProducts = [];

      // Hiển thị loading toast
      const loadingToast = toast.loading("Đang thêm sản phẩm vào giỏ hàng...");

      // Thêm tất cả sản phẩm vào giỏ hàng (tôn trọng tồn kho)
      for (const item of order.items) {
        const productId = item.productId;
        if (!productId) {
          console.warn("Item missing productId:", item);
          failCount++;
          failedProducts.push(item.productName || "Sản phẩm không xác định");
          continue;
        }

        try {
          // Fetch product to check stock
          const product = await getProductById(productId);
          const maxStock = Number.isFinite(product?.stockQuantity)
            ? product.stockQuantity
            : Number.isFinite(product?.stock)
            ? product.stock
            : Infinity;
          if (maxStock <= 0) {
            throw new Error("Hết hàng");
          }

          // Check existing cart qty and cap amount added to the available stock
          const cart = await getCart(user.id);
          const existing = (cart.items || []).find((i) => i.productId === productId || i.id === productId);
          const currentQty = existing ? existing.quantity : 0;
          const qtyToAdd = Math.min(item.quantity, Math.max(0, maxStock - currentQty));
          if (qtyToAdd <= 0) {
            throw new Error("Không đủ tồn kho");
          }

          await addToCart(user.id, productId, qtyToAdd);
          successCount++;
        } catch (err) {
          console.error(`Failed to add product ${productId}:`, err);
          failCount++;
          failedProducts.push(item.productName || `ID: ${productId}`);
        }
      }

      // Đóng loading toast
      toast.dismiss(loadingToast);

      // Hiển thị kết quả
      if (successCount > 0 && failCount === 0) {
        toast.success(`Đã thêm ${successCount} sản phẩm vào giỏ hàng`);
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/cart");
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`Đã thêm ${successCount} sản phẩm. ${failCount} sản phẩm không thể thêm vào giỏ`);
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/cart");
      } else {
        toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại");
      }
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Đặt lại đơn hàng thất bại");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Đơn hàng sẽ bị hủy. Bạn có chắc chắn?")) {
      return;
    }

    try {
      await cancelOrder(orderId);
      toast.success("Đã hủy đơn hàng thành công");
      loadOrders(); // Reload orders
    } catch (error) {
      console.error("Error cancelling order:", error);
      if (error.response?.status === 403) {
        toast.error(
          "Bạn không có quyền hủy đơn hàng này. Vui lòng liên hệ admin hoặc đợi backend thêm endpoint /cancel"
        );
      } else {
        toast.error("Hủy đơn hàng thất bại");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Breadcrumb items={[{ label: "Đơn hàng của tôi", isCurrent: true }]} />

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Đơn hàng của tôi</h1>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterStatus === "ALL"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Tất cả ({orders.length})
            </button>
            {Object.entries(orderStatusLabels).map(([status, info]) => {
              const count = orders.filter((o) => o.status === status).length;
              const IconComponent = info.Icon;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    filterStatus === status
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent size={16} />
                  <span>
                    {info.label} ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <Package size={80} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-6">
              Hãy khám phá và mua sắm những sản phẩm yêu thích của bạn
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders
              .filter(
                (order) =>
                  filterStatus === "ALL" || order.status === filterStatus
              )
              .map((order) => {
                const statusInfo =
                  orderStatusLabels[order.status] || orderStatusLabels.PENDING;

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                      orderId === order.id ? "ring-2 ring-red-500" : ""
                    }`}
                  >
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <Package className="text-red-600" size={24} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">
                            Đơn hàng #{order.id}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}
                      >
                        <statusInfo.Icon size={16} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="px-6 py-4">
                      {/* Customer Info */}
                      <div className="mb-4 space-y-1">
                        {order.fullName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="text-gray-400" size={16} />
                            <span className="text-gray-700">
                              {order.fullName} - {order.phone}
                            </span>
                          </div>
                        )}
                        {order.address && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin
                              className="text-gray-400 mt-0.5"
                              size={16}
                            />
                            <span className="text-gray-700">
                              {order.address}
                              {order.ward && `, ${order.ward}`}
                              {order.district && `, ${order.district}`}
                              {order.city && `, ${order.city}`}
                            </span>
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="text-gray-400" size={16} />
                            <span className="text-gray-700">
                              {paymentMethodLabels[order.paymentMethod] ||
                                order.paymentMethod}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Products */}
                      <div className="mt-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Sản phẩm ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-3">
                          {order.items?.map((item, index) => {
                            // Handle cả Entity và DTO từ backend
                            // DTO: productImageUrl, productName, productId
                            // Entity: product.imageUrl, product.name, product.id
                            const productImage =
                              item.productImageUrl ||
                              item.product?.imageUrl ||
                              item.product?.productImages?.[0]?.imageUrl;

                            const productName =
                              item.productName ||
                              item.product?.name ||
                              "Sản phẩm";
                            const productId =
                              item.productId || item.product?.id;

                            // Fallback image nếu không có ảnh từ backend
                            const finalImage =
                              productImage && productImage.trim() !== ""
                                ? productImage
                                : "/images/products/product-1.jpg";

                            return (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() =>
                                  productId && navigate(`/product/${productId}`)
                                }
                              >
                                <img
                                  src={finalImage}
                                  alt={productName}
                                  className="w-20 h-20 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src =
                                      "/images/products/product-1.jpg";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 line-clamp-2">
                                    {productName}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-gray-500">
                                      Số lượng:{" "}
                                      <span className="font-medium text-gray-700">
                                        {item.quantity}
                                      </span>
                                    </p>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-sm text-gray-500">
                                      Đơn giá:{" "}
                                      <span className="font-medium text-gray-700">
                                        {item.price?.toLocaleString()}₫
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-red-600 text-lg">
                                    {(
                                      item.price * item.quantity
                                    ).toLocaleString()}
                                    ₫
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Total & Actions */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600 font-medium">
                            Tổng tiền:
                          </span>
                          <span className="text-2xl font-bold text-red-600">
                            {order.items
                              ?.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                              .toLocaleString()}
                            ₫
                          </span>
                        </div>

                        <div className="flex gap-3">
                          {order.status === "PENDING" ? (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-sm hover:shadow"
                            >
                              <X size={18} />
                              Hủy đơn hàng
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReorder(order)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-sm hover:shadow"
                            >
                              <RotateCcw size={18} />
                              Đặt lại
                            </button>
                          )}
                          {order.status === "COMPLETED" && (
                            <button
                              onClick={() => {
                                const firstItem = order.items?.[0];
                                if (firstItem?.productId) {
                                  navigate(`/product/${firstItem.productId}`);
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-all font-medium shadow-sm hover:shadow"
                            >
                              <Star size={18} />
                              {order.items?.some(
                                (item) =>
                                  item.productId &&
                                  productReviews[item.productId]
                              )
                                ? "Xem đánh giá"
                                : "Đánh giá"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
