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

// Upload ảnh banner
export const uploadBannerImages = async (files) => {
  try {
    const formData = new FormData();

    // Thêm tất cả files vào FormData
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Get token from localStorage
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(`${UPLOAD_URL}/banner-images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error uploading banner images:", err);
    throw err;
  }
};

// Xóa ảnh banner
export const deleteBannerImage = async (filename) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.delete(
      `${UPLOAD_URL}/banner-images/${filename}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error deleting banner image:", err);
    throw err;
  }
};

// Upload ảnh bài viết (cover image)
export const uploadPostImages = async (files) => {
  try {
    const formData = new FormData();

    // Thêm tất cả files vào FormData
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    // Get token from localStorage
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(`${UPLOAD_URL}/post-images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error uploading post images:", err);
    throw err;
  }
};

// Xóa ảnh bài viết
export const deletePostImage = async (filename) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.delete(
      `${UPLOAD_URL}/post-images/${filename}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error deleting post image:", err);
    throw err;
  }
};

// Upload avatar image for user
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${UPLOAD_URL}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error uploading avatar:", err);
    throw err;
  }
};

// Delete avatar (if you want to support removing files)
export const deleteAvatar = async (filename) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(
      `${UPLOAD_URL}/post-images/${filename}`,
      {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error deleting avatar:", err);
    throw err;
  }
};
