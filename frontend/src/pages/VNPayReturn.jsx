import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { removeCartItem } from "../api/cartAPI";
import { handleVNPayReturn } from "../api/paymentAPI";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, failed
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processPayment = async () => {
      // Prevent double processing in React StrictMode
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;
      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
      const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");

      // Lấy thông tin pending order từ sessionStorage
      const pendingOrderStr = sessionStorage.getItem("pendingOrder");
      let pendingOrder = null;

      if (pendingOrderStr) {
        try {
          pendingOrder = JSON.parse(pendingOrderStr);
        } catch (e) {
          console.error("Failed to parse pending order:", e);
        }
      }

      // Gọi backend để verify payment và cập nhật payment status
      try {
        const params = Object.fromEntries(searchParams.entries());
        await handleVNPayReturn(params);
        console.log("Backend verified and updated payment status");
      } catch (error) {
        console.error("Error verifying payment with backend:", error);
      }

      // Kiểm tra kết quả thanh toán
      if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
        // Thanh toán thành công
        setStatus("success");

        // Xóa các sản phẩm đã mua khỏi giỏ hàng
        if (pendingOrder?.cartItems && Array.isArray(pendingOrder.cartItems)) {
          for (const cartItemId of pendingOrder.cartItems) {
            try {
              await removeCartItem(cartItemId);
              console.log(`Removed cart item ${cartItemId}`);
            } catch (error) {
              // Ignore errors nếu item đã được xóa
              console.log(
                `Cart item ${cartItemId} already removed or not found`
              );
            }
          }
        }

        // Xóa pending order
        sessionStorage.removeItem("pendingOrder");

        // Hiển thị thông báo thành công
        toast.success("Thanh toán thành công!");

        // Redirect sau 3 giây
        setTimeout(() => {
          navigate("/orders", {
            state: {
              orderId: pendingOrder?.orderId,
            },
          });
        }, 3000);
      } else {
        // Thanh toán thất bại
        setStatus("failed");
        toast.error("Thanh toán thất bại!");

        // Xóa pending order
        sessionStorage.removeItem("pendingOrder");

        // Redirect về giỏ hàng sau 3 giây
        setTimeout(() => {
          navigate("/cart");
        }, 3000);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {status === "processing" && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xử lý thanh toán
              </h2>
              <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-4">
                Cảm ơn quý khách đã thanh toán. Đơn hàng của bạn đang được xử
                lý.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Bạn sẽ được chuyển đến trang đơn hàng trong giây lát...
                </p>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-gray-600 mb-4">
                Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  Mã lỗi: {searchParams.get("vnp_ResponseCode")}
                </p>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Quay về giỏ hàng
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
