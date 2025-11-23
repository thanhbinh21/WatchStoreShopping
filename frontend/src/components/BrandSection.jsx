import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBrands } from "@/api/brandAPI";
import { Loader2 } from "lucide-react";

export default function BrandSection() {
  const navigate = useNavigate();
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

  // Group brands by first letter
  const groupBrandsByLetter = (brands) => {
    const grouped = {};
    
    brands.forEach((brand) => {
      if (!brand.name) return;
      
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(brand);
    });

    // Sort brands within each letter group
    Object.keys(grouped).forEach((letter) => {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  };

  // Get grouped and sorted brands
  const getGroupedBrands = () => {
    const grouped = groupBrandsByLetter(brands);
    const letters = Object.keys(grouped).sort();
    
    return letters.map((letter) => ({
      letter,
      brands: grouped[letter],
    }));
  };

  // Distribute groups into 3 columns
  const distributeIntoColumns = (groups, numColumns = 3) => {
    const columns = Array.from({ length: numColumns }, () => []);
    
    groups.forEach((group, index) => {
      columns[index % numColumns].push(group);
    });
    
    return columns;
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

  const groupedBrands = getGroupedBrands();
  const columns = distributeIntoColumns(groupedBrands, 3);

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

        {/* Brands List - Alphabetical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-6">
              {column.map((group) => (
                <div key={group.letter} className="mb-6">
                  {/* Letter Header */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    {group.letter}
                  </h3>
                  
                  {/* Brands List */}
                  <ul className="space-y-2">
                    {group.brands.map((brand) => (
                      <li
                        key={brand.id}
                        onClick={() => navigate(`/products?brand=${encodeURIComponent(brand.name)}`)}
                        className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        {brand.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
