"use client";

import React, { useState } from "react";
import Image from "next/image";
import DefaultProductImage from "../../../assets/images/defaultProduct.jpg";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  img: string;
  title: string;
  subtitle: string;
  rating: string;
  reviews: string;
  oldPrice: string;
  newPrice: string;
  discount?: number;
  // Additional props for cart functionality
  productId: string;
  price: number;
  offerPrice: number;
  companyId: string;
  productImage?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  img,
  title,
  subtitle,
  rating,
  reviews,
  oldPrice,
  newPrice,
  discount,
  // Cart props
  productId,
  price,
  offerPrice,
  companyId,
  productImage,

  
}) => {
  const [imageSrc, setImageSrc] = useState(img || productImage || DefaultProductImage.src);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToCart } = useCart();

  console.log(productId,"product id..!",id,'id..!')

const handleAddToCart = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsAddingToCart(true);
  try {
    console.log("=== ADD TO CART CLICKED ===");
    console.log("Product ID from props:", productId);
    console.log("Product ID from id prop:", id);
    console.log("All props:", { id, productId, price, offerPrice, companyId });
    
    // Use productId if available, otherwise fall back to id
    const actualProductId = productId || id;
    console.log("Using product ID:", actualProductId);
    
    if (!actualProductId) {
      throw new Error("No product ID available");
    }
    
    await addToCart(actualProductId, 1);
    console.log("✅ Product added to cart successfully!");
    
    // Optional: Show success message
    // You can add a toast notification here
    
  } catch (error: any) {
    console.error("❌ Failed to add to cart:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    
    // Show user-friendly error message
    alert(`Failed to add to cart: ${error.message}`);
    console.log(error.message, "error message.!")
  } finally {
    setIsAddingToCart(false);
  }
};

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    try {
      await addToCart(id, 1);
      // Redirect to cart page after adding
      window.location.href = '/cart';
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // You can add API call to update wishlist here
    console.log(`${isWishlisted ? 'Removed from' : 'Added to'} wishlist:`, id);
  };

  const handleCardClick = () => {
    // Navigate to product detail page
    window.location.href = `/products/${id}`;
  };

  // Calculate actual discount percentage
  const actualPrice = parseFloat(oldPrice.replace('₹', '')) || price;
  const discountedPrice = parseFloat(newPrice.replace('₹', '')) || offerPrice;
  const calculatedDiscount = actualPrice > discountedPrice 
    ? Math.round(((actualPrice - discountedPrice) / actualPrice) * 100)
    : discount || 0;

  return (
    <div className="youmightlikecard" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="card topcard3">
        {/* Product Image */}
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

          {/* Discount Badge */}
          {calculatedDiscount > 0 && (
            <div 
              className="discount-badge" 
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 2
              }}
            >
              {calculatedDiscount}% OFF
            </div>
          )}

          {/* Wishlist & Cart icons */}
          <div 
            className="icons" 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 2
            }}
          >
            {/* Wishlist Icon */}
            <button
              onClick={toggleWishlist}
              style={{
                background: isWishlisted ? '#ff4444' : 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isWishlisted ? '#ff4444' : 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isWishlisted ? '#ff4444' : 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill={isWishlisted ? "white" : "currentColor"}
                className="wishlisttop bi bi-suit-heart-fill"
                viewBox="0 0 16 16"
              >
                <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
              </svg>
            </button>

            {/* Cart Icon */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                opacity: isAddingToCart ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!isAddingToCart) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAddingToCart) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              {isAddingToCart ? (
                <div 
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ccc',
                    borderTop: '2px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              ) : (
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
            {rating} <span className="star3" style={{ color: '#ffc107' }}>★</span> ({reviews})
          </h5>
          <div className="row row-2" style={{ alignItems: 'center' }}>
            <div className="col-6">
              {oldPrice && parseFloat(oldPrice.replace('₹', '')) > parseFloat(newPrice.replace('₹', '')) && (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#6c757d', fontSize: '14px' }}>
                    {oldPrice}
                  </span>{' '}
                  <span style={{ color: '#1a7c3f', fontWeight: 'bold', fontSize: '16px' }}>{newPrice}</span>
                </>
              )}
              {(!oldPrice || parseFloat(oldPrice.replace('₹', '')) <= parseFloat(newPrice.replace('₹', ''))) && (
                <span style={{ color: '#1a7c3f', fontWeight: 'bold', fontSize: '16px' }}>{newPrice}</span>
              )}
            </div>
            <div className="col-6 d-flex justify-content-end">
              <button 
                className="btn topbtn3"
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 0',
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