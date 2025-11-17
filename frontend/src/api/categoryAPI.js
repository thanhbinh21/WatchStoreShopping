import axiosInstance from "./axiosConfig";

const CATEGORY_URL = "/categories";

// Lấy tất cả categories
export const getCategories = async () => {
  try {
    const res = await axiosInstance.get(CATEGORY_URL);
    console.log("categoryAPI - Raw response:", res);
    console.log("categoryAPI - Response type:", typeof res);
    console.log("categoryAPI - Is array?", Array.isArray(res));
    
    // axiosConfig interceptor already returns response.data
    // But if it's a string, we need to parse it
    let data = res;
    
    if (typeof res === 'string') {
      console.log("categoryAPI - Response is string, length:", res.length);
      console.log("categoryAPI - First 200 chars:", res.substring(0, 200));
      console.log("categoryAPI - Attempting to parse JSON");
      try {
        data = JSON.parse(res);
        console.log("categoryAPI - Parsed data:", data);
        console.log("categoryAPI - Parsed data type:", typeof data);
        console.log("categoryAPI - Is parsed data array?", Array.isArray(data));
      } catch (parseError) {
        console.error("categoryAPI - Failed to parse JSON:", parseError);
        console.error("categoryAPI - String content:", res);
        return [];
      }
    }
    
    // Return the data (should be array or object)
    return data || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    console.error("Error details:", err.response?.data || err.message);
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
