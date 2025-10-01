import React from "react";
import { cn } from "@/lib/utils";

export const SidebarItem = ({ icon, name, isActive, onClick }) => {
  const iconColor = isActive ? "text-white" : "text-black";

  return (
    <div
      className="relative w-[192px] h-[50px] cursor-pointer flex items-center rounded-[6px] z-10"
      onClick={onClick}
    >
      {/* icon */}
      <i
        className={cn(
          `las ${icon} ${iconColor} text-3xl absolute top-[10px] left-3 transition-colors duration-500 ease-in-out`
        )}
      ></i>

      {/* nút */}
      <button
        className={cn(
          `w-full h-full rounded-[6px] transition-colors duration-300 ease-in-out`,
          isActive ? "text-white" : "text-black bg-transparent"
        )}
      >
        {name}
      </button>
    </div>
  );
};
