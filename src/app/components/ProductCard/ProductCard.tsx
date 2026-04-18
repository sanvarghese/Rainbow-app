"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DefaultProductImage from "../../../assets/images/defaultProduct.jpg";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  id: string;
  img?: string;
  title: string;
  subtitle: string;
  rating?: string;
  reviews?: string;
  oldPrice?: string;
  newPrice: string;
  discount?: number;
  productId: string;
  price: number;
  offerPrice: number;
  companyId?: string;
  productImage?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  img,
  title,
  subtitle,
  rating = "4.7",
  reviews = "120",
  oldPrice,
  newPrice,
  discount,
  productId,
  price,
  offerPrice,
  companyId,
  productImage,
}) => {
  const [imageSrc, setImageSrc] = useState(img || productImage || DefaultProductImage.src);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { wishlist, addToWishlist, isInWishlist, fetchWishlist } = useWishlist();

  const actualProductId = String(productId || id);
  const hasMounted = useRef(false);

  console.log(wishlist,"wishlist from product card..!")
  // Add this useEffect temporarily to debug
useEffect(() => {
  console.log('=== Wishlist Debug ===');
  console.log('Product ID:', actualProductId);
  console.log('Wishlist items:', wishlist.items);
  console.log('Is in wishlist function result:', isInWishlist(actualProductId));
  console.log('Wishlist loading:', wishlist.loading);
  console.log('Current isWishlisted state:', isWishlisted);
}, [actualProductId, wishlist.items, isInWishlist, wishlist.loading]);

  // Fetch wishlist on mount if needed
  useEffect(() => {
    if (!hasMounted.current && wishlist.items.length === 0 && !wishlist.loading) {
      fetchWishlist();
    }
    hasMounted.current = true;
  }, []);

  // Sync wishlist status - THIS IS THE CRITICAL PART
  useEffect(() => {
    if (!actualProductId) return;
    
    // Don't update while loading
    if (wishlist.loading) {
      setIsLoading(true);
      return;
    }

    // Check if product is in wishlist
    const inWishlist = isInWishlist(actualProductId);
    
    console.log(`🔍 Product ${actualProductId} - In wishlist: ${inWishlist}`);
    console.log(`📋 Current wishlist items:`, wishlist.items.map(item => String(item.productId)));
    
    setIsWishlisted(inWishlist);
    setIsLoading(false);
  }, [actualProductId, wishlist.items, wishlist.loading, isInWishlist]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actualProductId || isTogglingWishlist || wishlist.loading) return;

    setIsTogglingWishlist(true);
    const previousState = isWishlisted;
    
    // Optimistic update
    setIsWishlisted(!previousState);

    try {
      await addToWishlist(actualProductId);
      
      // Force a refresh of the wishlist to ensure consistency
      await fetchWishlist();
      
      // After refresh, sync again
      setTimeout(() => {
        const newState = isInWishlist(actualProductId);
        setIsWishlisted(newState);
      }, 100);
      
    } catch (error: any) {
      console.error("Wishlist toggle error:", error);
      // Revert on error
      setIsWishlisted(previousState);
      alert(error.message || "Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actualProductId) return;
    setIsAddingToCart(true);
    try {
      await addToCart(actualProductId, 1);
    } catch (error: any) {
      alert(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actualProductId) return;
    setIsAddingToCart(true);
    try {
      await addToCart(actualProductId, 1);
      window.location.href = '/cart';
    } catch (error: any) {
      alert("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCardClick = () => {
    window.location.href = `/shop/${id}`;
  };

  const actualOldPrice = oldPrice ? parseFloat(oldPrice.replace('₹', '')) : price;
  const actualNewPrice = parseFloat(newPrice.replace('₹', '')) || offerPrice;
  const calculatedDiscount = actualOldPrice > actualNewPrice
    ? Math.round(((actualOldPrice - actualNewPrice) / actualOldPrice) * 100)
    : (discount || 0);

  // Show loading state while checking wishlist
  if (isLoading) {
    return (
      <div className="youmightlikecard" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="card topcard3">
          <div className="cardimgdiv3" style={{ position: 'relative', height: '200px', background: '#f0f0f0' }} />
          <div className="card-body">
            <div style={{ height: '60px', background: '#f0f0f0' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="youmightlikecard" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="card topcard3">
        <div className="cardimgdiv3" style={{ position: 'relative' }}>
          <Image
            className="topimg3"
            src={imageSrc}
            alt={title}
            width={200}
            height={200}
            style={{ objectFit: "cover", width: '100%', height: '200px' }}
            onError={() => setImageSrc(DefaultProductImage.src)}
          />

          {calculatedDiscount > 0 && (
            <div className="discount-badge" style={{
              position: 'absolute', top: '10px', left: '10px',
              backgroundColor: '#007F27', color: 'white',
              padding: '4px 8px', borderRadius: '4px',
              fontSize: '12px', fontWeight: 'bold', zIndex: 2
            }}>
              {calculatedDiscount}% OFF
            </div>
          )}

          <div className="icons" style={{
            position: 'absolute', top: '10px', right: '10px',
            display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2
          }}>
            {/* Wishlist Button - RED when active, GREEN when not */}
            <button
              onClick={toggleWishlist}
              disabled={isTogglingWishlist || wishlist.loading}
              style={{
                background: isWishlisted ? '#ff4444' : '#007F27',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isTogglingWishlist || wishlist.loading) ? 'not-allowed' : 'pointer',
                opacity: (isTogglingWishlist || wishlist.loading) ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {(isTogglingWishlist || wishlist.loading) ? (
                <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                  <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                </svg>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              style={{
                background: '#007F27',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                opacity: isAddingToCart ? 0.6 : 1,
              }}
            >
              {isAddingToCart ? (
                <div style={{ width: '16px', height: '16px', border: '2px solid #ccc', borderTop: '2px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 4 1 1 0 0 1 0-4m7 0a1 1 0 1 1 0 4 1 1 0 0 1 0-4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="card-body">
          <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            {subtitle}
          </h2>
          <h6 className="subheading3" style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            {title}
          </h6>
          <h5 className="card-text" style={{ fontSize: '14px', marginBottom: '12px' }}>
            {rating} ★ ({reviews})
          </h5>

          <div className="row row-2" style={{ alignItems: 'center' }}>
            <div className="col-6">
              {oldPrice && actualOldPrice > actualNewPrice ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#6c757d', fontSize: '14px' }}>
                    {oldPrice}
                  </span>{' '}
                  <span style={{ color: '#007F27', fontWeight: 'bold', fontSize: '16px' }}>
                    {newPrice}
                  </span>
                </>
              ) : (
                <span style={{ color: '#007F27', fontWeight: 'bold', fontSize: '16px' }}>
                  {newPrice}
                </span>
              )}
            </div>

            <div className="col-6 d-flex justify-content-end">
              <button
                className="btn topbtn3"
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                style={{
                  backgroundColor: '#007F27',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  opacity: isAddingToCart ? 0.6 : 1,
                  cursor: isAddingToCart ? 'not-allowed' : 'pointer'
                }}
              >
                <b>{isAddingToCart ? 'Adding...' : 'Buy Now'}</b>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;