import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/Admin/ProductCard";
import productImg from "../../assets/images/product.png";
import axiosInstance from "@/api/axiosConfig";
import { AdminPagination } from "@/components/Pagination";

export const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get(
          `/products?page=${page - 1}&size=12`
        );
        // res chính là JSON bạn gửi ở trên

        setProducts(res.content); // lấy danh sách sản phẩm
        setTotalPages(res.totalPages); // tổng số trang
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
      }
    };

    fetchProducts();
  }, [page]);

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            image={p.imageUrl ? `/images/${p.imageUrl}` : productImg}
            name={p.name}
            price={p.price.toLocaleString("vi-VN")} // format tiền VNĐ
            rating={p.rating}
            numOfRating={p.numOfRating}
          />
        ))}
      </div>

      {/* Phân trang */}
      {/* <div className="flex justify-center mt-6 space-x-2">
        {[...Array(totalPages).keys()].map((i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded ${
              i === page ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </button>
        ))}
      </div> */}

      <AdminPagination
        handleNext={handleNext}
        handlePrev={handlePrev}
        handlePageChange={handlePageChange}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
};
