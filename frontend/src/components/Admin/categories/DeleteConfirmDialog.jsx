import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  categoryName,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa danh mục{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {categoryName}
            </span>
            ? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản
            phẩm trong danh mục.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa danh mục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
