import axios from "./axiosConfig";

// Banners Admin
export const adminBannerAPI = {
  getAll: async () => {
    const response = await axios.get("/banners/all");
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`/banners/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axios.post("/banners", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.put(`/banners/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/banners/${id}`);
    return response.data;
  },
};

// Banners Public
export const bannerAPI = {
  getActive: async () => {
    const response = await axios.get("/banners");
    return response.data;
  },
};

export const cmsAPI = {
  admin: {
    banners: adminBannerAPI,
  },
  public: {
    banners: bannerAPI,
  },
};

export default cmsAPI;
