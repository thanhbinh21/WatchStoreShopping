import { useState, useEffect } from "react";
import { adminPostCategoryAPI } from "../../api/cmsAPI";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { AdminPagination } from "@/components/Pagination";

export const AdminPostCategory = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminPostCategoryAPI.getAll();
      console.log("Categories response:", response);

      if (Array.isArray(response)) {
        setCategories(response);
      } else {
        console.error("Unexpected response format:", response);
        setCategories([]);
      }
    } catch (error) {
      console.error("Load categories error:", error);
      toast.error(
        "Lỗi: " +
          (error.response?.status === 403
            ? "Không có quyền truy cập"
            : "Không thể tải danh mục")
      );
      setCategories([]);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      displayOrder: cat.displayOrder || 0,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "", displayOrder: 0 });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminPostCategoryAPI.update(editingId, form);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await adminPostCategoryAPI.create(form);
        toast.success("Tạo danh mục thành công");
      }
      setShowForm(false);
      loadCategories();
    } catch (error) {
      toast.error("Lỗi lưu danh mục");
      console.error(error);
    }
  };

  const handleDelete = (cat) => {
    setDeletingCategory(cat);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await adminPostCategoryAPI.delete(deletingCategory.id);
      toast.success("Xóa danh mục thành công");
      setIsDeleteOpen(false);
      setDeletingCategory(null);
      loadCategories();
    } catch (error) {
      toast.error("Lỗi xóa danh mục");
      console.error(error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = categories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh mục bài viết</h1>
        <button
          onClick={handleNew}
          className="cursor-pointer bg-brand-primary text-brand-primary-foreground px-4 py-2 rounded hover:bg-brand-primary-soft"
        >
          + Tạo danh mục
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Sửa" : "Tạo"} danh mục
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block mb-1">Tên danh mục *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Slug</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Mô tả</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-1">Thứ tự hiển thị</label>
              <input
                type="number"
                className="border rounded px-3 py-2"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  Thứ tự
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {cat.name}
                      </div>
                      {cat.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                          {cat.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {cat.displayOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(cat);
                          }}
                        >
                          <PencilIcon className="size-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cat);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <AdminPagination
          page={currentPage}
          totalPages={totalPages}
          handlePageChange={setCurrentPage}
          handlePrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          handleNext={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={deletingCategory?.name}
        onConfirm={confirmDelete}
        title="Xác nhận xóa danh mục"
      />
    </div>
  );
};
