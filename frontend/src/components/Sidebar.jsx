import { sideBars } from "@/lib/data";
import { useEffect, useRef, useState } from "react";
import { SidebarItem } from "./SidebarItem";

export const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const containerRef = useRef(null);

  const itemHeight = 54; // chiều cao nút + gap

  useEffect(() => {
    setIndicatorTop(activeIndex * itemHeight);
  }, [activeIndex]);

  return (
    <div
      style={{
        width: "240px",
        border: "1px solid #ccc",
      }}
    >
      <h1 className="text-3xl font-bold text-center w-[240px] h-[60px] leading-[60px]">
        Nhóm 8
      </h1>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
          gap: "4px",
          // marginLeft: "50px",
          paddingLeft: "20px",
        }}
      >
        {/* Thanh nền trượt */}
        <div
          style={{
            position: "absolute",
            left: "0px",
            top: indicatorTop,
            height: "50px",
            width: "192px",
            backgroundColor: "#4880FF",
            borderRadius: "6px",
            transition: "top 0.3s ease",
            zIndex: 0,
            left: "20px",
          }}
        ></div>

        {/* Thanh indicator bên trái trượt */}
        <div
          style={{
            position: "absolute",
            left: "0px",
            top: indicatorTop,
            height: "50px",
            width: "4px",
            backgroundColor: "#4880FF",
            borderRadius: "0 4px 4px 0",
            transition: "top 0.3s ease",
            zIndex: 1,
          }}
        ></div>

        {/* Danh sách sidebar */}
        {sideBars.map((item, index) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            icon={item.icon}
            isActive={activeIndex === index}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
