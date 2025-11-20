import { useState, useEffect } from "react";
import { adminBannerAPI } from "@/api/cmsAPI";
import { uploadBannerImages, deleteBannerImage } from "@/api/uploadAPI";
import { toast } from "sonner";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminBanner = () => {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
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
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
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
    try {
      if (editingId) {
        await adminBannerAPI.update(editingId, form);
        toast.success("Cập nhật banner thành công");
      } else {
        await adminBannerAPI.create(form);
        toast.success("Tạo banner thành công");
      }
      setShowForm(false);
      loadBanners();
    } catch (error) {
      toast.error("Lỗi lưu banner");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa banner này?")) return;
    try {
      const banner = banners.find((b) => b.id === id);
      // Xóa file ảnh nếu là local file
      if (banner?.imageUrl && banner.imageUrl.startsWith("/images/banners/")) {
        const filename = banner.imageUrl.split("/").pop();
        try {
          await deleteBannerImage(filename);
        } catch (err) {
          console.error("Error deleting image file:", err);
        }
      }

      await adminBannerAPI.delete(id);
      toast.success("Xóa banner thành công");
      loadBanners();
    } catch (error) {
      toast.error("Lỗi xóa banner");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const result = await uploadBannerImages(files);
      if (result.success && result.fileNames.length > 0) {
        const imageUrl = `/images/banners/${result.fileNames[0]}`;
        setForm({ ...form, imageUrl });
        toast.success("Upload ảnh thành công");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Banner / Slideshow</h1>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tạo banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Sửa" : "Tạo"} banner
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Link URL</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm({ ...form, linkUrl: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Hình ảnh Banner *
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="text-gray-600">
                        {uploading ? (
                          <span className="text-blue-600">Đang upload...</span>
                        ) : (
                          <>
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
                              Click để upload ảnh
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, JPEG tối đa 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
                <div className="text-sm text-gray-600">
                  Hoặc nhập URL trực tiếp:
                </div>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                />
              </div>
              {form.imageUrl && (
                <div className="mt-3">
                  <img
                    src={
                      form.imageUrl.startsWith("/")
                        ? form.imageUrl
                        : form.imageUrl
                    }
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.style.display = "none";
                      toast.error("Không thể tải ảnh");
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1">Mô tả</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows="2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.checked })
                    }
                  />
                  Kích hoạt
                </label>
              </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  Thứ tự
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {banners.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không có banner nào
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-16 w-24 object-cover rounded border border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {banner.title}
                      </div>
                      {banner.linkUrl && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                          {banner.linkUrl}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {banner.displayOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          banner.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {banner.active ? "Kích hoạt" : "Tắt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(banner);
                          }}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(banner.id);
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
    </div>
  );
};
