import axiosInstance from "./axiosConfig";

const CATEGORY_URL = "/categories";

// Lấy tất cả categories
export const getCategories = async () => {
  try {
    const res = await axiosInstance.get(CATEGORY_URL);
    return res || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};

// Nếu muốn thêm các API khác cho category:
export const getCategoryById = async (id) => {
  try {
    const category = await axiosInstance.get(`${CATEGORY_URL}/${id}`);
    return category;
  } catch (err) {
    console.error(`Error fetching category ${id}:`, err);
    return null;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const newCategory = await axiosInstance.post(CATEGORY_URL, categoryData);
    return newCategory;
  } catch (err) {
    console.error("Error creating category:", err);
    throw err; // Throw error để component có thể handle
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const updatedCategory = await axiosInstance.put(
      `${CATEGORY_URL}/${id}`,
      categoryData
    );
    return updatedCategory;
  } catch (err) {
    console.error(`Error updating category ${id}:`, err);
    throw err; // Throw error để component có thể handle
  }
};

export const deleteCategory = async (id) => {
  try {
    await axiosInstance.delete(`${CATEGORY_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting category ${id}:`, err);
    throw err; // Throw error để component có thể handle
  }
};
