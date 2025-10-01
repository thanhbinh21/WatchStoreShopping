import React, { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export const ProductCard = ({ image, name, price, rating, numOfRating }) => {
  const [favorite, setFavorite] = useState(false);
  const favoriteColor = favorite ? "#F93C65" : "#000";

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating); // số sao đầy
    const halfStar = rating % 1 >= 0.5; // sao nửa
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={20} fill="#FFD700" />);
    }

    if (halfStar) {
      stars.push(
        <Star key="half" size={20} fill="url(#halfGradient)" stroke="#FFD700" />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={20} stroke="#ccc" />);
    }

    return stars;
  };

  return (
    <div className="w-[360px] h-[496px] border rounded-2xl overflow-hidden inline-block m-2">
      <img src={image} className="w-full" alt="product" />

      <div className="m-[24px] flex flex-col justify-between h-[132px]">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-bold">{name}</p>
            <p className="text-[#4880FF]">{price}VNĐ</p>

            <div className="flex items-center">
              {renderStars()}
              <span className="ml-2 text-xs">{`(${numOfRating})`}</span>
            </div>
          </div>

          <div
            className="w-[44px] h-[44px] bg-[#F9F9F9] flex justify-center items-center rounded-full cursor-pointer"
            onClick={() => setFavorite(!favorite)}
          >
            <Heart className={cn(`text-[${favoriteColor}]`)} />
          </div>
        </div>

        <Button
          className={cn(
            "bg-[#E2EAF8] hover:bg-[#dbe2ef] text-black cursor-pointer"
          )}
        >
          Add To Cart
        </Button>
      </div>
    </div>
  );
};
