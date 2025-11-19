import axiosInstance from "./axiosConfig";

const ORDER_URL = "/orders";

export const searchOrders = async (params = {}) => {
    const {
        page = 0,
        size = 10,
        status,
        search,
        fromDate,
        toDate,
        minTotal,
        maxTotal,
        sortBy = "createdAt",
        sortDir = "desc",
    } = params;

    const query = new URLSearchParams();
    query.set("page", page);
    query.set("size", size);
    query.set("sortBy", sortBy);
    query.set("sortDir", sortDir);

    if (status) query.set("status", status);
    if (search) query.set("customerName", search);
    if (fromDate) query.set("fromDate", fromDate);
    if (toDate) query.set("toDate", toDate);
    if (minTotal !== undefined && minTotal !== null)
        query.set("minTotal", minTotal);
    if (maxTotal !== undefined && maxTotal !== null)
        query.set("maxTotal", maxTotal);

    return axiosInstance.get(`${ORDER_URL}?${query.toString()}`);
};

export const getOrderDetail = async (id) => {
    return axiosInstance.get(`${ORDER_URL}/${id}/detail`);
};

export const updateOrderStatus = async (id, status) => {
    return axiosInstance.put(`${ORDER_URL}/${id}/status`, { status });
};
