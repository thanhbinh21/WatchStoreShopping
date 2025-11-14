import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getCart, updateCartItem, removeCartItem } from "../api/cartAPI.js";

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    // Load giỏ hàng
    const loadCart = async () => {
        if (!userId) return;
        try {
            const res = await getCart(userId);
            setCartItems(res.items || []);
        } catch (err) {
            console.error("Lỗi load giỏ hàng:", err);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

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

        try {
            await updateCartItem(cartItemId, newQuantity);
            loadCart();
        } catch (err) {
            console.error("Lỗi update số lượng:", err);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await removeCartItem(cartItemId);
            loadCart();
            setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
        } catch (err) {
            console.error("Lỗi xóa item:", err);
        }
    };

    const totalPrice = selectedItems
        .map((id) => {
            const item = cartItems.find((i) => i.id === id);
            return item ? item.price * item.quantity : 0;
        })
        .reduce((a, b) => a + b, 0);

    return (
        <div>
            {/* Header giống Navbar */}
            <header className="fixed top-0 z-50 w-full bg-red-600 shadow-md">
                <div className="container mx-auto flex items-center justify-between h-16 px-4">
                    <div
                        className="text-white text-2xl font-bold cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        WATCH STORE
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30"
                    >
                        🏠 Về Home
                    </button>
                </div>
            </header>

            {/* Body giỏ hàng */}
            <div className="max-w-xl mx-auto p-4 mt-24">
                <h1 className="text-xl font-semibold mb-4">Giỏ hàng của bạn</h1>

                <div className="mb-4">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                        <span>Chọn tất cả</span>
                    </label>
                </div>

                <div className="space-y-4">
                    {cartItems.length === 0 && <p>Giỏ hàng trống 😢</p>}

                    {cartItems.map((item) => (
                        <div key={item.id} className="flex border rounded p-2 space-x-4 items-start">
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                            />
                            <img
                                src={item.imageUrl || "https://via.placeholder.com/80"}
                                alt={item.productName}
                                className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                                <h2 className="font-medium">{item.productName}</h2>
                                <p className="text-red-500 font-semibold">{item.price.toLocaleString()}đ</p>

                                <div className="mt-2 flex items-center">
                                    <button onClick={() => handleQuantityChange(item.id, -1)} className="px-2 border rounded">-</button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.id, 1)} className="px-2 border rounded">+</button>
                                </div>

                                <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                                    <p className="font-semibold">Khuyến mãi</p>
                                    <ul className="list-disc list-inside">
                                        <li>Tặng bao da cao cấp</li>
                                        <li>Bảo hành 12 tháng</li>
                                    </ul>
                                </div>
                            </div>

                            <button onClick={() => handleRemoveItem(item.id)}>🗑️</button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-between items-center p-2 border-t">
                    <p>Tạm tính: {totalPrice.toLocaleString()}đ</p>
                    <button
                        className={`px-4 py-2 rounded text-white ${
                            totalPrice > 0 ? "bg-red-600" : "bg-gray-400 cursor-not-allowed"
                        }`}
                        disabled={totalPrice === 0}
                    >
                        Mua ngay
                    </button>
                </div>
            </div>
        </div>
    );
}
