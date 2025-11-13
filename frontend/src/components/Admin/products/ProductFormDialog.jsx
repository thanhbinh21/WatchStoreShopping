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
import { useEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

export const ProductFormDialog = ({
  isOpen,
  onClose,
  mode = "add", // 'add' or 'edit'
  formData,
  onChange,
  onSubmit,
}) => {
  const isEditMode = mode === "edit";

  // State for dropdowns
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for image upload
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

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
          setBrands(brandsRes || []);
          setCategories(categoriesRes || []);
          setSuppliers(suppliersRes || []);
        } catch (error) {
          console.error("Error fetching dropdown data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();

      // Handle image preview
      if (isEditMode && formData.imageUrl) {
        setImagePreview(formData.imageUrl);
        setImageFile(null);
      } else {
        setImagePreview(null);
        setImageFile(null);
      }
    } else {
      // Reset image state when closing
      setImagePreview(null);
      setImageFile(null);
    }
  }, [isOpen, isEditMode, formData.imageUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <form onSubmit={onSubmit} className="space-y-4">
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
                  {brands.map((brand) => (
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
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
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
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
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

            {/* Upload hình ảnh */}
            <div className="space-y-2">
              <Label htmlFor={`${mode}-image`}>Hình ảnh sản phẩm</Label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-md object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <label
                  htmlFor={`${mode}-image`}
                  className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="size-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload</span>
                  <input
                    id={`${mode}-image`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Chọn hình ảnh (PNG, JPG, JPEG - tối đa 5MB)
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
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {isEditMode ? "Cập nhật" : "Thêm sản phẩm"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
