import { sideBars } from "@/lib/data";
import { useEffect, useRef, useState } from "react";
import { SidebarItem } from "./SidebarItem";
import { TextAlignJustify } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const Sidebar = ({ setCollapsed, collapsed, logout }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const itemHeight = 54; // chiều cao nút + gap

  // Set activeIndex dựa trên route hiện tại
  useEffect(() => {
    const index = sideBars.findIndex((item) => item.path === location.pathname);
    if (index >= 0) setActiveIndex(index);
  }, [location.pathname]);

  useEffect(() => {
    setIndicatorTop(activeIndex * itemHeight);
  }, [activeIndex]);

  return (
    <div
      style={{
        width: collapsed ? "86px" : "240px",
        border: "1px solid #ccc",
        transition: "width 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center"
        style={{ height: "70px" }}
      >
        {!collapsed ? (
          <h1 className="text-3xl font-bold text-center">Nhóm 8</h1>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-transparent cursor-pointer p-2 hover:bg-gray-200 rounded"
          >
            <TextAlignJustify className="text-black" />
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
          gap: "4px",
          paddingLeft: collapsed ? "8px" : "20px",
          marginLeft: collapsed ? "8px" : "0px",
        }}
      >
        {/* Thanh nền trượt */}
        <div
          style={{
            position: "absolute",
            left: collapsed ? "10px" : "20px",
            top: indicatorTop,
            height: "50px",
            width: collapsed ? "50px" : "192px",
            backgroundColor: "#4880FF",
            borderRadius: "6px",
            transition: "all 0.3s ease",
            zIndex: 0,
          }}
        />

        {/* Thanh indicator bên trái */}
        <div
          style={{
            position: "absolute",
            left: collapsed ? "-8px" : "0px",
            top: indicatorTop,
            height: "50px",
            width: "4px",
            backgroundColor: "#4880FF",
            borderRadius: "0 4px 4px 0",
            transition: "top 0.3s ease",
            zIndex: 1,
          }}
        />

        {/* Danh sách sidebar */}
        {sideBars.map((item, index) => (
          <SidebarItem
            key={item.name}
            name={collapsed ? "" : item.name}
            icon={item.icon}
            isActive={activeIndex === index}
            onClick={() => navigate(item.path)}
            collapsed={collapsed}
          />
        ))}

        <SidebarItem name={"Logout"} icon={"la-power-off"} onClick={logout} />
      </div>
    </div>
  );
};
