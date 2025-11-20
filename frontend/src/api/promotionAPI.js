import axiosInstance from "./axiosConfig";

const PROMOTION_URL = "/promotions";

export const getPromotions = async (options = {}) => {
    try {
        const params = options.search ? { search: options.search } : undefined;
        const response = await axiosInstance.get(`${PROMOTION_URL}/summaries`, {
            params,
        });
        const payload =
            response && response.data ? response.data.data : undefined;
        return Array.isArray(payload) ? payload : [];
    } catch (error) {
        console.error("Failed to fetch promotions:", error);
        throw error;
    }
};

export const getPromotionById = async (id) => {
    try {
        const response = await axiosInstance.get(`${PROMOTION_URL}/${id}`);
        const payload =
            response && response.data ? response.data.data : undefined;
        return payload !== undefined && payload !== null ? payload : null;
    } catch (error) {
        console.error(`Failed to fetch promotion ${id}:`, error);
        throw error;
    }
};

export const createPromotion = async (payload) => {
    try {
        const response = await axiosInstance.post(PROMOTION_URL, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to create promotion:", error);
        throw error;
    }
};

export const updatePromotion = async (id, payload) => {
    try {
        const response = await axiosInstance.put(
            `${PROMOTION_URL}/${id}`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to update promotion ${id}:`, error);
        throw error;
    }
};

export const deletePromotion = async (id) => {
    try {
        const response = await axiosInstance.delete(`${PROMOTION_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete promotion ${id}:`, error);
        throw error;
    }
};
