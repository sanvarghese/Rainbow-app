"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./LatestProducts.css";

// Import fallback image
import fallbackImg from "../../../../assets/images/card_1.png";

interface Variant {
  _id: string;
  variantType: string;
  variantValue: string;
  displayValue: string;
  quantity: number;
  price: number;
  offerPrice: number;
}

interface Product {
  _id: string;
  name: string;
  descriptionShort: string;
  productImages: string[];
  price: number;
  offerPrice: number;
  quantity: number;
  hasVariants: boolean;
  variants?: Variant[];
  category: string;
  subCategory: string;
  foodType?: string;
  badges?: string;
  companyId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

const LatestProducts: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('/api/products-list/latest');
        const data = await response.json();

        console.log(data, 'data from fetchLatestProducts..!')

        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      setScrollPosition(scrollLeft);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const container = carouselRef.current;
    const scrollAmount = 320;

    if (container) {
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const handleScroll = () => {
    updateScrollButtons();
  };

  // Drag-to-scroll logic
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.cursor = 'grabbing';
    carouselRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    if (carouselRef.current) {
      isDragging.current = false;
      carouselRef.current.style.cursor = 'grab';
      carouselRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseUp = () => {
    if (carouselRef.current) {
      isDragging.current = false;
      carouselRef.current.style.cursor = 'grab';
      carouselRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleCardClick = (productId: string) => {
    router.push(`/singleproduct/${productId}`);
  };

  const getProductPrice = (product: Product) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      return {
        price: firstVariant.price,
        offerPrice: firstVariant.offerPrice
      };
    }
    return {
      price: product.price,
      offerPrice: product.offerPrice
    };
  };

  const getDisplayName = (product: Product) => {
    const companyName = product.companyId?.name || "Store";
    return companyName;
  };

  const getDiscountPercentage = (price: number, offerPrice: number) => {
    if (price > offerPrice && price > 0) {
      return Math.round(((price - offerPrice) / price) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <section className="latest-products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Products</h2>
            <div className="title-underline"></div>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading latest products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="latest-products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Products</h2>
            <div className="title-underline"></div>
          </div>
          <div className="text-center py-5">
            <p className="text-muted">No products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="latest-products-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Latest Products</h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">Discover our newest arrivals</p>
        </div>

        <div className="carousel-wrapper">
          {canScrollLeft && (
            <button
              className="carousel-nav-btn prev-btn"
              onClick={() => scroll("left")}
              aria-label="Previous products"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div
            className="products-carousel"
            ref={carouselRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {products.map((product) => {
              const { price, offerPrice } = getProductPrice(product);
              const discount = getDiscountPercentage(price, offerPrice);
              const rawImg = product.productImages?.[0];
              const productImage = (typeof rawImg === 'string' && rawImg.trim() !== '') ? rawImg : fallbackImg;
              const rating = product.rating || 4.5;
              const reviewCount = product.reviewCount || 0;

              return (
                <div
                  className="product-item"
                  key={product._id}
                  onClick={() => handleCardClick(product._id)}
                >
                  <div className="product-card">
                    <div className="product-image-wrapper">
                      <div className="product-image-container">
                        <Image
                          src={productImage}
                          alt={product.name}
                          className="product-image"
                          width={200}
                          height={200}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            const fallbackSrc = typeof fallbackImg === 'string' ? fallbackImg : fallbackImg.src;
                            if (target && target.src !== fallbackSrc) target.src = fallbackSrc;
                          }}
                        />
                        {discount > 0 && (
                          <div className="discount-tag">
                            {discount}%
                          </div>
                        )}
                        {product.badges && (
                          <div className="badge-tag">
                            {product.badges}
                          </div>
                        )}
                      </div>
                      <div className="action-buttons">
                        <button className="action-btn wishlist-btn" onClick={(e) => e.stopPropagation()}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04096 1.54871 8.5C1.54871 9.95904 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.9379 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12083 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              fill="currentColor"   // ← This was missing
                            />
                          </svg>
                        </button>
                        <button className="action-btn cart-btn" onClick={(e) => e.stopPropagation()}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              fill="currentColor"   // ← This was missing
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-brand">{getDisplayName(product)}</h3>
                      <p className="product-name">{product.name}</p>

                      <div className="product-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : i < rating ? 'half' : ''}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="rating-count">({reviewCount})</span>
                      </div>

                      <div className="product-price">
                        <span className="current-price">₹{offerPrice.toFixed(2)}</span>
                        {price > offerPrice && (
                          <>
                            <span className="original-price">₹{price.toFixed(2)}</span>
                            {/* <span className="discount-percent">({discount}% off)</span> */}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              className="carousel-nav-btn next-btn"
              onClick={() => scroll("right")}
              aria-label="Next products"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestProducts;