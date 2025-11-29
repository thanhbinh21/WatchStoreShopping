import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrder } from "../api/orderAPI";
import { removeCartItem } from "../api/cartAPI";
import { parseStoredUser } from "@/utils/storage";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";

const paymentMethods = [
  { value: "CASH", label: "Tiền mặt khi nhận hàng (COD)" },
  // Các phương thức thanh toán khác sẽ phát triển sau
  // { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  // { value: 'MOMO', label: 'Ví MoMo' },
  // { value: 'VNPAY', label: 'VNPay' },
];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems, totalPrice } = location.state || {
    selectedItems: [],
    totalPrice: 0,
  };

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    note: "",
    paymentMethod: "CASH",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm từ giỏ hàng");
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      // Get user from localStorage
      const user = parseStoredUser();
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập để đặt hàng");
        navigate("/login");
        return;
      }

      // Prepare order request
      const orderRequest = {
        userId: user.id,
        orderItems: selectedItems.map((item) => {
          // CartItemDto có productId trực tiếp
          const productId = item.productId;
          if (!productId) {
            console.error("Invalid cart item:", item);
            throw new Error("Sản phẩm không hợp lệ trong giỏ hàng");
          }
          return {
            productId: productId,
            quantity: item.quantity || 1,
          };
        }),
        // Shipping information
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        ward: formData.ward || "",
        district: formData.district || "",
        city: formData.city,
        note: formData.note || "",
        // Payment method
        paymentMethod: formData.paymentMethod,
      };

      console.log("Order request:", orderRequest);

      // Create order
      const response = await createOrder(orderRequest);
      console.log("Order response:", response);

      // Backend có thể trả về response.data hoặc trực tiếp data
      const order = response?.data || response;

      // Xóa các sản phẩm đã mua khỏi giỏ hàng
      try {
        for (const item of selectedItems) {
          if (item.id) {
            await removeCartItem(item.id);
          }
        }
      } catch (error) {
        console.error("Error removing cart items:", error);
        // Không fail order nếu không xóa được cart
      }

      // Backend trả về Order object trực tiếp
      toast.success("Đặt hàng thành công!");
      navigate("/orders", {
        state: {
          orderId: order?.id,
          message: "Đơn hàng của bạn đang được xử lý",
        },
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi đặt hàng";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Breadcrumb
        items={[
          { label: "Giỏ hàng", href: "/cart" },
          { label: "Thanh toán", isCurrent: true },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Delivery Information Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Tỉnh/Thành phố"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Quận/Huyện"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Phường/Xã"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Số nhà, tên đường..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ghi chú thêm (tùy chọn)"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Phương thức thanh toán
                </h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Đơn hàng</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {selectedItems.map((item) => {
                  // CartItemDto có imageUrl, productName, price trực tiếp
                  const imageUrl =
                    item.imageUrl || "https://via.placeholder.com/60";
                  const productName = item.productName || "Sản phẩm";
                  const price = Number(item.price) || 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 pb-3 border-b"
                    >
                      <img
                        src={imageUrl}
                        alt={productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium line-clamp-2">
                          {productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          SL: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-red-600">
                          {(price * item.quantity).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{totalPrice.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">
                    {totalPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
