import React from "react";
import { useNavigate } from "react-router";
import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb({
  selectedCategory,
  currentPage,
  postTitle,
  onBackToList,
  selectedBrand,
}) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => {
              // Refresh trang chủ - reload lại trang
              window.location.href = "/home";
            }}
            className="cursor-pointer flex items-center gap-1 text-foreground/60 hover:text-brand-primary transition-colors"
          >
            <Home size={16} />
            <span>Trang chủ</span>
          </button>

          {currentPage && (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              {postTitle && onBackToList ? (
                <button
                  onClick={onBackToList}
                  className="text-foreground/60 hover:text-red-600 transition-colors"
                >
                  {currentPage}
                </button>
              ) : (
                <span className="text-foreground font-medium">
                  {currentPage}
                </span>
              )}
            </>
          )}

          {selectedCategory && !currentPage && !postTitle && !selectedBrand && (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-foreground font-medium">
                {selectedCategory.name}
              </span>
            </>
          )}

          {selectedBrand && currentPage && (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-foreground font-medium">
                {selectedBrand.name}
              </span>
            </>
          )}

          {postTitle && (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-foreground font-medium line-clamp-1">
                {postTitle}
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
