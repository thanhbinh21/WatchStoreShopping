// Wishlist API - Quản lý danh sách yêu thích trong localStorage
// Lưu trữ cho tất cả roles, không cần backend API

const WISHLIST_KEY = 'wishlist';

/**
 * Lấy danh sách sản phẩm yêu thích từ localStorage
 * @returns {Array} - Mảng các sản phẩm yêu thích
 */
export const getWishlist = () => {
    try {
        const wishlist = localStorage.getItem(WISHLIST_KEY);
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
        console.error('Error getting wishlist:', error);
        return [];
    }
};

/**
 * Thêm sản phẩm vào danh sách yêu thích
 * @param {Object} product - Sản phẩm cần thêm
 * @returns {boolean} - true nếu thêm thành công, false nếu đã tồn tại
 */
export const addToWishlist = (product) => {
    try {
        const wishlist = getWishlist();
        
        // Kiểm tra xem sản phẩm đã tồn tại chưa
        const exists = wishlist.some(item => item.id === product.id);
        if (exists) {
            return false; // Sản phẩm đã tồn tại
        }
        
        // Thêm sản phẩm mới vào đầu danh sách
        wishlist.unshift({
            id: product.id,
            name: product.name,
            price: product.price || product.currentPrice,
            currentPrice: product.currentPrice || product.price,
            imageUrl: product.imageUrl || product.primaryImageUrl,
            brand: product.brand,
            brandName: product.brandName,
            rating: product.rating,
            numOfRating: product.numOfRating,
            addedAt: new Date().toISOString()
        });
        
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
        return true;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return false;
    }
};

/**
 * Xóa sản phẩm khỏi danh sách yêu thích
 * @param {number} productId - ID sản phẩm cần xóa
 * @returns {boolean} - true nếu xóa thành công
 */
export const removeFromWishlist = (productId) => {
    try {
        const wishlist = getWishlist();
        const filtered = wishlist.filter(item => item.id !== productId);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return false;
    }
};

/**
 * Kiểm tra sản phẩm có trong danh sách yêu thích không
 * @param {number} productId - ID sản phẩm cần kiểm tra
 * @returns {boolean} - true nếu sản phẩm đã được yêu thích
 */
export const isInWishlist = (productId) => {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === productId);
};

/**
 * Lấy số lượng sản phẩm yêu thích
 * @returns {number} - Số lượng sản phẩm
 */
export const getWishlistCount = () => {
    const wishlist = getWishlist();
    return wishlist.length;
};

/**
 * Xóa toàn bộ danh sách yêu thích
 */
export const clearWishlist = () => {
    try {
        localStorage.removeItem(WISHLIST_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        return false;
    }
};
