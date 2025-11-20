import axiosInstance from "./axiosConfig";

const REPORT_URL = "/reports";

export const getCustomerSummary = async () => {
    const response = await axiosInstance.get(`${REPORT_URL}/customers/summary`);
    return response?.data?.data ?? null;
};

export const getCustomerDailyReport = async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) {
        params.startDate = startDate;
    }
    if (endDate) {
        params.endDate = endDate;
    }

    const response = await axiosInstance.get(`${REPORT_URL}/customers/daily`, {
        params,
    });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getCustomerMonthlyReport = async ({ year } = {}) => {
    const params = {};
    if (year) {
        params.year = year;
    }
    const response = await axiosInstance.get(
        `${REPORT_URL}/customers/monthly`,
        {
            params,
        }
    );
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getCustomerYearlyReport = async ({ startYear, endYear } = {}) => {
    const params = {};
    if (startYear) {
        params.startYear = startYear;
    }
    if (endYear) {
        params.endYear = endYear;
    }
    const response = await axiosInstance.get(`${REPORT_URL}/customers/yearly`, {
        params,
    });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getRevenueSummary = async () => {
    const response = await axiosInstance.get(`${REPORT_URL}/revenue/summary`);
    return response?.data?.data ?? null;
};

export const getRevenueDailyReport = async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) {
        params.startDate = startDate;
    }
    if (endDate) {
        params.endDate = endDate;
    }

    const response = await axiosInstance.get(`${REPORT_URL}/revenue/daily`, {
        params,
    });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getRevenueMonthlyReport = async ({ year } = {}) => {
    const params = {};
    if (year) {
        params.year = year;
    }
    const response = await axiosInstance.get(`${REPORT_URL}/revenue/monthly`, {
        params,
    });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getRevenueYearlyReport = async ({ startYear, endYear } = {}) => {
    const params = {};
    if (startYear) {
        params.startYear = startYear;
    }
    if (endYear) {
        params.endYear = endYear;
    }
    const response = await axiosInstance.get(`${REPORT_URL}/revenue/yearly`, {
        params,
    });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getRevenueByCustomerMonthly = async ({
    year,
    month,
    limit,
} = {}) => {
    const params = {};
    if (year) {
        params.year = year;
    }
    if (month) {
        params.month = month;
    }
    if (limit) {
        params.limit = limit;
    }
    const response = await axiosInstance.get(
        `${REPORT_URL}/revenue/customers/monthly`,
        {
            params,
        }
    );
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getRevenueByCustomerYearly = async ({ year, limit } = {}) => {
    const params = {};
    if (year) {
        params.year = year;
    }
    if (limit) {
        params.limit = limit;
    }
    const response = await axiosInstance.get(
        `${REPORT_URL}/revenue/customers/yearly`,
        {
            params,
        }
    );
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};
