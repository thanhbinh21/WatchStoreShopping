import axiosInstance from "./axiosConfig";

const REVIEW_URL = "/reviews";

export const getAllReviews = async () => {
    const response = await axiosInstance.get(REVIEW_URL);
    return response.data || [];
};

export const deleteReview = async (id, reason) => {
    const response = await axiosInstance.delete(`${REVIEW_URL}/${id}`, {
        data: { reason },
    });
    return response.data;
};
