import { ProductCard } from "@/components/Admin/ProductCard";
import productImg from "../assets/images/product.png";
import React from "react";

export const AdminProduct = () => {
  return (
    <div>
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
  );
};
