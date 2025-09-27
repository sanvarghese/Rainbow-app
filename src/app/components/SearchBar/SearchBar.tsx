"use client";

import React, { useEffect, useState } from "react";
import "../../../assets/css/SearchBar.css";

import mazhavillu_logo from "../../../assets/images/mazhavillu_logo.png";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";

const SearchBar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // ✅ no window here
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const router = useRouter();

  // ✅ Run only in client
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 958);
    };

    // Run once on mount
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSearch = () => {
    if (isMobile) setShowSearch((prev) => !prev);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/productlist/search?query=${encodeURIComponent(searchText)}`);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category) {
      router.push(`/productlist/category/${encodeURIComponent(category)}`);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const location = e.target.value;
    setSelectedLocation(location);
    if (location) {
      router.push(`/productlist/location/${encodeURIComponent(location)}`);
    }
  };

  return (
    <nav className="bg-white nav-bar-nav shadow-sm px-3 pt-3 py-2 pb-3">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <Link className="fw-bold text-success fs-4 me-2" href="/">
            <Image src={mazhavillu_logo} alt="Logo" height={40} />
          </Link>

          {!isMobile && (
            <form
              className="flex-grow-1 mx-3"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <div className="d-flex align-items-center justify-content-center w-100">
                <div className="input-group w-100 search-input">
                  <select
                    className="form-select flex-shrink-0"
                    style={{ maxWidth: "150px" }}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">All Categories</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                  </select>

                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search for a product or brand..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    aria-label="Search"
                  />

                  <button
                    className="btn btn-success"
                    type="submit"
                    style={{ width: "40px" }}
                  >
                    <Search size={14} />
                  </button>
                </div>

                <div className="ms-2" style={{ maxWidth: "150px" }}>
                  <select
                    className="form-select"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                  >
                    <option value="">All Locations</option>
                    <option value="City Center">City Center</option>
                    <option value="Suburbs">Suburbs</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>
            </form>
          )}

          <div className="d-flex align-items-center gap-3">
            {isMobile && (
              <button
                className="btn btn-link p-0"
                onClick={toggleSearch}
                aria-label="Toggle Search"
              >
                <Search size={20} className="text-dark" />
              </button>
            )}
            <Link href="/wishlist" className="text-dark position-relative">
              <Heart size={20} />
            </Link>
            <Link href="/cart" className="text-dark position-relative">
              <ShoppingCart size={20} />
            </Link>
          </div>
        </div>

        {isMobile && showSearch && (
          <form className="mt-2" role="search" onSubmit={handleSearchSubmit}>
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                aria-label="Search"
              />
              <button
                className="btn btn-success"
                type="submit"
                style={{ width: "40px" }}
              >
                <Search size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </nav>
  );
};

export default SearchBar;
