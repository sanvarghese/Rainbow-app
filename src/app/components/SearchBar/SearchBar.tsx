"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Search, ShoppingCart, X } from "lucide-react";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import "../../../assets/css/SearchBar.css";
import mazhavillu_logo from "../../../assets/images/mazhavillu_logo.png";

const SearchBar = () => {
  const router = useRouter();
  const {
    query,
    setQuery,
    suggestions,
    loading,
    showSuggestions,
    setShowSuggestions,
    clearSuggestions,
    handleInputChange,
  } = useAutocomplete(300);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 958);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      clearSuggestions();
      setMobileSearchOpen(false);
      // Navigate to shop page with search query
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    clearSuggestions();
    setQuery(suggestion.name);
    setMobileSearchOpen(false);
    // Navigate to shop page with search query
    router.push(`/shop?search=${encodeURIComponent(suggestion.name)}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value.trim();
    setSelectedCategory(category);

    if (category) {
      router.push(`/shop?category=${encodeURIComponent(category)}`, { scroll: false });
    } else {
      router.push('/shop', { scroll: false });
    }
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (!mobileSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <nav className="bg-white nav-bar-nav shadow-sm px-3 pt-3 py-2 pb-3">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <Link className="fw-bold text-success fs-4 me-2" href="/">
            <Image src={mazhavillu_logo} alt="Logo" height={40} />
          </Link>

          {/* Desktop Search with Autocomplete */}
          {!isMobile && (
            <div className="flex-grow-1 mx-3" ref={searchRef}>
              <form role="search" onSubmit={handleSearchSubmit}>
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
                      <option value="Grains">Grains</option>
                      <option value="Spices">Spices</option>
                    </select>

                    <div style={{ position: "relative", flex: 1 }}>
                      <input
                        ref={inputRef}
                        type="search"
                        className="form-control"
                        placeholder="Search for a product or brand..."
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        aria-label="Search"
                      />

                      {query && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            inputRef.current?.focus();
                          }}
                          style={{
                            position: "absolute",
                            right: "45px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#999",
                            cursor: "pointer",
                            zIndex: 5,
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}

                      {/* Autocomplete Dropdown */}
                      {showSuggestions && (query || loading) && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: "white",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            zIndex: 1000,
                            maxHeight: "400px",
                            overflowY: "auto",
                          }}
                        >
                          {loading && (
                            <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                              Loading suggestions...
                            </div>
                          )}

                          {!loading && suggestions.length === 0 && query && (
                            <div style={{ padding: "12px", textAlign: "center" }}>
                              <small>No products found for "{query}"</small>
                              <button
                                type="button"
                                className="btn btn-link btn-sm d-block mx-auto mt-2"
                                onClick={handleSearchSubmit}
                              >
                                Search all products
                              </button>
                            </div>
                          )}

                          {!loading &&
                            suggestions.map((suggestion) => (
                              <div
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "10px 15px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f0f0f0",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "white";
                                }}
                              >
                                <div style={{ flexShrink: 0 }}>
                                  <Image
                                    src={suggestion.image}
                                    alt={suggestion.name}
                                    width={40}
                                    height={40}
                                    style={{ objectFit: "cover", borderRadius: "4px" }}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 500, fontSize: "14px" }}>
                                    {suggestion.name}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#6c757d" }}>
                                    {suggestion.companyName} • {suggestion.category}
                                  </div>
                                  <div style={{ fontSize: "13px", color: "#28a745", fontWeight: 500 }}>
                                    ₹{suggestion.price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <button className="btn btn-success" type="submit" style={{ width: "40px" }}>
                      <Search size={14} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="d-flex align-items-center gap-3">
            {isMobile && (
              <button
                className="btn btn-link p-0"
                onClick={toggleMobileSearch}
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

        {/* Mobile Search Overlay */}
        {isMobile && mobileSearchOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "white",
              zIndex: 1050,
              padding: "60px 15px 15px",
            }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <input
                  ref={inputRef}
                  type="search"
                  className="form-control"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-success" type="submit">
                  <Search size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={toggleMobileSearch}
                >
                  <X size={16} />
                </button>
              </div>
            </form>

            {/* Mobile Suggestions */}
            {(query || loading) && (
              <div style={{ marginTop: "15px", maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}>
                {loading && <div className="text-center p-3">Loading...</div>}
                {!loading &&
                  suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => {
                        handleSuggestionClick(suggestion);
                        toggleMobileSearch();
                      }}
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Image
                          src={suggestion.image}
                          alt={suggestion.name}
                          width={30}
                          height={30}
                          style={{ objectFit: "cover" }}
                        />
                        <div>
                          <div>{suggestion.name}</div>
                          <small className="text-muted">{suggestion.category}</small>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default SearchBar;