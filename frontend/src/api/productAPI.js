import axiosInstance from "./axiosConfig";

const PRODUCT_URL = "/products";

// Lấy danh sách sản phẩm với phân trang và tìm kiếm
export const getProducts = async (params = {}) => {
  try {
    const {
      page = 0,
      size = 10,
      name = "",
      category = "",
      supplier = "",
      minPrice = null,
      maxPrice = null,
      sortBy = "id",
      order = "asc",
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("size", size);
    if (name) queryParams.append("name", name);
    if (category) queryParams.append("category", category);
    if (supplier) queryParams.append("supplier", supplier);
    if (minPrice !== null) queryParams.append("minPrice", minPrice);
    if (maxPrice !== null) queryParams.append("maxPrice", maxPrice);
    queryParams.append("sortBy", sortBy);
    queryParams.append("order", order);

    const res = await axiosInstance.get(`${PRODUCT_URL}?${queryParams}`);
    return res || { content: [], totalPages: 0 };
  } catch (err) {
    console.error("Error fetching products:", err);
    return { content: [], totalPages: 0 };
  }
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const product = await axiosInstance.get(`${PRODUCT_URL}/${id}`);
    return product;
  } catch (err) {
    console.error(`Error fetching product ${id}:`, err);
    return null;
  }
};

// Tìm kiếm sản phẩm theo tên
export const searchProducts = async (name) => {
  try {
    const products = await axiosInstance.get(`${PRODUCT_URL}/search`, {
      params: { name },
    });
    return products || [];
  } catch (err) {
    console.error("Error searching products:", err);
    return [];
  }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    // Transform data to match backend structure
    const payload = {
      name: productData.name,
      description: productData.description,
      status: productData.status || "ACTIVE",
      brand: { id: Number(productData.brandId) },
      category: { id: Number(productData.categoryId) },
      supplier: { id: Number(productData.supplierId) },
    };

    const newProduct = await axiosInstance.post(PRODUCT_URL, payload);
    return newProduct;
  } catch (err) {
    console.error("Error creating product:", err);
    throw err;
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    // Transform data to match backend structure
    const payload = {
      name: productData.name,
      description: productData.description,
      status: productData.status,
      brand: { id: Number(productData.brandId) },
      category: { id: Number(productData.categoryId) },
      supplier: { id: Number(productData.supplierId) },
    };

    const updatedProduct = await axiosInstance.put(
      `${PRODUCT_URL}/${id}`,
      payload
    );
    return updatedProduct;
  } catch (err) {
    console.error(`Error updating product ${id}:`, err);
    throw err;
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    await axiosInstance.delete(`${PRODUCT_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting product ${id}:`, err);
    throw err;
  }
};
