import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getBrands } from "@/api/brandAPI";
import { getCategories } from "@/api/categoryAPI";
import { getSuppliers } from "@/api/supplierAPI";
import { uploadProductImages } from "@/api/uploadAPI";
import { useEffect, useState } from "react";
import { Loader2, Upload, X, Star } from "lucide-react";
import { toast } from "sonner";

export const ProductFormDialog = ({
  isOpen,
  onClose,
  mode = "add", // 'add' or 'edit'
  formData,
  onChange,
  onSubmit,
  onSubmitWithImages, // New prop to handle submit with images
}) => {
  const isEditMode = mode === "edit";

  // State for dropdowns
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for multiple images
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // State for URL input
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Fetch data for dropdowns
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [brandsRes, categoriesRes, suppliersRes] = await Promise.all([
            getBrands(),
            getCategories(),
            getSuppliers(),
          ]);
          const normalize = (res) =>
            Array.isArray(res)
              ? res
              : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res?.content)
              ? res.content
              : [];

          console.log("Raw suppliers response:", suppliersRes);

          const normalizedBrands = normalize(brandsRes);
          const normalizedCategories = normalize(categoriesRes);
          const normalizedSuppliers = normalize(suppliersRes);

          console.log("Normalized suppliers:", normalizedSuppliers);

          setBrands(normalizedBrands);
          setCategories(normalizedCategories);
          setSuppliers(normalizedSuppliers);
        } catch (error) {
          console.error("Error fetching dropdown data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();

      // Load existing images if edit mode
      if (isEditMode && formData.images) {
        setUploadedImages(
          formData.images.map((img) => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary,
          }))
        );
      } else {
        setUploadedImages([]);
      }
    }
  }, [isOpen, isEditMode, formData.images]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const result = await uploadProductImages(files);

      const newImages = result.fileNames.map((fileName, index) => ({
        imageUrl: fileName,
        isPrimary: uploadedImages.length === 0 && index === 0, // First image is primary if no images exist
      }));

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      toast.success(`Upload thành công ${files.length} ảnh`);

      // Reset input file để có thể chọn lại
      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Product specs local state (array of { name, value })
  const [specs, setSpecs] = useState(
    Array.isArray(formData.productSpecs) ? formData.productSpecs : []
  );

  // Keep specs in sync when formData changes (e.g., when opening edit form)
  useEffect(() => {
    setSpecs(Array.isArray(formData.productSpecs) ? formData.productSpecs : []);
  }, [formData.productSpecs]);

  const emitSpecsChange = (nextSpecs) => {
    setSpecs(nextSpecs);
    // Emit synthetic event to parent onChange so formData gets updated
    if (typeof onChange === "function") {
      onChange({ target: { name: "productSpecs", value: nextSpecs } });
    }
  };

  const addSpec = () => {
    const next = [...specs, { name: "", value: "" }];
    emitSpecsChange(next);
  };

  const updateSpec = (index, field, value) => {
    const next = specs.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    emitSpecsChange(next);
  };

  const removeSpec = (index) => {
    const next = specs.filter((_, i) => i !== index);
    emitSpecsChange(next);
  };

  // Set primary image
  const setPrimaryImage = (index) => {
    setUploadedImages(
      uploadedImages.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    // If removed image was primary and there are other images, set first as primary
    if (uploadedImages[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setUploadedImages(newImages);
  };

  // Add image from URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) {
      toast.error("Vui lòng nhập URL hình ảnh");
      return;
    }

    // Validate URL format (basic check)
    try {
      new URL(imageUrlInput);
    } catch (e) {
      toast.error("URL không hợp lệ");
      return;
    }

    const newImage = {
      imageUrl: imageUrlInput.trim(),
      isPrimary: uploadedImages.length === 0, // First image is primary
    };

    setUploadedImages([...uploadedImages, newImage]);
    setImageUrlInput("");
    toast.success("Đã thêm hình ảnh từ URL");
  };

  // Handle form submit with images
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // If onSubmitWithImages is provided, use it with uploadedImages
    if (onSubmitWithImages) {
      onSubmitWithImages(e, uploadedImages);
    } else {
      // Fallback to regular onSubmit
      onSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin sản phẩm"
              : "Điền thông tin để thêm sản phẩm mới vào cửa hàng"}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Tên sản phẩm */}
            <div className="space-y-2">
              <Label htmlFor={`${mode}-name`}>Tên sản phẩm *</Label>
              <Input
                id={`${mode}-name`}
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            {/* Brand, Category, Supplier */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${mode}-brandId`}>Thương hiệu *</Label>
                <select
                  id={`${mode}-brandId`}
                  name="brandId"
                  value={formData.brandId}
                  onChange={onChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">-- Chọn brand --</option>
                  {(Array.isArray(brands) ? brands : []).map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-categoryId`}>Danh mục *</Label>
                <select
                  id={`${mode}-categoryId`}
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={onChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {(Array.isArray(categories) ? categories : []).map(
                    (category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-supplierId`}>Nhà cung cấp *</Label>
                <select
                  id={`${mode}-supplierId`}
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={onChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">-- Chọn NCC --</option>
                  {(Array.isArray(suppliers) ? suppliers : []).map(
                    (supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Giá và Tồn kho */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${mode}-price`}>Giá sản phẩm (₫) *</Label>
                <Input
                  id={`${mode}-price`}
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price || ""}
                  onChange={onChange}
                  placeholder="VD: 1000000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${mode}-stockQuantity`}>
                  Số lượng tồn kho *
                </Label>
                <Input
                  id={`${mode}-stockQuantity`}
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity || ""}
                  onChange={onChange}
                  placeholder="VD: 100"
                  required
                />
              </div>
            </div>

            {/* Upload nhiều ảnh */}
            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm</Label>

              {/* Uploaded images grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {uploadedImages.map((img, index) => {
                    // Helper to get image src
                    const getImageSrc = (url) => {
                      if (!url) return "";
                      if (url.startsWith("http") || url.startsWith("data:"))
                        return url;
                      return `/images/products/${url}`;
                    };

                    return (
                      <div
                        key={index}
                        className="relative group border-2 rounded-lg overflow-hidden"
                        style={{
                          borderColor: img.isPrimary ? "#10b981" : "#e5e7eb",
                        }}
                      >
                        <img
                          src={getImageSrc(img.imageUrl)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3EError%3C/text%3E%3C/svg%3E";
                          }}
                        />

                        {/* Primary badge */}
                        {img.isPrimary && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                            <Star className="inline size-3 mr-1" />
                            Chính
                          </div>
                        )}

                        {/* Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600"
                              title="Đặt làm ảnh chính"
                            >
                              <Star className="size-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
                            title="Xóa ảnh"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload button */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor={`${mode}-images`}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="size-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading ? "Đang upload..." : "Chọn ảnh"}
                  </span>
                  <input
                    id={`${mode}-images`}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <Loader2 className="size-5 animate-spin text-gray-400" />
                )}
              </div>

              {/* URL Input */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Hoặc nhập URL hình ảnh (http://... hoặc https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="cursor-pointer"
                >
                  Thêm URL
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Chọn nhiều ảnh (PNG, JPG, JPEG - tối đa 5MB/file) hoặc nhập URL
                hình ảnh. Click <Star className="inline size-3" /> để đặt ảnh
                chính.
              </p>
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor={`${mode}-description`}>Mô tả</Label>
              <Textarea
                id={`${mode}-description`}
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Nhập mô tả sản phẩm..."
                rows={3}
              />
            </div>

            {/* Product Specs (key/value pairs) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Thông số kỹ thuật</Label>
                <Button type="button" onClick={addSpec} className="px-2 py-1">
                  Thêm
                </Button>
              </div>

              {specs.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có thông số nào.</p>
              ) : (
                <div className="space-y-2">
                  {specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <input
                        type="text"
                        placeholder="Tên thông số (ví dụ: Màn hình)"
                        value={spec.name || ""}
                        onChange={(e) =>
                          updateSpec(idx, "name", e.target.value)
                        }
                        className="col-span-5 px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Giá trị (ví dụ: 6.1 inch)"
                        value={spec.value || ""}
                        onChange={(e) =>
                          updateSpec(idx, "value", e.target.value)
                        }
                        className="col-span-6 px-3 py-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(idx)}
                        className="col-span-1 text-red-500"
                        title="Xóa thông số"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <Label htmlFor={`${mode}-status`}>Trạng thái *</Label>
              <select
                id={`${mode}-status`}
                name="status"
                value={formData.status}
                onChange={onChange}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
                <option value="DISCONTINUED">Ngừng bán</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
                className={"cursor-pointer"}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={
                  "bg-brand-primary hover:bg-brand-primary-soft cursor-pointer"
                }
              >
                {isEditMode ? "Cập nhật" : "Thêm sản phẩm"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
