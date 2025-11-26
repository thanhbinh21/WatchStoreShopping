import React, { useState, useEffect } from "react";
import Navbar from "../components/Breadcrumb.jsx";
import ProductList from "../components/ProductList.jsx";
import HeroSection from "../components/HeroSection.jsx";
import CollectionsSection from "../components/CollectionsSection.jsx";
import { getProducts } from "@/api/productAPI";
import Breadcrumb from "../components/Breadcrumb.jsx";

export const User = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch default products on initial load
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const result = await getProducts({ page: 0, size: 8 });
        const productsList = result?.content || result || [];
        if (Array.isArray(productsList) && productsList.length > 0) {
          setProducts(productsList);
        }
      } catch (error) {
        console.error("Error fetching initial products:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchInitialProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <Breadcrumb onProductsChange={setProducts} />

      {/* Hero Section - Phần 1 */}
      <HeroSection />

      {/* Collections Section - Phần 2 */}
      <CollectionsSection
        onProductsChange={setProducts}
        onCategorySelect={setSelectedCategory}
      />

      {/* Product List Section - Phần 3 */}
      <div id="products-section">
        <ProductList products={products} showViewAll={true} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
