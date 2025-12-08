import { useState, useEffect } from "react";
import { adminBannerAPI } from "@/api/cmsAPI";
import { uploadBannerImages, deleteBannerImage } from "@/api/uploadAPI";
import { toast } from "sonner";
import {
  Link as LinkIcon,
  PencilIcon,
  TrashIcon,
  X,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { AdminPagination } from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const AdminBanner = () => {
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [uploading, setUploading] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // {file: File, preview: string} or null
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    description: "",
    displayOrder: 0,
    active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await adminBannerAPI.getAll();
      setBanners(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Load banners error:", error);
      if (error.response?.status === 403) {
        toast.error(
          "Không có quyền truy cập! Vui lòng đăng nhập với tài khoản ADMIN.",
          {
            duration: 5000,
            description: "Thông tin đăng nhập: username=admin, password=123456",
          }
        );
      } else {
        toast.error("Lỗi tải banner");
      }
      setBanners([]);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setForm({ ...banner });
    setSelectedImage(null); // Reset, existing image in imageUrl
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setSelectedImage(null);
    setForm({
      title: "",
      imageUrl: "",
      linkUrl: "",
      description: "",
      displayOrder: 0,
      active: true,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!selectedImage && !form.imageUrl) {
      toast.error("Vui lòng chọn ảnh banner");
      return;
    }

    setUploading(true);
    try {
      let finalImageUrl = form.imageUrl;

      // Upload new image if selected
      if (selectedImage && selectedImage.file) {
        // Delete old image from Cloudinary if updating
        if (editingId && form.imageUrl) {
          try {
            await deleteBannerImage(form.imageUrl);
          } catch (err) {
            console.error("Error deleting old image:", err);
            // Continue even if delete fails
          }
        }

        const result = await uploadBannerImages([selectedImage.file]);
        if (result.success && result.fileNames.length > 0) {
          finalImageUrl = result.fileNames[0]; // Cloudinary URL
        }
      }

      const dataToSave = { ...form, imageUrl: finalImageUrl };

      if (editingId) {
        await adminBannerAPI.update(editingId, dataToSave);
        toast.success("Cập nhật banner thành công");
      } else {
        await adminBannerAPI.create(dataToSave);
        toast.success("Tạo banner thành công");
      }
      setShowForm(false);
      setSelectedImage(null);
      loadBanners();
    } catch (error) {
      toast.error("Lỗi lưu banner");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (banner) => {
    setDeletingBanner(banner);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;

    try {
      // Xóa ảnh trên Cloudinary (cả local path và Cloudinary URL)
      if (deletingBanner.imageUrl) {
        try {
          await deleteBannerImage(deletingBanner.imageUrl);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
          // Tiếp tục xóa banner ngay cả khi xóa ảnh thất bại
        }
      }

      await adminBannerAPI.delete(deletingBanner.id);
      toast.success("Xóa banner thành công");
      setIsDeleteOpen(false);
      setDeletingBanner(null);
      loadBanners();
    } catch (error) {
      toast.error("Lỗi xóa banner");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File vượt quá 5MB");
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setSelectedImage({ file, preview });

    // Reset input
    e.target.value = "";
  };

  // Filter banners based on search and status
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "ACTIVE" && banner.active) ||
      (statusFilter === "INACTIVE" && !banner.active);
    return matchesSearch && matchesStatus;
  });

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanners = filteredBanners.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Banner / Slideshow</h1>
        <button
          onClick={handleNew}
          className="cursor-pointer bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-primary-soft"
        >
          + Tạo banner
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm banner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-[180px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Kích hoạt</option>
            <option value="INACTIVE">Tắt</option>
          </select>
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingId ? "Sửa banner" : "Tạo banner mới"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Cập nhật thông tin banner/slideshow"
                : "Thêm banner mới vào trang chủ"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Link URL{" "}
                  <span className="text-gray-400 text-xs">
                    (ví dụ: /products)
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm({ ...form, linkUrl: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Hình ảnh Banner <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {/* Preview image */}
                {(selectedImage || form.imageUrl) && (
                  <div className="relative">
                    <img
                      src={
                        selectedImage
                          ? selectedImage.preview
                          : form.imageUrl.startsWith("http")
                          ? form.imageUrl
                          : `/images/banners/${form.imageUrl}`
                      }
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedImage) {
                          URL.revokeObjectURL(selectedImage.preview);
                          setSelectedImage(null);
                        }
                        setForm({ ...form, imageUrl: "" });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="text-gray-600">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        {selectedImage || form.imageUrl
                          ? "Thay đổi ảnh"
                          : "Click để chọn ảnh"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG tối đa 5MB. Ảnh sẽ upload lên Cloudinary
                        khi Save.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Mô tả</label>
              <textarea
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Kích hoạt</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Đang upload..."
                  : editingId
                  ? "Cập nhật"
                  : "Tạo mới"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40">
                  Hình ảnh
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-28">
                  Thứ tự
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-36">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedBanners.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Không có banner nào
                  </td>
                </tr>
              ) : (
                paginatedBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={
                          banner.imageUrl.startsWith("http")
                            ? banner.imageUrl
                            : `/images/banners/${banner.imageUrl}`
                        }
                        alt={banner.title}
                        className="h-20 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {banner.title}
                      </div>
                      {banner.linkUrl && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                          <LinkIcon className="size-3" />
                          {banner.linkUrl}
                        </div>
                      )}
                      {banner.description && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                          {banner.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {banner.displayOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                          banner.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {banner.active ? "Kích hoạt" : "Tắt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(banner);
                          }}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <PencilIcon className="size-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(banner);
                          }}
                          className="hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="size-4 text-red-600 dark:text-red-400" />
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
        itemName={deletingBanner?.title}
        onConfirm={confirmDelete}
        title="Xác nhận xóa banner"
      />
    </div>
  );
};
