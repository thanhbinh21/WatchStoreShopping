import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Navbar from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/api/productAPI";
import { getCategories } from "@/api/categoryAPI";
import { getBrands } from "@/api/brandAPI";
import { addToCart } from "@/api/cartAPI";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Star,
  Heart,
  Clock,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category");
  const brandName = searchParams.get("brand");
  const searchQuery = searchParams.get("search");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(12);

  // Filter states
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Sort options
  const sortOptions = [
    {
      id: "popular",
      label: "Phổ biến",
      icon: Star,
      sortBy: "id",
      order: "desc",
    },
    {
      id: "newest",
      label: "Mới nhất",
      icon: Clock,
      sortBy: "id",
      order: "desc",
    },
    {
      id: "priceAsc",
      label: "Giá Thấp - Cao",
      icon: TrendingUp,
      sortBy: "price",
      order: "asc",
    },
    {
      id: "priceDesc",
      label: "Giá Cao - Thấp",
      icon: TrendingUp,
      sortBy: "price",
      order: "desc",
    },
  ];

  const [activeSortId, setActiveSortId] = useState("popular");

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (categoryId) {
      const category = categories.find((c) => c.id === parseInt(categoryId));
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId, categories]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryId, brandName, searchQuery, sortBy, order]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(
        Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        order: order,
      };

      if (categoryId) {
        const category = categories.find((c) => c.id === parseInt(categoryId));
        if (category?.name) {
          params.category = category.name;
        }
      }

      if (brandName) {
        params.brand = brandName;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await getProducts(params);
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

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
      });
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  const handleSortChange = (option) => {
    setSortBy(option.sortBy);
    setOrder(option.order);
    setActiveSortId(option.id);
    setCurrentPage(0);
  };

  const handleCategoryFilter = (categoryId) => {
    const params = new URLSearchParams();
    if (categoryId) {
      params.set("category", categoryId);
    }
    // Giữ brand filter nếu có
    if (brandName) {
      params.set("brand", brandName);
    }
    // Giữ search query nếu có
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ""}`);
    setCurrentPage(0);
  };

  const handleBrandFilter = (brandNameParam) => {
    const params = new URLSearchParams();
    if (brandNameParam) {
      params.set("brand", brandNameParam);
    }
    // Giữ category filter nếu có
    if (categoryId) {
      params.set("category", categoryId);
    }
    // Giữ search query nếu có
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ""}`);
    setCurrentPage(0);
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams();
    // Chỉ giữ search query nếu có
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ""}`);
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb
        selectedCategory={selectedCategory}
        currentPage={
          brandName
            ? "Sản phẩm"
            : searchQuery
            ? `Tìm kiếm: ${searchQuery}`
            : "Sản phẩm"
        }
        selectedBrand={brandName ? { name: brandName } : null}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {brandName
              ? `Thương hiệu: ${brandName}`
              : selectedCategory
              ? selectedCategory.name
              : searchQuery
              ? `Kết quả tìm kiếm: "${searchQuery}"`
              : "Tất cả sản phẩm"}
          </h1>
          <p className="text-gray-600">
            {loading
              ? "Đang tải..."
              : `${
                  products.length > 0
                    ? `Có ${products.length} sản phẩm`
                    : "Không tìm thấy sản phẩm"
                }`}
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 text-gray-700 font-medium mb-4"
          >
            <Filter size={20} />
            <span>Bộ lọc</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Filter Content */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            {/* Clear All Filters Button */}
            {(categoryId || brandName) && (
              <div className="mb-6">
                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 hover:border-red-600 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                  <Filter size={16} />
                  <span>Bỏ tất cả bộ lọc</span>
                </button>
              </div>
            )}

            {/* Category Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter size={16} className="text-red-600" />
                Danh mục
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    !categoryId
                      ? "bg-red-600 text-white border-red-600"
                      : "border-gray-300 hover:border-red-600 hover:text-red-600"
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      categoryId === category.id.toString()
                        ? "bg-red-600 text-white border-red-600"
                        : "border-gray-300 hover:border-red-600 hover:text-red-600"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter size={16} className="text-red-600" />
                Thương hiệu
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBrandFilter(null)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    !brandName
                      ? "bg-red-600 text-white border-red-600"
                      : "border-gray-300 hover:border-red-600 hover:text-red-600"
                  }`}
                >
                  Tất cả
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandFilter(brand.name)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      brandName === brand.name
                        ? "bg-red-600 text-white border-red-600"
                        : "border-gray-300 hover:border-red-600 hover:text-red-600"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Sắp xếp theo
              </h3>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        activeSortId === option.id
                          ? "bg-blue-50 text-blue-600 border-blue-600"
                          : "border-gray-300 hover:border-blue-600 hover:text-blue-600"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-red-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <div className="text-gray-400 mb-4">
              <Heart size={64} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              Không tìm thấy sản phẩm nào
            </p>
            <p className="text-gray-400 text-sm">
              Vui lòng thử lại với từ khóa hoặc bộ lọc khác
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    const showPage =
                      index === 0 ||
                      index === totalPages - 1 ||
                      (index >= currentPage - 1 && index <= currentPage + 1);

                    if (!showPage) {
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
