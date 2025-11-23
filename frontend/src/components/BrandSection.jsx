import React, { useEffect, useState } from "react";
import { getBrands } from "@/api/brandAPI";
import { Loader2 } from "lucide-react";

export default function BrandSection({ onBrandSelect }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("BrandSection: Starting to fetch brands...");
      const data = await getBrands();

      console.log("BrandSection: Received data from API:", data);
      console.log("BrandSection: Data type:", typeof data);
      console.log("BrandSection: Is array?", Array.isArray(data));

      // Handle different response formats
      let brandsList = [];

      if (Array.isArray(data)) {
        brandsList = data;
        console.log(
          "BrandSection: Using array directly, length:",
          brandsList.length
        );
      } else if (data && typeof data === "object") {
        if (Array.isArray(data.data)) {
          brandsList = data.data;
          console.log(
            "BrandSection: Found data.data array, length:",
            brandsList.length
          );
        } else if (Array.isArray(data.content)) {
          brandsList = data.content;
          console.log(
            "BrandSection: Found data.content array, length:",
            brandsList.length
          );
        } else {
          console.log(
            "BrandSection: Data is object but not array, keys:",
            Object.keys(data)
          );
        }
      }

      console.log("BrandSection: Final brands list:", brandsList);
      console.log("BrandSection: Final brands list length:", brandsList.length);

      if (brandsList.length > 0) {
        console.log("BrandSection: First brand sample:", brandsList[0]);
      }

      setBrands(brandsList);
    } catch (error) {
      console.error("BrandSection: Error fetching brands:", error);
      console.error("BrandSection: Error response:", error.response);
      setError(error.message || "Không thể tải thương hiệu");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brand) => {
    // Select brand
    if (onBrandSelect) {
      onBrandSelect({ id: brand.id, name: brand.name });
    }

    // Scroll to products section
    setTimeout(() => {
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // Default logo placeholder
  const getBrandLogo = (brand) => {
    if (brand.logoUrl) {
      return brand.logoUrl;
    }
    // SVG placeholder
    return (
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='80'%3E%3Crect width='150' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3E" +
      encodeURIComponent(brand.name || "Brand") +
      "%3C/text%3E%3C/svg%3E"
    );
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          </div>
        </div>
      </section>
    );
  }

  // Hiển thị error state để debug
  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-2">Lỗi: {error}</p>
            <p className="text-gray-500">
              Không thể tải thương hiệu. Vui lòng kiểm tra console để xem chi
              tiết.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Hiển thị empty state để debug nếu không có brands
  if (!brands || brands.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              Chưa có thương hiệu nào được tải.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Vui lòng kiểm tra console để xem chi tiết. Response có thể đang
              được xử lý.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <p className="text-sm lg:text-base uppercase tracking-[0.2em] text-gray-500 font-semibold mb-3">
            THƯƠNG HIỆU
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Thương Hiệu Nổi Tiếng
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá các thương hiệu đồng hồ uy tín và chất lượng hàng đầu thế
            giới
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 lg:gap-8">
          {brands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => handleBrandClick(brand)}
              className="group cursor-pointer bg-white rounded-xl border-2 border-gray-200 hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg p-6 flex flex-col items-center justify-center"
            >
              {/* Brand Logo */}
              <div className="relative w-full h-24 mb-4 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={getBrandLogo(brand)}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='80'%3E%3Crect width='150' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3E" +
                      encodeURIComponent(brand.name || "Brand") +
                      "%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Brand Name */}
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center group-hover:text-purple-600 transition-colors">
                {brand.name}
              </h3>

              {/* Brand Description (optional, only if exists) */}
              {brand.description && (
                <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                  {brand.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
