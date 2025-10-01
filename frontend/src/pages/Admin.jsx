import { ProductCard } from "@/components/Admin/ProductCard";
import { Sidebar } from "@/components/Admin/Sidebar";
import { TopBar } from "@/components/Admin/TopBar";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import productImg from "../assets/images/product.png";

export const Admin = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="flex flex-col h-screen sticky top-0 bg-white border-r overflow-auto">
        <Sidebar
          setCollapsed={setCollapsed}
          collapsed={collapsed}
          logout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <TopBar
            setCollapsed={setCollapsed}
            collapsed={collapsed}
            image={user?.imageUrl || "user.png"}
            name={user?.fullName || "###"}
            role={user?.role || "ADMIN"}
          />
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ProductCard
              image={productImg}
              name={"Test name"}
              price={"1.000.000"}
              rating={4.5}
              numOfRating={135}
            />
            <ProductCard
              image={productImg}
              name={"Test name"}
              price={"1.000.000"}
              rating={4.5}
              numOfRating={135}
            />
            <ProductCard
              image={productImg}
              name={"Test name"}
              price={"1.000.000"}
              rating={4.5}
              numOfRating={135}
            />
            <ProductCard
              image={productImg}
              name={"Test name"}
              price={"1.000.000"}
              rating={4.5}
              numOfRating={135}
            />
            <ProductCard
              image={productImg}
              name={"Test name"}
              price={"1.000.000"}
              rating={4.5}
              numOfRating={135}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
