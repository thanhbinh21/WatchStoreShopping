import axiosInstance from "./axiosConfig";

const SUPPLIER_URL = "/suppliers";

// Lấy tất cả suppliers
export const getSuppliers = async () => {
  try {
    const res = await axiosInstance.get(SUPPLIER_URL);
    return res || [];
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    return [];
  }
};

// Lấy supplier theo ID
export const getSupplierById = async (id) => {
  try {
    const supplier = await axiosInstance.get(`${SUPPLIER_URL}/${id}`);
    return supplier;
  } catch (err) {
    console.error(`Error fetching supplier ${id}:`, err);
    return null;
  }
};

// Tạo supplier mới
export const createSupplier = async (supplierData) => {
  try {
    const newSupplier = await axiosInstance.post(SUPPLIER_URL, supplierData);
    return newSupplier;
  } catch (err) {
    console.error("Error creating supplier:", err);
    return null;
  }
};

// Cập nhật supplier
export const updateSupplier = async (id, supplierData) => {
  try {
    const updatedSupplier = await axiosInstance.put(
      `${SUPPLIER_URL}/${id}`,
      supplierData
    );
    return updatedSupplier;
  } catch (err) {
    console.error(`Error updating supplier ${id}:`, err);
    return null;
  }
};

// Xóa supplier
export const deleteSupplier = async (id) => {
  try {
    await axiosInstance.delete(`${SUPPLIER_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting supplier ${id}:`, err);
    return false;
  }
};
