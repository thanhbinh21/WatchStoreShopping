import React from "react";
import { useNavigate } from "react-router";
import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb({ selectedCategory, currentPage }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Home size={16} />
            <span>Trang chủ</span>
          </button>
          
          {currentPage && (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-gray-900 font-medium">{currentPage}</span>
            </>
          )}
          
          {selectedCategory && !currentPage && (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-gray-900 font-medium">{selectedCategory.name}</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
