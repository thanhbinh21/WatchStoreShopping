import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const CATEGORY_URL = "/categories";

// Lấy tất cả category
export const getCategories = async () => {
  try {
    const res = await axiosInstance.get("/categories");
    // nếu server trả { data: [...] }
    return res.data; // hoặc return res.data.data nếu nested
  } catch (err) {
    console.error(err);
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
    return null;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const updatedCategory = await axiosInstance.put(`${CATEGORY_URL}/${id}`, categoryData);
    return updatedCategory;
  } catch (err) {
    console.error(`Error updating category ${id}:`, err);
    return null;
  }
};

export const deleteCategory = async (id) => {
  try {
    await axiosInstance.delete(`${CATEGORY_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting category ${id}:`, err);
    return false;
  }
};
