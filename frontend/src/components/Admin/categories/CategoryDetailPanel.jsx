import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XIcon } from "lucide-react";

export const CategoryDetailPanel = ({ categoryDetail, onClose }) => {
  if (!categoryDetail) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Chi tiết danh mục
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* ID */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ID</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            #{categoryDetail.id}
          </p>
        </div>

        {/* Tên danh mục */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Tên danh mục
          </p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {categoryDetail.name}
          </p>
        </div>

        {/* Mô tả */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mô tả</p>
          <p className="text-base text-gray-700 dark:text-gray-300">
            {categoryDetail.description || "Không có mô tả"}
          </p>
        </div>

        {/* Số sản phẩm */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Số sản phẩm
          </p>
          <Badge variant="secondary" className="text-base">
            {categoryDetail.productCount || 0} sản phẩm
          </Badge>
        </div>

        {/* Danh sách sản phẩm */}
        {categoryDetail.products && categoryDetail.products.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Danh sách sản phẩm
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categoryDetail.products.map((product, index) => (
                <div
                  key={product.id || index}
                  className="text-sm text-gray-700 dark:text-gray-300 py-1 px-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  {product.name || `Sản phẩm #${product.id}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
