import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollectionsSection from "@/components/CollectionsSection";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { getProducts } from "@/api/productAPI";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch products on mount and when page/category changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: "id",
        order: "desc",
      };

      if (selectedCategory?.name) {
        params.category = selectedCategory.name;
      }

      const response = await getProducts(params);
      
      if (response && response.content) {
        setProducts(response.content);
        setTotalPages(response.totalPages || 0);
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

  const handleProductsChange = (newProducts, category = null) => {
    setProducts(newProducts);
    setCurrentPage(0);
    if (category) {
      setSelectedCategory(category);
    }
    // Scroll to products section
    setTimeout(() => {
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Scroll to products section
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleAddToCart = (productId) => {
    // Optional: refresh cart count or show notification
    console.log("Product added to cart:", productId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />
      
      {/* Navbar for search and categories */}
      <Navbar onProductsChange={handleProductsChange} />

      {/* Hero Section */}
      <HeroSection />

      {/* Collections Section */}
      <CollectionsSection 
        onProductsChange={handleProductsChange}
        onCategorySelect={handleCategorySelect}
      />

      {/* Products Section */}
      <section id="products-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {selectedCategory ? selectedCategory.name : "Sản Phẩm Mới Nhất"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá bộ sưu tập đồng hồ cao cấp với thiết kế đẳng cấp và công nghệ tiên tiến
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
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
                              ? "bg-blue-900 text-white border-blue-900"
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
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
