"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../TopSelling/TopSelling.css";

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
  rating?: number; // You might add rating aggregation later
  reviewCount?: number;
}

const TopSelling: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('/api/products-list/latest');
        const data = await response.json();
        
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

  const scroll = (direction: "left" | "right") => {
    const container = carouselRef.current;
    const scrollAmount = 300;

    if (container) {
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
      setScrollPosition(container.scrollLeft);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft);
    }
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
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
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

  // Get product price (handle variants if needed)
  const getProductPrice = (product: Product) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      // Return the first variant's offer price as default
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

  // Get product display name (company name + product name)
  const getDisplayName = (product: Product) => {
    const companyName = product.companyId?.name || "Store";
    return companyName.toUpperCase();
  };

  // Calculate discount percentage
  const getDiscountPercentage = (price: number, offerPrice: number) => {
    if (price > offerPrice && price > 0) {
      return Math.round(((price - offerPrice) / price) * 100);
    }
    return 0;
  };

  // Show loading state
  if (loading) {
    return (
      <section className="top-selling-home mt-3 mb-3">
        <div className="container-fluid" id="top-selling">
          <div className="mb-3">
            <h4 className="top-sellinghead">Latest Products</h4>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading latest products...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no products
  if (products.length === 0) {
    return (
      <section className="top-selling-home mt-3 mb-3">
        <div className="container-fluid" id="top-selling">
          <div className="mb-3">
            <h4 className="top-sellinghead">Latest Products</h4>
          </div>
          <div className="text-center py-5">
            <p>No products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="top-selling-home mt-3 mb-3">
      <div className="container-fluid" id="top-selling">
        <div className="mb-3">
          <h4 className="top-sellinghead">Latest Products</h4>
        </div>

        <div
          className="product-carousel-container"
          ref={carouselRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
        >
          {products.map((product) => {
            const { price, offerPrice } = getProductPrice(product);
            const discount = getDiscountPercentage(price, offerPrice);
            const productImage = product.productImages?.[0] || fallbackImg;
            
            return (
              <div
                className="product-card mt-0"
                key={product._id}
                onClick={() => handleCardClick(product._id)}
                style={{ cursor: "pointer" }}
              >
                <div className="card topcard">
                  <div className="cardimgdiv">
                    <Image
                      src={productImage}
                      alt={product.name}
                      className="topimg"
                      width={200}
                      height={200}
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImg.src;
                      }}
                    />
                    {discount > 0 && (
                      <div className="discount-badge">
                        -{discount}%
                      </div>
                    )}
                    {product.badges && (
                      <div className="product-badge">
                        {product.badges}
                      </div>
                    )}
                    <div className="icons">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="wishlisttop bi bi-suit-heart-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="carttop bi bi-cart-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                      </svg>
                    </div>
                  </div>
                  <div className="card-body">
                    <h2 className="card-title">{getDisplayName(product)}</h2>
                    <h6 className="subheading">{product.name}</h6>
                    <h5 className="card-text">
                      {product.rating || 4.5} <span className="star">★</span> ({product.reviewCount || 0})
                    </h5>
                    <div className="row price row-2">
                      <span className="col-6">
                        ₹{offerPrice.toFixed(2)}
                        {price > offerPrice && (
                          <span>
                            <b> ₹{price.toFixed(2)}</b>
                          </span>
                        )}
                      </span>
                      <div className="col-6 d-flex justify-content-end">
                        <button className="btn topbtn">
                          <b className="buynow">Buy Now</b>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TopSelling;