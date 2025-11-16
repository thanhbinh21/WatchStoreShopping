import axiosInstance from "./axiosConfig";

const BRAND_URL = "/brands";

// Lấy tất cả brands
export const getBrands = async () => {
  try {
    const res = await axiosInstance.get(BRAND_URL);
    return res || [];
  } catch (err) {
    console.error("Error fetching brands:", err);
    return [];
  }
};

// Lấy brand theo ID
export const getBrandById = async (id) => {
  try {
    const brand = await axiosInstance.get(`${BRAND_URL}/${id}`);
    return brand;
  } catch (err) {
    console.error(`Error fetching brand ${id}:`, err);
    return null;
  }
};

// Tạo brand mới
export const createBrand = async (brandData) => {
  try {
    const newBrand = await axiosInstance.post(BRAND_URL, brandData);
    return newBrand;
  } catch (err) {
    console.error("Error creating brand:", err);
    return null;
  }
};

// Cập nhật brand
export const updateBrand = async (id, brandData) => {
  try {
    const updatedBrand = await axiosInstance.put(
      `${BRAND_URL}/${id}`,
      brandData
    );
    return updatedBrand;
  } catch (err) {
    console.error(`Error updating brand ${id}:`, err);
    return null;
  }
};

// Xóa brand
export const deleteBrand = async (id) => {
  try {
    await axiosInstance.delete(`${BRAND_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting brand ${id}:`, err);
    return false;
  }
};
