import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import HeroSection from "@/components/HeroSection";
import CollectionsSection from "@/components/CollectionsSection";
import SaleBanner from "@/components/SaleBanner";
import BrandSection from "@/components/BrandSection";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import BannerSlider from "@/components/BannerSlider";
import LatestPosts from "@/components/LatestPosts";
import { bannerAPI } from "@/api/cmsAPI";
import { addToCart } from "@/api/cartAPI";
import { parseStoredUser } from "@/utils/storage";

export const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");
  const [hasBanners, setHasBanners] = useState(false);

  useEffect(() => {
    const checkBanners = async () => {
      try {
        const response = await bannerAPI.getActive();
        setHasBanners(Array.isArray(response) && response.length > 0);
      } catch {
        setHasBanners(false);
      }
    };
    checkBanners();
  }, []);

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
      <Breadcrumb onProductsChange={handleProductsChange} />

      {/* Banner Slider from CMS */}
      {hasBanners && (
        <div className="px-4 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BannerSlider startIndex={0} />
            <div className="hidden md:block">
              <BannerSlider startIndex={2} />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Sale Banner - Products on Sale */}
      <SaleBanner onAddToCart={handleAddToCart} />

      {/* Brand Section */}
      <BrandSection />

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
            sortBy={sortBy}
            order={order}
            pageSize={8}
            title={
              selectedCategory ? selectedCategory.name : "Sản Phẩm Mới Nhất"
            }
            description={
              selectedCategory
                ? `Khám phá bộ sưu tập ${selectedCategory.name} với thiết kế đẳng cấp và công nghệ tiên tiến`
                : "Khám phá bộ sưu tập đồng hồ cao cấp với thiết kế đẳng cấp và công nghệ tiên tiến"
            }
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      <LatestPosts />

      {/* Footer */}
      <Footer />
    </div>
  );
};
