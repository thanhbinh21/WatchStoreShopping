import React, { useState } from "react";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollectionsSection from "@/components/CollectionsSection";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";

export const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
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
  };

  const handleAddToCart = (productId) => {
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
          <ProductList
            category={selectedCategory}
            sortBy={sortBy}
            order={order}
            pageSize={12}
            title="Sản Phẩm Mới Nhất"
            description="Khám phá bộ sưu tập đồng hồ cao cấp với thiết kế đẳng cấp và công nghệ tiên tiến"
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
