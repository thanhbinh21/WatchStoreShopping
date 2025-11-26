import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "@/api/productAPI";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function ProductList({
  category = null,
  brand = null,
  sortBy = "id",
  order = "desc",
  pageSize = 12,
  title = "Sản Phẩm",
  description = "Khám phá bộ sưu tập đồng hồ cao cấp",
  onAddToCart,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Reset to page 0 when category, brand, sortBy, or order changes
  useEffect(() => {
    setCurrentPage(0);
  }, [category, brand, sortBy, order]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        order: order,
      };

      if (category?.name) {
        params.category = category.name;
      }

      if (brand?.name) {
        params.brand = brand.name;
      }

      const response = await getProducts(params);

      // response.data vì axiosConfig trả về full response object
      const data = response.data || response;

      if (data && data.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, category, brand, sortBy, order, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Scroll to top
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {brand ? `Sản Phẩm ${brand.name}` : category ? category.name : title}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Pagination Info and Controls */}
      {totalPages > 0 && (
        <div className="mt-12 space-y-4">
          {/* Pagination Info */}
          <div className="text-center text-sm text-gray-600">
            {totalElements > 0 ? (
              <p>
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {currentPage * pageSize + 1}
                </span>
                {" - "}
                <span className="font-semibold text-gray-900">
                  {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>
                {" trong tổng số "}
                <span className="font-semibold text-gray-900">
                  {totalElements}
                </span>
                {" sản phẩm"}
              </p>
            ) : (
              <p>Không có sản phẩm nào</p>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Trước</span>
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                {[...Array(totalPages)].map((_, index) => {
                  // Show all pages if total pages <= 7
                  if (totalPages <= 7) {
                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`min-w-10 px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === index
                            ? "bg-brand-primary text-white border-brand-pribg-brand-primary font-semibold"
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                        aria-current={
                          currentPage === index ? "page" : undefined
                        }
                      >
                        {index + 1}
                      </button>
                    );
                  }

                  // For more than 7 pages, show: first, last, current, and adjacent pages
                  const isFirstPage = index === 0;
                  const isLastPage = index === totalPages - 1;
                  const isCurrentPage = index === currentPage;
                  const isAdjacentPage =
                    index === currentPage - 1 || index === currentPage + 1;

                  const showPage =
                    isFirstPage ||
                    isLastPage ||
                    isCurrentPage ||
                    isAdjacentPage;

                  if (showPage) {
                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`min-w-10 px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === index
                            ? "bg-brand-primary text-white border-brand-primary font-semibold"
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                        aria-current={
                          currentPage === index ? "page" : undefined
                        }
                      >
                        {index + 1}
                      </button>
                    );
                  }

                  // Show ellipsis
                  if (index === currentPage - 2 || index === currentPage + 2) {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-3 py-2 text-gray-500 flex items-center"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
