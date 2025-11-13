import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/productAPI";
import { AdminPagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductTable } from "@/components/Admin/products/ProductTable";
import { ProductDetailPanel } from "@/components/Admin/products/ProductDetailPanel";
import { ProductFormDialog } from "@/components/Admin/products/ProductFormDialog";
import { DeleteConfirmDialog } from "@/components/Admin/products/DeleteConfirmDialog";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PlusIcon, SearchIcon } from "lucide-react";

export const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    rating: 0,
    numOfRating: 0,
  });

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "-";
    // val can be number, string, or BigInt-like; try to coerce
    const num = typeof val === "number" ? val : Number(val);
    if (Number.isNaN(num)) return String(val);
    return num.toLocaleString("vi-VN");
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts({
        page: page - 1,
        size: 10,
        name: searchTerm,
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm:", err);
      toast.error("Không thể tải danh sách sản phẩm");
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const fetchProductDetail = useCallback(async (productId) => {
    try {
      const res = await getProductById(productId);
      setProductDetail(res);
      setSelectedProduct(res);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
      toast.error("Không thể tải chi tiết sản phẩm");
    }
  }, []);

  const handleRowClick = (product) => {
    fetchProductDetail(product.id);
  };

  const handleCloseDetail = () => {
    setProductDetail(null);
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      status: product.status || "ACTIVE",
      brandId: product.brand?.id || product.brand || "",
      categoryId: product.category?.id || product.categoryName || "",
      supplierId: product.supplier?.id || product.supplierName || "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      description: "",
      status: "ACTIVE",
      brandId: "",
      categoryId: "",
      supplierId: "",
    });
    setIsAddOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await createProduct(formData);
      toast.success("Thêm sản phẩm thành công");
      setIsAddOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Không thể thêm sản phẩm";

      if (err.response?.status === 403) {
        toast.error(
          "Bạn không có quyền thêm sản phẩm. Vui lòng đăng nhập với tài khoản ADMIN."
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(selectedProduct.id, formData);
      toast.success("Cập nhật sản phẩm thành công");
      setIsEditOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật sản phẩm";
      toast.error(errorMsg);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      toast.success("Xóa sản phẩm thành công");
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Sản phẩm
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý danh sách sản phẩm trong cửa hàng
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="size-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Product Table */}
        <div className={`${productDetail ? "xl:col-span-2" : "xl:col-span-3"}`}>
          <ProductTable
            products={products}
            selectedProduct={selectedProduct}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatCurrency={formatCurrency}
          />

          {/* Pagination */}
          <div className="mt-4">
            <AdminPagination
              handleNext={handleNext}
              handlePrev={handlePrev}
              handlePageChange={handlePageChange}
              page={page}
              totalPages={totalPages}
            />
          </div>
        </div>

        {/* Product Detail Panel */}
        <ProductDetailPanel
          productDetail={productDetail}
          onClose={handleCloseDetail}
        />
      </div>

      {/* Add Dialog */}
      <ProductFormDialog
        isOpen={isAddOpen}
        onClose={setIsAddOpen}
        mode="add"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitAdd}
      />

      {/* Edit Dialog */}
      <ProductFormDialog
        isOpen={isEditOpen}
        onClose={setIsEditOpen}
        mode="edit"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        productName={selectedProduct?.name}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
