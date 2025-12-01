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
    <section className="py-14 lg:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-1 text-[11px] lg:text-xs uppercase tracking-[0.25em] text-red-600 shadow-sm shadow-red-100">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Thương hiệu
          </p>
          <h2 className="mt-4 text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-slate-900">
            Thương hiệu đồng hồ
            <span className="block text-red-600 font-bold mt-1">
              chuẩn mực & uy tín
            </span>
          </h2>
          <p className="mt-4 text-slate-700 text-base lg:text-lg max-w-2xl mx-auto">
            Lựa chọn những tên tuổi hàng đầu thế giới, từ phong cách cổ điển
            sang trọng đến hiện đại đẳng cấp, phù hợp cho mọi phong cách của
            bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_260px] gap-10 lg:gap-12 items-start">
          {/* Brands List - Alphabetical */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-red-50 via-white to-transparent shadow-[0_0_0_1px_rgba(248,113,113,0.25)]" />
            <div className="relative rounded-3xl bg-white/70 backdrop-blur-sm p-5 sm:p-6 lg:p-7">
              <div className="max-h-[480px] lg:max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {columns.map((column, columnIndex) => (
                    <div key={columnIndex} className="space-y-5">
                      {column.map((group) => (
                        <div key={group.letter} className="mb-1">
                          {/* Letter Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-sm font-semibold shadow-sm shadow-red-200">
                              {group.letter}
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-red-200 to-transparent" />
                          </div>

                          {/* Brands List */}
                          <ul className="space-y-1.5">
                            {group.brands.map((brand) => (
                              <li
                                key={brand.id}
                                onClick={() =>
                                  navigate(
                                    `/products?brand=${encodeURIComponent(
                                      brand.name
                                    )}`
                                  )
                                }
                                className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[15px] text-slate-700 cursor-pointer transition-all duration-150 hover:bg-red-50 hover:text-red-600"
                              >
                                <span className="truncate group-hover:translate-x-0.5">
                                  {brand.name}
                                </span>
                                <span className="text-[11px] uppercase tracking-wide text-slate-400 group-hover:text-red-500 group-hover:translate-x-0.5">
                                  Xem
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side highlight / info card */}
          <div className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-rose-700 text-rose-50 p-6 sm:p-7 lg:p-8 shadow-xl shadow-red-200">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red-400/40 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-16 h-48 w-48 rounded-full bg-rose-400/30 blur-3xl" />

              <div className="relative">
              <p className="text-xs uppercase tracking-[0.25em] text-rose-100/80 mb-3">
                  Cam kết chính hãng
                </p>
                <h3 className="text-xl lg:text-2xl font-semibold tracking-tight mb-3">
                  Hơn {brands.length} thương hiệu
                </h3>
              <p className="text-sm lg:text-[15px] text-rose-50/90 leading-relaxed mb-5">
                  Mỗi thương hiệu được tuyển chọn kỹ càng về nguồn gốc, chế độ
                  bảo hành và giá trị thẩm mỹ, mang đến cho bạn trải nghiệm mua
                  sắm yên tâm và đẳng cấp.
                </p>

              <div className="grid grid-cols-2 gap-3 text-xs lg:text-[11px] uppercase tracking-[0.16em] text-rose-100/90">
                <div className="rounded-2xl border border-rose-200/70 bg-rose-500/20 px-3 py-3 flex flex-col gap-1">
                  <span className="text-rose-100/80">Bảo hành</span>
                  <span className="text-[13px] lg:text-sm font-medium text-white">
                      Lên đến 5 năm
                    </span>
                  </div>
                <div className="rounded-2xl border border-rose-200/70 bg-rose-500/20 px-3 py-3 flex flex-col gap-1">
                  <span className="text-rose-100/80">Đổi trả</span>
                  <span className="text-[13px] lg:text-sm font-medium text-white">
                      Hỗ trợ trong 7 ngày
                    </span>
                  </div>
                <div className="rounded-2xl border border-rose-200/70 bg-rose-500/20 px-3 py-3 flex flex-col gap-1 col-span-2">
                  <span className="text-rose-100/80">Tư vấn chọn thương hiệu</span>
                  <span className="text-[13px] lg:text-sm font-medium text-white">
                      Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn tìm chiếc đồng
                      hồ phù hợp nhất.
                    </span>
                  </div>
                </div>
              </div>
            </div>

          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 py-3 text-xs lg:text-sm text-red-700">
            <span className="font-medium text-red-800">Mẹo nhỏ:</span> Nhấn vào
            tên thương hiệu để xem toàn bộ bộ sưu tập đồng hồ đang có sẵn.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
