import React from "react";
import { cn } from "@/lib/utils";

export const SidebarItem = ({ icon, name, isActive, onClick }) => {
  const bgColor = isActive ? "bg-[#4880FF] text-white" : "bg-transparent";
  const iconColor = isActive ? "text-white" : "text-black";

  return (
    <div className="relative" onClick={onClick}>
      {/* Thanh indicator bên trái */}
      {isActive && (
        <div className="absolute top-0 left-[-42px] h-full w-[4px] bg-[#4880FF] rounded-r-lg transition-all duration-300 ease-in-out"></div>
      )}

      {/* icon */}
      <i
        className={cn(
          `las ${icon} ${iconColor} text-3xl absolute top-[10px] left-3`
        )}
      ></i>

      {/* nút */}
      <button
        className={cn(
          `${bgColor} w-[192px] h-[50px] rounded-[6px] transition-colors duration-300 ease-in-out`
        )}
      >
        {name}
      </button>
    </div>
  );
};
