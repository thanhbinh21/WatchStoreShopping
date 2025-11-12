import axios from 'axios';

const API_URL_PRD = 'http://localhost:8080/api/products';

export const getProductsByCategoryId = async (categoryId) => {
    try {
        const url = `${API_URL_PRD}/category/${categoryId}`;
        const response = await axios.get(url);

        const result = response.data;
        if (Array.isArray(result)) return result;
        if (result?.data && Array.isArray(result.data)) return result.data;
        return [];
    } catch (error) {
        console.error(`Lỗi gọi API tìm sản phẩm theo ID danh mục ${categoryId}:`, error);
        return [];
    }
};
export const searchProductsByName = async (name) => {
    try {
        const res = await axios.get(`${API_URL_PRD}/search`, {
            params: { name },
        });
        return res.data;
    } catch (error) {
        console.error("Lỗi tìm sản phẩm:", error);
        return [];
    }
};