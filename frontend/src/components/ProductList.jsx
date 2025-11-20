import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "@/api/productAPI";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function ProductList({
  category = null,
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

  useEffect(() => {
    fetchProducts();
  }, [currentPage, category, sortBy, order]);

  const fetchProducts = async () => {
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

      const response = await getProducts(params);
      
      // response.data vì axiosConfig trả về full response object
      const data = response.data || response;
      
      if (data && data.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
      } else {
        setProducts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
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
          {category ? category.name : title}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                index === 0 ||
                index === totalPages - 1 ||
                (index >= currentPage - 1 && index <= currentPage + 1);

              if (!showPage) {
                // Show ellipsis
                if (
                  index === currentPage - 2 ||
                  index === currentPage + 2
                ) {
                  return (
                    <span key={index} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`min-w-10 px-3 py-2 rounded-lg border transition-colors ${
                    currentPage === index
                      ? "bg-red-600 text-white border-red-600"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
