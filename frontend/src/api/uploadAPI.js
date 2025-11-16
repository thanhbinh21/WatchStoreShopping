import axios from "axios";

const UPLOAD_URL = "http://localhost:8080/api/upload";

// Upload nhiều ảnh sản phẩm
export const uploadProductImages = async (files) => {
  try {
    const formData = new FormData();

    // Thêm tất cả files vào FormData
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Get token from localStorage
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(
      `${UPLOAD_URL}/product-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Error uploading images:", err);
    throw err;
  }
};

// Xóa ảnh sản phẩm
export const deleteProductImage = async (filename) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.delete(
      `${UPLOAD_URL}/product-images/${filename}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error deleting image:", err);
    throw err;
  }
};
