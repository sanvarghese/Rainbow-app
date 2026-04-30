"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
// import { useAutocomplete } from '@/hooks/useAutocomplete';
import mazhavillu_logo from '../../../assets/images/mazhavillu_logo.png';
import { useAutocomplete } from '@/hooks/useAutocomplete';

interface SearchBarWithAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  redirectToShop?: boolean;
}

const SearchBarWithAutocomplete: React.FC<SearchBarWithAutocompleteProps> = ({
  placeholder = "Search for products...",
  onSearch,
  redirectToShop = true,
}) => {
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
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 958);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      clearSuggestions();
      if (onSearch) {
        onSearch(query);
      } else if (redirectToShop) {
        router.push(`/shop?search=${encodeURIComponent(query)}`);
      } else {
        router.push(`/productlist/search?query=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    clearSuggestions();
    setQuery(suggestion.name);
    if (redirectToShop) {
      router.push(`/shop?search=${encodeURIComponent(suggestion.name)}`);
    } else {
      router.push(suggestion.url);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category) {
      router.push(`/shop?category=${encodeURIComponent(category)}`);
    }
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (!mobileSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      {/* Desktop Search */}
      {!isMobile && (
        <form onSubmit={handleSearchSubmit} className="desktop-search-form">
          <div className="input-group">
            <select
              className="form-select category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ maxWidth: '150px' }}
            >
              <option value="">All Categories</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Dairy">Dairy</option>
              <option value="Grains">Grains</option>
              <option value="Spices">Spices</option>
            </select>

            <div className="autocomplete-wrapper" style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type="search"
                className="form-control"
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                aria-label="Search"
              />
              
              {query && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  style={{
                    position: 'absolute',
                    right: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    zIndex: 10
                  }}
                >
                  <X size={16} />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && (query || loading) && (
                <div className="suggestions-dropdown">
                  {loading && (
                    <div className="suggestion-item loading">
                      <small>Loading suggestions...</small>
                    </div>
                  )}
                  
                  {!loading && suggestions.length === 0 && query && (
                    <div className="suggestion-item no-results">
                      <small>No products found for "{query}"</small>
                      <button 
                        className="btn btn-link btn-sm"
                        onClick={handleSearchSubmit}
                      >
                        Search all products
                      </button>
                    </div>
                  )}
                  
                  {!loading && suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="suggestion-image">
                        <Image 
                          src={suggestion.image} 
                          alt={suggestion.name}
                          width={40}
                          height={40}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-name">{suggestion.name}</div>
                        <div className="suggestion-category text-muted small">
                          {suggestion.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn-success" type="submit">
              <Search size={18} />
            </button>
          </div>
        </form>
      )}

      {/* Mobile Search Toggle */}
      {isMobile && (
        <>
          <button
            className="btn btn-link mobile-search-toggle"
            onClick={toggleMobileSearch}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {mobileSearchOpen && (
            <div className="mobile-search-overlay">
              <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                <div className="input-group">
                  <input
                    ref={inputRef}
                    type="search"
                    className="form-control"
                    placeholder={placeholder}
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

                {/* Mobile Suggestions */}
                {showSuggestions && (query || loading) && (
                  <div className="mobile-suggestions">
                    {loading && <div className="p-2 text-center">Loading...</div>}
                    {!loading && suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="mobile-suggestion-item"
                        onClick={() => {
                          handleSuggestionClick(suggestion);
                          toggleMobileSearch();
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <Image 
                            src={suggestion.image} 
                            alt={suggestion.name}
                            width={30}
                            height={30}
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
              </form>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .autocomplete-wrapper {
          position: relative;
          flex: 1;
        }
        
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .suggestion-item:hover {
          background: #f8f9fa;
        }
        
        .suggestion-image {
          flex-shrink: 0;
        }
        
        .suggestion-content {
          flex: 1;
        }
        
        .suggestion-name {
          font-weight: 500;
          margin-bottom: 2px;
        }
        
        .suggestion-category {
          font-size: 12px;
          color: #6c757d;
        }
        
        .mobile-search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 1050;
          padding: 60px 15px 15px;
        }
        
        .mobile-search-form {
          position: relative;
        }
        
        .mobile-suggestions {
          margin-top: 15px;
          max-height: calc(100vh - 150px);
          overflow-y: auto;
        }
        
        .mobile-suggestion-item {
          padding: 12px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
        }
        
        .mobile-suggestion-item:hover {
          background: #f8f9fa;
        }
        
        .clear-search-btn:hover {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default SearchBarWithAutocomplete;