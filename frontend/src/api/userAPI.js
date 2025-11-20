import axiosInstance from "./axiosConfig";

const USER_URL = "/users";

export const searchUsers = async (options = {}) => {
    try {
        const params = {
            page: options.page ?? 0,
            size: options.size ?? 10,
        };

        if (options.keyword) {
            params.keyword = options.keyword;
        }
        if (options.role) {
            params.role = options.role;
        }
        if (typeof options.includeInactive === "boolean") {
            params.includeInactive = options.includeInactive;
        }

        const response = await axiosInstance.get(USER_URL, { params });
        return (
            response?.data?.data ?? {
                content: [],
                number: params.page,
                size: params.size,
                totalElements: 0,
                totalPages: 0,
            }
        );
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await axiosInstance.get(`${USER_URL}/${id}`);
        return response?.data?.data ?? null;
    } catch (error) {
        console.error(`Failed to fetch user ${id}:`, error);
        throw error;
    }
};

export const createUser = async (payload) => {
    try {
        const response = await axiosInstance.post(USER_URL, payload);
        return response?.data;
    } catch (error) {
        console.error("Failed to create user:", error);
        throw error;
    }
};

export const updateUser = async (id, payload) => {
    try {
        const response = await axiosInstance.put(`${USER_URL}/${id}`, payload);
        return response?.data;
    } catch (error) {
        console.error(`Failed to update user ${id}:`, error);
        throw error;
    }
};

export const updateUserRole = async (id, role) => {
    try {
        const response = await axiosInstance.patch(`${USER_URL}/${id}/role`, {
            role,
        });
        return response?.data;
    } catch (error) {
        console.error(`Failed to update user ${id} role:`, error);
        throw error;
    }
};

export const updateUserStatus = async (id, active) => {
    try {
        const response = await axiosInstance.patch(`${USER_URL}/${id}/status`, {
            active,
        });
        return response?.data;
    } catch (error) {
        console.error(`Failed to update user ${id} status:`, error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await axiosInstance.delete(`${USER_URL}/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`Failed to deactivate user ${id}:`, error);
        throw error;
    }
};
