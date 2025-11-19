import axiosInstance from './axiosConfig';

export const createOrder = async (orderRequest) => {
    try {
        const response = await axiosInstance.post('/orders', orderRequest);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const getOrderById = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

export const getOrdersByUserId = async (userId) => {
    try {
        const response = await axiosInstance.get(`/orders/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
