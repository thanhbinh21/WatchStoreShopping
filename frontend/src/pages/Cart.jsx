import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getCart, updateCartItem, removeCartItem } from "../api/cartAPI";
import Header from "@/components/Header";
import { getGuestCart } from "@/api/guestCart";
import { getPromotions, getProductsWithPromotions } from "@/api/promotionAPI";
import { parseStoredUser } from "@/utils/storage";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "sonner";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [productsWithPromotions, setProductsWithPromotions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const navigate = useNavigate();
  const user = parseStoredUser();
  const userId = user?.id;

  const loadCart = async () => {
    if (userId) {
      try {
        const res = await getCart(userId);
        let items = res.items || [];
        // Ensure item.quantity does not exceed stock
        let loginModified = false;
        for (const it of items) {
          if (Number.isFinite(it.stock) && it.quantity > it.stock) {
            loginModified = true;
            // Adjust and persist to the backend
            try {
              await updateCartItem(it.id, Math.max(1, it.stock));
              it.quantity = Math.max(1, it.stock);
            } catch (e) {
              console.error(
                "Failed to adjust cart item due to stock change",
                e
              );
            }
          }
        }
        if (loginModified) {
          toast.warning(
            "Một số sản phẩm trong giỏ đã được điều chỉnh vì tồn kho thay đổi"
          );
        }
        setCartItems(items);
        return;
      } catch (err) {
        console.error("Lỗi load giỏ hàng:", err);
      }
    }
    let guestCart = getGuestCart();
    // Ensure guest cart items do not exceed stock
    let modified = false;
    guestCart = guestCart.map((it) => {
      if (Number.isFinite(it.stock) && it.quantity > it.stock) {
        modified = true;
        return { ...it, quantity: Math.max(1, it.stock) };
      }
      return it;
    });
    if (modified) {
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      toast.warning(
        "Số lượng một số sản phẩm đã được điều chỉnh do tồn kho thay đổi"
      );
    }
    setCartItems(guestCart);
  };

  const loadPromotionsData = async () => {
    try {
      // Load cả 2 nguồn dữ liệu promotions
      const [promosData, productsWithPromosData] = await Promise.all([
        getPromotions(),
        getProductsWithPromotions(),
      ]);

      setPromotions(promosData || []);
      setProductsWithPromotions(productsWithPromosData || []);
    } catch (err) {
      console.error("Lỗi load promotions:", err);
      setPromotions([]);
      setProductsWithPromotions([]);
    }
  };

  useEffect(() => {
    loadCart();
    loadPromotionsData();
  }, []);

  // Hàm kiểm tra khuyến mãi hợp lệ
  const isValidPromotion = (promotion) => {
    if (!promotion.startDate || !promotion.endDate) return false;
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  };

  // Lấy khuyến mãi hợp lệ cho một sản phẩm - KẾT HỢP 2 NGUỒN DỮ LIỆU
  const getItemPromotions = (item) => {
    const allPromotions = [];

    const productId = item.productId || item.product?.id || item.id;

    // 1. Tìm trong promotions từ /summaries (có productIds)
    if (promotions && promotions.length > 0) {
      const promoFromSummaries = promotions.filter((promo) => {
        if (!isValidPromotion(promo)) return false;

        // Kiểm tra trong productIds - compare against resolved productId
        if (promo.productIds && Array.isArray(promo.productIds)) {
          return promo.productIds.includes(productId);
        }

        return false;
      });
      allPromotions.push(...promoFromSummaries);
    }

    // 2. Tìm trong productsWithPromotions từ /promotions
    if (productsWithPromotions && productsWithPromotions.length > 0) {
      // Tìm sản phẩm trong danh sách productsWithPromotions
      const productWithPromo = productsWithPromotions.find((product) => {
        // Kiểm tra nhiều trường hợp id có thể có
        const promoProductId = product.productId || product.id;
        return promoProductId === productId;
      });

      if (productWithPromo && Array.isArray(productWithPromo.promotions)) {
        const validPromos = productWithPromo.promotions.filter((p) =>
          isValidPromotion(p)
        );
        allPromotions.push(...validPromos);
      }
    }

    // Loại bỏ trùng lặp theo id
    const uniquePromotions = Array.from(
      new Map(allPromotions.map((p) => [p.id, p])).values()
    );

    return uniquePromotions;
  };

  // Tính giá sau khuyến mãi của một sản phẩm
  const getDiscountedPrice = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return item.price;

    const maxDiscount = Math.max(
      ...itemPromos.map((p) => parseFloat(p.discount || 0))
    );
    const discountedPrice = Math.round(item.price * (1 - maxDiscount / 100));

    return discountedPrice;
  };

  // Tính số tiền tiết kiệm được
  const getSavingsAmount = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return 0;

    const maxDiscount = Math.max(
      ...itemPromos.map((p) => parseFloat(p.discount || 0))
    );
    const savings = Math.round(item.price * (maxDiscount / 100));

    return savings;
  };

  // Tính phần trăm giảm giá
  const getDiscountPercent = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return 0;

    const maxDiscount = Math.max(
      ...itemPromos.map((p) => parseFloat(p.discount || 0))
    );
    return Math.round(maxDiscount);
  };

  // Các hàm xử lý khác giữ nguyên
  const handleSelectAll = () => {
    if (selectAll) setSelectedItems([]);
    else setSelectedItems(cartItems.map((item) => item.id));
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id))
      setSelectedItems(selectedItems.filter((x) => x !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  const handleQuantityChange = async (cartItemId, delta) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);
    // Nếu stock không xác định, bỏ qua ràng buộc này
    const stock = Number.isFinite(item.stock) ? item.stock : Infinity;
    if (newQuantity > stock) {
      // Thông báo cho người dùng
      toast.error("Không thể tăng nhiều hơn số lượng tồn kho");
      return;
    }

    if (!userId) {
      let cart = getGuestCart();
      const target = cart.find((i) => i.id === cartItemId);
      if (target) target.quantity = newQuantity;
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      setCartItems(cart);
      return;
    }

    try {
      await updateCartItem(cartItemId, newQuantity);
      loadCart();
    } catch (err) {
      console.error("Lỗi update số lượng:", err);
      // Nếu backend trả lỗi stock (hoặc bất kỳ lỗi nào), show toast cho UX
      const message =
        err?.response?.data?.message || "Cập nhật số lượng thất bại";
      toast.error(message);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!userId) {
      let cart = getGuestCart().filter((i) => i.id !== cartItemId);
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      setCartItems(cart);
      setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
      return;
    }
    try {
      await removeCartItem(cartItemId);
      window.dispatchEvent(new Event("cartUpdated"));
      loadCart();
      setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
    } catch (err) {
      console.error("Lỗi xóa item:", err);
    }
  };

  // Tính tổng tiền
  const totalPrice = selectedItems
    .map((id) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item) return 0;

      const discountedPrice = getDiscountedPrice(item);
      return discountedPrice * item.quantity;
    })
    .reduce((a, b) => a + b, 0);

  const originalTotalPrice = selectedItems
    .map((id) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item) return 0;
      return item.price * item.quantity;
    })
    .reduce((a, b) => a + b, 0);

  const totalSavings = originalTotalPrice - totalPrice;

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    // ❗ Nếu chưa login → chuyển đến trang login
    if (!userId) {
      toast.error("Bạn cần đăng nhập để tiếp tục thanh toán");
      navigate("/login");
      return;
    }

    // Nếu đã login → cho checkout như thường
    const itemsToCheckout = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    navigate("/checkout", {
      state: { selectedItems: itemsToCheckout, totalPrice },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header giống Navbar */}
      <Header />

      <Breadcrumb items={[{ label: "Giỏ hàng", isCurrent: true }]} />

      <div className="max-w-4xl mx-auto p-4 mt-24 flex-1 w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Giỏ hàng của bạn
        </h1>

        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="accent-red-600 w-5 h-5"
            />
            <span className="font-medium text-gray-700">Chọn tất cả</span>
          </label>
        </div>

        <div className="space-y-4 pb-32">
          {cartItems.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          )}

          {cartItems.map((item) => {
            const itemPromos = getItemPromotions(item);
            const hasPromotion = itemPromos.length > 0;
            const discountedPrice = getDiscountedPrice(item);
            const savingsAmount = getSavingsAmount(item);
            const discountPercent = getDiscountPercent(item);

            return (
              <div
                key={item.id}
                className="flex border rounded-lg p-4 bg-white shadow hover:shadow-lg transition mb-4 items-start hover:border-red-300"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectItem(item.id);
                  }}
                  className="accent-red-600 w-5 h-5 mt-4 mr-3"
                />

                {/* Click vào hình để chuyển trang */}
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/product/${item.productId || item.id}`)
                  }
                >
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/80"}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>

                <div className="ml-4 flex-1">
                  {/* Click vào tên để chuyển trang */}
                  <h2
                    className="font-semibold text-gray-800 text-lg hover:text-red-600 cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${item.productId || item.id}`)
                    }
                  >
                    {item.productName}
                  </h2>

                  {/* Hiển thị giá */}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {hasPromotion ? (
                      <>
                        <p className="text-red-600 font-bold text-xl">
                          {discountedPrice.toLocaleString("vi-VN")}đ
                        </p>
                        <p className="text-gray-500 line-through text-sm">
                          {item.price.toLocaleString("vi-VN")}đ
                        </p>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                          -{discountPercent}%
                        </span>
                      </>
                    ) : (
                      <p className="text-red-600 font-bold text-xl">
                        {item.price.toLocaleString("vi-VN")}đ
                      </p>
                    )}
                  </div>

                  {/* Dòng "Đã giảm" */}
                  {hasPromotion && (
                    <p className="text-green-600 text-sm mt-1 font-medium flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 010-2h11.586l-2.293-2.293A1 1 0 0112 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Đã giảm {savingsAmount.toLocaleString("vi-VN")}đ
                    </p>
                  )}

                  {/* Hiển thị khuyến mãi như hình - CHỈ HIỆN KHI CÓ KHUYẾN MÃI */}
                  {hasPromotion && (
                    <div className="mt-2 text-sm bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="font-semibold text-green-800 mb-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-green-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 010-2h11.586l-2.293-2.293A1 1 0 0112 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Khuyến mãi đang áp dụng
                      </p>
                      <ul className="space-y-1 text-green-700">
                        {itemPromos.map((p) => (
                          <li key={p.id} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            {p.name} - Giảm {parseFloat(p.discount).toFixed(2)}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Cột bên phải: Số lượng và nút xóa */}
                <div className="flex flex-col items-end justify-between h-full ml-4">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition hover:bg-gray-100 p-1 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center gap-3 mt-4 bg-gray-50 p-2 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                      disabled={item.quantity <= 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="text-lg font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                      disabled={item.quantity >= item.stock}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phần tổng tiền và nút thanh toán CỐ ĐỊNH ở dưới cùng */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-10">
        <div className="max-w-4xl mx-auto">
          <div className="p-4">
            <div className="flex justify-between items-center">
              {/* Phần bên trái: Tiết kiệm và tổng tiền */}
              <div className="flex-1">
                {totalSavings > 0 && (
                  <div className="mb-1">
                    <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 010-2h11.586l-2.293-2.293A1 1 0 0112 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tiết kiệm {totalSavings.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                )}

                {/* Phần giá gốc bị gạch - nằm trên phần tổng tiền */}
                {totalSavings > 0 && (
                  <div className="mb-1">
                    <p className="text-gray-500 line-through text-sm">
                      {originalTotalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                )}

                {/* Phần tổng tiền */}
                <div className="flex items-center gap-2">
                  <p className="text-gray-700 text-lg font-medium">
                    Tổng tiền:
                  </p>
                  <p className="text-red-600 font-bold text-2xl">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>

              {/* Phần bên phải: Nút thanh toán */}
              <div className="flex flex-col items-end">
                <p className="text-gray-600 text-sm mb-1">
                  Đã chọn{" "}
                  <span className="font-bold">{selectedItems.length}</span> sản
                  phẩm
                </p>
                <button
                  onClick={handleCheckout}
                  className={`px-8 py-3 rounded-lg text-white font-bold text-lg flex items-center transition-all ${
                    selectedItems.length > 0
                      ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                  disabled={selectedItems.length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thanh toán
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
