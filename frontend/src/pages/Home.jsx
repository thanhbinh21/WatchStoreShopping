import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollectionsSection from "@/components/CollectionsSection";
import SaleBanner from "@/components/SaleBanner";
import BrandSection from "@/components/BrandSection";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import { addToCart } from "@/api/cartAPI";
import { parseStoredUser } from "@/utils/storage";

export const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");

  const handleProductsChange = (newProducts, category = null) => {
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
    setSelectedBrand(null); // Clear brand selection when category is selected
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedCategory(null); // Clear category selection when brand is selected
  };

  const handleAddToCart = async (productId) => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();

    if (!token || !user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      // Chuyển đến trang login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    try {
      await addToCart(user.id, productId, 1);
      toast.success("Đã thêm vào giỏ hàng ✅");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Navbar for search and categories */}
      <Navbar onProductsChange={handleProductsChange} />

      {/* Hero Section */}
      <HeroSection />

      {/* Sale Banner - Products on Sale */}
      <SaleBanner onAddToCart={handleAddToCart} />

      {/* Brand Section */}
      <BrandSection onBrandSelect={handleBrandSelect} />

      {/* Collections Section */}
      {/* <CollectionsSection 
        onProductsChange={handleProductsChange}
        onCategorySelect={handleCategorySelect}
      /> */}

      {/* Products Section */}
      <section id="products-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ProductList
            category={selectedCategory}
            brand={selectedBrand}
            sortBy={sortBy}
            order={order}
            pageSize={8}
            title={
              selectedBrand
                ? `Sản Phẩm ${selectedBrand.name}`
                : selectedCategory
                ? selectedCategory.name
                : "Sản Phẩm Mới Nhất"
            }
            description={
              selectedBrand
                ? `Khám phá bộ sưu tập đồng hồ ${selectedBrand.name} với thiết kế đẳng cấp và công nghệ tiên tiến`
                : selectedCategory
                ? `Khám phá bộ sưu tập ${selectedCategory.name} với thiết kế đẳng cấp và công nghệ tiên tiến`
                : "Khám phá bộ sưu tập đồng hồ cao cấp với thiết kế đẳng cấp và công nghệ tiên tiến"
            }
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
