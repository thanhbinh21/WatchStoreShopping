const GUEST_CART_KEY = "guest_cart";

export const getGuestCart = () => {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
};

export const addToGuestCart = (product, quantity = 1) => {
    let cart = getGuestCart();

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            productName: product.name,
            price: product.currentPrice || product.price || 0,
            imageUrl: product.imageUrl || product.primaryImageUrl,
            quantity,
        });
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
};
