import axios from "./axiosConfig";

// Banners Admin
export const adminBannerAPI = {
  getAll: () => axios.get("/banners/all"),
  getById: (id) => axios.get(`/banners/${id}`),
  create: (data) => axios.post("/banners", data),
  update: (id, data) => axios.put(`/banners/${id}`, data),
  delete: (id) => axios.delete(`/banners/${id}`),
};

// Banners Public
export const bannerAPI = {
  getActive: () => axios.get("/banners"),
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
