import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrder } from "../api/orderAPI";
import { removeCartItem } from "../api/cartAPI";
import { createVNPayPayment } from "../api/paymentAPI";
import { parseStoredUser } from "@/utils/storage";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const paymentMethods = [
  { value: "CASH", label: "Tiền mặt khi nhận hàng (COD)" },
  { value: "VNPAY", label: "Thanh toán qua VNPay" },
  // Các phương thức thanh toán khác sẽ phát triển sau
  // { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  // { value: 'MOMO', label: 'Ví MoMo' },
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
  // state for address
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const json = await res.json();
      setProvinces(json || []);
    } catch (err) {
      console.error("Failed to load provinces", err);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    if (!provinceCode) return setDistricts([]);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const json = await res.json();
      setDistricts(json?.districts || []);
    } catch (err) {
      console.error("Failed to load districts", err);
    }
  };

  const fetchWards = async (districtCode) => {
    if (!districtCode) return setWards([]);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const json = await res.json();
      setWards(json?.wards || []);
    } catch (err) {
      console.error("Failed to load wards", err);
    }
  };

  // Load tỉnh thành khi component mount
  useEffect(() => {
    fetchProvinces();

    const user = parseStoredUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
      }));
    }
  }, []);

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
      !formData.address || // Số nhà
      !formData.city || // Tỉnh
      !formData.district || // Huyện
      !formData.ward // Xã
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);

    // Hiển thị toast đang xử lý
    const loadingToast = toast.loading("Đơn hàng đang xử lý...");

    try {
      // Get user from localStorage
      const user = parseStoredUser();
      if (!user?.id) {
        toast.dismiss(loadingToast);
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

      // If payment method is VNPay, redirect to VNPay payment gateway
      if (formData.paymentMethod === "VNPAY") {
        try {
          // Store cart items in sessionStorage for later removal
          sessionStorage.setItem(
            "vnpay_cart_items",
            JSON.stringify(selectedItems)
          );

          const vnpayResponse = await createVNPayPayment({
            orderId: order.id,
            amount: Math.round(totalPrice),
            orderInfo: `Thanh toan don hang ${order.id}`,
            returnUrl: `${window.location.origin}/payment/vnpay-return`,
          });

          if (vnpayResponse?.code === "00" && vnpayResponse?.paymentUrl) {
            toast.dismiss(loadingToast);
            toast.success("Đang chuyển đến cổng thanh toán VNPay...");
            // Redirect to VNPay
            window.location.href = vnpayResponse.paymentUrl;
            return;
          } else {
            throw new Error(
              vnpayResponse?.message || "Không thể tạo thanh toán VNPay"
            );
          }
        } catch (vnpayError) {
          toast.dismiss(loadingToast);
          toast.error("Lỗi khi tạo thanh toán VNPay: " + vnpayError.message);
          return;
        }
      }

      // For COD payment, remove cart items and navigate to orders
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

      // Đóng toast loading và hiển thị toast thành công
      toast.dismiss(loadingToast);
      toast.success("Đơn hàng xử lý thành công!");

      // Navigate không truyền message nữa để tránh toast trùng lặp
      navigate("/orders", {
        state: {
          orderId: order?.id,
        },
      });
    } catch (error) {
      // Đóng toast loading khi có lỗi
      toast.dismiss(loadingToast);

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
                {/* Tỉnh / Thành */}
                <div className="min-w-48">
                  <label className="block text-sm font-medium mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={
                      selectedProvinceCode ? String(selectedProvinceCode) : ""
                    }
                    onValueChange={(value) => {
                      const code = value;
                      setSelectedProvinceCode(code);
                      setSelectedDistrictCode("");
                      setSelectedWardCode("");
                      setDistricts([]);
                      setWards([]);

                      const prov = provinces.find(
                        (p) => String(p.code) === String(code)
                      );
                      setFormData((prev) => ({
                        ...prev,
                        city: prov?.name || "",
                        district: "",
                        ward: "",
                      }));

                      if (code) fetchDistricts(code);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn Tỉnh/Thành" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={String(prov.code)}>
                          {prov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quận / Huyện */}
                <div className="min-w-48">
                  <label className="block text-sm font-medium mb-1">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <Select
                    disabled={!selectedProvinceCode}
                    value={
                      selectedDistrictCode ? String(selectedDistrictCode) : ""
                    }
                    onValueChange={(value) => {
                      const code = value;
                      setSelectedDistrictCode(code);
                      setSelectedWardCode("");
                      setWards([]);

                      const dist = districts.find(
                        (d) => String(d.code) === String(code)
                      );
                      setFormData((prev) => ({
                        ...prev,
                        district: dist?.name || "",
                        ward: "",
                      }));

                      if (code) fetchWards(code);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn Quận/Huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d.code} value={String(d.code)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phường / Xã */}
                <div className="min-w-48">
                  <label className="block text-sm font-medium mb-1">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <Select
                    disabled={!selectedDistrictCode}
                    value={selectedWardCode ? String(selectedWardCode) : ""}
                    onValueChange={(value) => {
                      const code = value;
                      setSelectedWardCode(code);

                      const ward = wards.find(
                        (w) => String(w.code) === String(code)
                      );
                      setFormData((prev) => ({
                        ...prev,
                        ward: ward?.name || "",
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn Phường/Xã" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => (
                        <SelectItem key={w.code} value={String(w.code)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <div className="bg-white p-6 rounded-lg shadow sticky top-20">
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
