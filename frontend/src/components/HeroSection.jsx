import React from "react";
import { useNavigate } from "react-router";

export default function HeroSection() {
  const navigate = useNavigate();

  const handleShopCollection = () => {
    // Scroll to products section hoặc navigate
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const handleLearnMore = () => {
    // Có thể navigate đến trang about hoặc scroll
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-[700px] flex items-center bg-linear-to-b from-blue-50/50 via-purple-50/30 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Section - Text Content */}
          <div className="flex flex-col justify-center space-y-8 order-2 lg:order-1">
            {/* Headline */}
            <p className="text-xs lg:text-sm uppercase tracking-[0.2em] text-blue-800 font-bold">
              PRECISION TIMEKEEPING
            </p>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1]">
              <span className="font-serif">Elegance Meets</span>
              <br />
              <span className="font-serif text-blue-900">Innovation</span>
            </h1>

            {/* Body Text */}
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-xl font-light">
              Discover our curated collection of premium electronic watches,
              where Swiss precision meets contemporary design. Each timepiece is
              a masterpiece of engineering and craftsmanship.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleShopCollection}
                className="px-8 py-3.5 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base"
              >
                Shop Collection
              </button>
              <button
                onClick={handleLearnMore}
                className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm lg:text-base"
              >
                Learn More
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8 pt-8 border-t border-gray-200 mt-4">
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  500+
                </p>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 font-light">
                  Premium Watches
                </p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  25k+
                </p>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 font-light">
                  Happy Customers
                </p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  99%
                </p>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 font-light">
                  Satisfaction Rate
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Product Image */}
          <div className="relative flex items-center justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-lg lg:max-w-xl">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900/80 rounded-[2rem] transform rotate-2 opacity-95 shadow-2xl"></div>

              {/* Image container */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-700">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
                  alt="Premium Watch - Elegance Meets Innovation"
                  className="w-full h-auto object-cover aspect-square"
                  onError={(e) => {
                    // Use SVG placeholder instead of external URL
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3EPremium Watch%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Decorative blur elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-purple-500 rounded-full opacity-15 blur-3xl animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
