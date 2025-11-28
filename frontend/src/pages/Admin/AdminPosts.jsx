import { useState, useEffect } from "react";
import { adminPostAPI, adminPostCategoryAPI } from "@/api/cmsAPI";
import { uploadPostImages, deletePostImage } from "@/api/uploadAPI";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { AdminPagination } from "@/components/Pagination";

export const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  // filters
  const [searchTitle, setSearchTitle] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    summary: "",
    coverImageUrl: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    status: "DRAFT",
    categoryId: "",
    tags: "",
  });

  // Pagination (1-indexed for AdminPagination component)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadPosts();
  }, [page, searchTitle, categoryFilter, statusFilter, createdFrom, createdTo]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // API uses 0-indexed pages, so subtract 1
      const filters = {
        title: searchTitle || undefined,
        categoryId: categoryFilter || undefined,
        status: statusFilter || undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
      };

      const response = await adminPostAPI.getAll(
        page - 1,
        10,
        "createdAt",
        "DESC",
        filters
      );
      console.log("Posts response:", response);

      // Check if response is paginated (Spring Data Page)
      if (response && response.content !== undefined) {
        // Paginated response - sort by createdAt descending (newest first)
        const sortedContent = (response.content || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sortedContent);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        // Array response - sort by createdAt descending (newest first)
        const sortedPosts = response.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sortedPosts);
        setTotalPages(1);
      } else {
        console.error("Unexpected response format:", response);
        setPosts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Load posts error:", error);
      if (error.response?.status === 403) {
        toast.error(
          "Không có quyền truy cập! Vui lòng đăng nhập với tài khoản ADMIN.",
          {
            duration: 5000,
            description: "Thông tin đăng nhập: username=admin, password=123456",
          }
        );
      } else {
        toast.error("Lỗi: Không thể tải bài viết");
      }
      setPosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminPostCategoryAPI.getAll();
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      content: post.content || "",
      summary: post.summary || "",
      coverImageUrl: post.coverImageUrl || "",
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywords: post.seoKeywords || "",
      status: post.status || "DRAFT",
      categoryId: post.postCategory?.id || "",
      tags: post.tags || "",
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      content: "",
      summary: "",
      coverImageUrl: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      status: "DRAFT",
      categoryId: "",
      tags: "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    try {
      const data = {
        ...form,
        categoryId: form.categoryId || null,
      };

      if (editingId) {
        await adminPostAPI.update(editingId, data);
        toast.success("Cập nhật bài viết thành công");
      } else {
        await adminPostAPI.create(data);
        toast.success("Tạo bài viết thành công");
      }

      setShowForm(false);
      loadPosts();
    } catch (error) {
      console.error("Save post error:", error);
      console.error("Error response:", error.response);
      if (error.response?.status === 403) {
        toast.error(
          "Không có quyền thực hiện thao tác này. Vui lòng kiểm tra token.",
          {
            duration: 5000,
          }
        );
      } else {
        toast.error(editingId ? "Lỗi cập nhật bài viết" : "Lỗi tạo bài viết");
      }
    }
  };

  const handleCoverImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const result = await uploadPostImages(files);

      if (result.success && result.fileNames && result.fileNames.length > 0) {
        const uploadedFileName = result.fileNames[0];
        setForm({
          ...form,
          coverImageUrl: `/images/posts/${uploadedFileName}`,
        });
        toast.success("Upload ảnh bìa thành công");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi upload ảnh bìa");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (post) => {
    setDeletingPost(post);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPost) return;

    try {
      // Auto-delete cover image if it's a local file
      if (
        deletingPost.coverImageUrl &&
        deletingPost.coverImageUrl.startsWith("/images/posts/")
      ) {
        const filename = deletingPost.coverImageUrl.split("/").pop();
        try {
          await deletePostImage(filename);
        } catch (err) {
          console.error("Error deleting cover image:", err);
        }
      }

      await adminPostAPI.delete(deletingPost.id);
      toast.success("Xóa bài viết thành công");
      setIsDeleteOpen(false);
      setDeletingPost(null);
      loadPosts();
    } catch (error) {
      toast.error("Lỗi xóa bài viết");
      console.error(error);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
        <button
          onClick={handleNew}
          className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-primary-soft"
        >
          + Tạo bài viết
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-gray-500 mb-1">Tiêu đề</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={searchTitle}
            onChange={(e) => {
              setSearchTitle(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tiêu đề..."
          />
        </div>

        <div className="min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            <option value="PUBLISHED">Xuất bản</option>
            <option value="DRAFT">Nháp</option>
            <option value="HIDDEN">Ẩn</option>
          </select>
        </div>

        <div className="min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={createdFrom}
            onChange={(e) => {
              setCreatedFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={createdTo}
            onChange={(e) => {
              setCreatedTo(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="ml-auto">
          <Button
            onClick={() => {
              setSearchTitle("");
              setCategoryFilter("");
              setStatusFilter("");
              setCreatedFrom("");
              setCreatedTo("");
              setPage(1);
            }}
            className="px-3 py-2 cursor-pointer"
          >
            Clear filters
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="Để trống để tự động tạo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tóm tắt</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows="2"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nội dung *
              </label>
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(value) => setForm({ ...form, content: value })}
                modules={quillModules}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ảnh bìa
                </label>
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    {uploading ? (
                      <div className="text-center">
                        <div className="text-brand-primary mb-1">
                          Đang upload...
                        </div>
                      </div>
                    ) : form.coverImageUrl ? (
                      <div className="relative w-full h-full p-2">
                        <img
                          src={form.coverImageUrl}
                          alt="Preview"
                          className="w-full h-full object-contain rounded"
                          onError={(e) => {
                            try {
                              e.currentTarget.onerror = null;
                              const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect fill='#e2e8f0' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94a3b8' font-size='16'>Image Error</text></svg>`;
                              e.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                                svg
                              )}`;
                              // eslint-disable-next-line no-unused-vars
                            } catch (err) {
                              e.currentTarget.src = "";
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600">
                          Click để upload ảnh
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Hoặc dán URL ảnh"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.coverImageUrl}
                    onChange={(e) =>
                      setForm({ ...form, coverImageUrl: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Danh mục
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (phân cách bởi dấu phẩy)
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="đồng hồ, thời trang, phụ kiện"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm({ ...form, seoTitle: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  SEO Description
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm({ ...form, seoDescription: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.seoKeywords}
                  onChange={(e) =>
                    setForm({ ...form, seoKeywords: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Trạng thái
              </label>
              <select
                className="border rounded px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="DRAFT">Nháp</option>
                <option value="PUBLISHED">Xuất bản</option>
                <option value="HIDDEN">Ẩn</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingId ? "Cập nhật" : "Tạo mới"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40">
                      Danh mục
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-28">
                      Lượt xem
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-36">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {posts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Không có bài viết nào
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate max-w-md">
                            {post.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {post.postCategory?.name || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                              post.status === "PUBLISHED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : post.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {post.status === "PUBLISHED"
                              ? "Xuất bản"
                              : post.status === "DRAFT"
                              ? "Nháp"
                              : "Ẩn"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {post.viewCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(post.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(post);
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
                                handleDelete(post);
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
              page={page}
              totalPages={totalPages}
              handlePageChange={setPage}
              handlePrev={() => setPage((prev) => Math.max(1, prev - 1))}
              handleNext={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={deletingPost?.title}
        onConfirm={confirmDelete}
        title="Xác nhận xóa bài viết"
      />
    </div>
  );
};
