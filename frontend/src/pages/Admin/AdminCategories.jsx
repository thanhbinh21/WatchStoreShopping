import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categoryAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryTable } from "@/components/Admin/categories/CategoryTable";
import { CategoryDetailPanel } from "@/components/Admin/categories/CategoryDetailPanel";
import { CategoryFormDialog } from "@/components/Admin/categories/CategoryFormDialog";
import { DeleteConfirmDialog } from "@/components/Admin/categories/DeleteConfirmDialog";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PlusIcon, SearchIcon } from "lucide-react";

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDetail, setCategoryDetail] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
      toast.error("Không thể tải danh sách danh mục");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCategoryDetail = useCallback(async (categoryId) => {
    try {
      const res = await getCategoryById(categoryId);
      setCategoryDetail(res);
      setSelectedCategory(res);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết danh mục:", err);
      toast.error("Không thể tải chi tiết danh mục");
    }
  }, []);

  const handleRowClick = (category) => {
    fetchCategoryDetail(category.id);
  };

  const handleCloseDetail = () => {
    setCategoryDetail(null);
    setSelectedCategory(null);
  };

  const handleEdit = async (category) => {
    try {
      const fullCategory = await getCategoryById(category.id);
      setSelectedCategory(fullCategory);
      setFormData({
        name: fullCategory.name,
        description: fullCategory.description || "",
      });
      setIsEditOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin danh mục:", err);
      toast.error("Không thể tải thông tin danh mục");
    }
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      description: "",
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
      await createCategory(formData);
      toast.success("Thêm danh mục thành công");
      setIsAddOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi thêm danh mục:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Không thể thêm danh mục";

      if (err.response?.status === 403) {
        toast.error(
          "Bạn không có quyền thêm danh mục. Vui lòng đăng nhập với tài khoản ADMIN."
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(selectedCategory.id, formData);
      toast.success("Cập nhật danh mục thành công");
      setIsEditOpen(false);
      fetchCategories();

      // Update detail panel if open
      if (categoryDetail?.id === selectedCategory.id) {
        fetchCategoryDetail(selectedCategory.id);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật danh mục";
      toast.error(errorMsg);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      toast.success("Xóa danh mục thành công");
      setIsDeleteOpen(false);

      // Close detail panel if showing deleted category
      if (categoryDetail?.id === selectedCategory.id) {
        handleCloseDetail();
      }

      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err);
      toast.error("Không thể xóa danh mục. Có thể danh mục đang có sản phẩm.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Danh mục
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý danh mục sản phẩm trong cửa hàng
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="size-4" />
          Thêm danh mục
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Category Table */}
        <div
          className={`${categoryDetail ? "xl:col-span-2" : "xl:col-span-3"}`}
        >
          <CategoryTable
            categories={filteredCategories}
            selectedCategory={selectedCategory}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Category Detail Panel */}
        <CategoryDetailPanel
          categoryDetail={categoryDetail}
          onClose={handleCloseDetail}
        />
      </div>

      {/* Add Dialog */}
      <CategoryFormDialog
        isOpen={isAddOpen}
        onClose={setIsAddOpen}
        mode="add"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitAdd}
      />

      {/* Edit Dialog */}
      <CategoryFormDialog
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
        categoryName={selectedCategory?.name}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
