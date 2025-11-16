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

export const CategoryFormDialog = ({
  isOpen,
  onClose,
  mode = "add",
  formData,
  onChange,
  onSubmit,
}) => {
  const isEditMode = mode === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin danh mục"
              : "Điền thông tin để thêm danh mục mới"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tên danh mục */}
          <div className="space-y-2">
            <Label htmlFor={`${mode}-name`}>Tên danh mục *</Label>
            <Input
              id={`${mode}-name`}
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Nhập tên danh mục"
              required
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor={`${mode}-description`}>Mô tả</Label>
            <Textarea
              id={`${mode}-description`}
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Nhập mô tả danh mục..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              {isEditMode ? "Cập nhật" : "Thêm danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
