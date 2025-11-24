import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getCart, updateCartItem, removeCartItem } from "../api/cartAPI";
import { getGuestCart } from "@/api/guestCart";
import { getPromotions, getProductsWithPromotions } from "@/api/promotionAPI";
import { parseStoredUser } from "@/utils/storage";
import Breadcrumb from "@/components/Breadcrumb";

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
        setCartItems(res.items || []);
        return;
      } catch (err) {
        console.error("Lỗi load giỏ hàng:", err);
      }
    }
    const guestCart = getGuestCart();
    setCartItems(guestCart);
  };

  const loadPromotionsData = async () => {
    try {
      // Load cả 2 nguồn dữ liệu promotions
      const [promosData, productsWithPromosData] = await Promise.all([
        getPromotions(),
        getProductsWithPromotions()
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

    // Determine the actual product ID for this cart item. Depending on source
    // the cart item may be shaped differently:
    // - guest cart items use `id === product.id`
    // - server cart items may have `productId` or a nested `product.id`
    const productId = item.productId || item.product?.id || item.id;

    // 1. Tìm trong promotions từ /summaries (có productIds)
    if (promotions && promotions.length > 0) {
      const promoFromSummaries = promotions.filter(promo => {
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
      const productWithPromo = productsWithPromotions.find(product => {
        // Kiểm tra nhiều trường hợp id có thể có
        const promoProductId = product.productId || product.id;
        return promoProductId === productId;
      });

      if (productWithPromo && Array.isArray(productWithPromo.promotions)) {
        const validPromos = productWithPromo.promotions.filter(p =>
            isValidPromotion(p)
        );
        allPromotions.push(...validPromos);
      }
    }

    // Loại bỏ trùng lặp theo id
    const uniquePromotions = Array.from(new Map(
        allPromotions.map(p => [p.id, p])
    ).values());

    return uniquePromotions;
  };

  // Tính giá sau khuyến mãi của một sản phẩm
  const getDiscountedPrice = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return item.price;

    const maxDiscount = Math.max(...itemPromos.map((p) => parseFloat(p.discount || 0)));
    const discountedPrice = Math.round(item.price * (1 - maxDiscount / 100));

    return discountedPrice;
  };

  // Tính số tiền tiết kiệm được
  const getSavingsAmount = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return 0;

    const maxDiscount = Math.max(...itemPromos.map((p) => parseFloat(p.discount || 0)));
    const savings = Math.round(item.price * (maxDiscount / 100));

    return savings;
  };

  // Tính phần trăm giảm giá
  const getDiscountPercent = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return 0;

    const maxDiscount = Math.max(...itemPromos.map((p) => parseFloat(p.discount || 0)));
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
    if (newQuantity > item.stock) return;

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
    const itemsToCheckout = cartItems.filter((item) =>
        selectedItems.includes(item.id)
    );
    navigate("/checkout", { state: { selectedItems: itemsToCheckout, totalPrice } });
  };

  return (
      <div className="bg-gray-50 min-h-screen">
        <header className="fixed top-0 z-50 w-full bg-red-600 shadow-md">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <div className="text-white text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
              WATCH STORE
            </div>
          </div>
        </header>

        <Breadcrumb currentPage="Giỏ hàng" />

        <div className="max-w-3xl mx-auto p-4 mt-24">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Giỏ hàng của bạn</h1>

          <div className="mb-4">
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

          <div className="space-y-4">
            {cartItems.length === 0 && <p className="text-gray-500">Giỏ hàng trống 😢</p>}

            {cartItems.map((item) => {
              const itemPromos = getItemPromotions(item);
              const hasPromotion = itemPromos.length > 0;
              const discountedPrice = getDiscountedPrice(item);
              const savingsAmount = getSavingsAmount(item);
              const discountPercent = getDiscountPercent(item);

              return (
                  <div key={item.id} className="flex border rounded-lg p-4 items-start bg-white shadow hover:shadow-lg transition">
                    <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="accent-red-600 w-5 h-5 mt-2"
                    />
                    <img src={item.imageUrl || "https://via.placeholder.com/80"} alt={item.productName} className="w-24 h-24 object-cover rounded ml-4" />
                    <div className="flex-1 ml-4">
                      <h2 className="font-semibold text-gray-800">{item.productName}</h2>

                      {/* Hiển thị giá */}
                      <div className="mt-1">
                        {hasPromotion ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-red-600 font-bold text-lg">
                                {discountedPrice.toLocaleString("vi-VN")}₫
                              </p>
                              <p className="text-gray-500 line-through text-sm">
                                {item.price.toLocaleString("vi-VN")}₫
                              </p>
                              <span className="text-green-600 font-semibold text-sm">
                          Tiết kiệm {savingsAmount.toLocaleString("vi-VN")}₫
                        </span>
                            </div>
                        ) : (
                            <p className="text-red-600 font-bold text-lg">
                              {item.price.toLocaleString("vi-VN")}₫
                            </p>
                        )}
                      </div>

                      {/* Badge giảm giá */}
                      {hasPromotion && (
                          <div className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs font-bold mt-1">
                            -{discountPercent}%
                          </div>
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-100 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                        >-</button>
                        <span className="text-lg font-medium">{item.quantity}</span>
                        <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-100 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity >= item.stock}
                        >+</button>
                      </div>
                      {/*<p className="text-sm text-gray-500 mt-1">Còn lại: {item.stock} sản phẩm</p>*/}

                      {/* Hiển thị thông tin khuyến mãi */}
                      {hasPromotion && (
                          <div className="mt-2 text-sm bg-green-100 p-2 rounded">
                            <p className="font-semibold text-green-700">Khuyến mãi đang áp dụng</p>
                            <ul className="list-disc list-inside text-green-700">
                              {itemPromos.map((p) => (
                                  <li key={p.id}>{p.name} - Giảm {parseFloat(p.discount).toFixed(2)}%</li>
                              ))}
                            </ul>
                          </div>
                      )}
                    </div>

                    <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800 ml-4 mt-2 text-xl transition"
                    >🗑️</button>
                  </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 border-t bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                {totalSavings > 0 && (
                    <div className="text-green-600 font-semibold mb-2">
                      Bạn đã tiết kiệm: {totalSavings.toLocaleString("vi-VN")}₫
                    </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  {totalSavings > 0 && (
                      <p className="text-gray-500 line-through text-sm">
                        {originalTotalPrice.toLocaleString("vi-VN")}₫
                      </p>
                  )}
                  <p className="font-semibold text-gray-700 text-lg">
                    Tổng: <span className="text-red-600 text-xl">{totalPrice.toLocaleString("vi-VN")}₫</span>
                  </p>
                </div>

                <button
                    onClick={handleCheckout}
                    className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
                        selectedItems.length > 0
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={selectedItems.length === 0}
                >
                  Mua ngay ({selectedItems.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}