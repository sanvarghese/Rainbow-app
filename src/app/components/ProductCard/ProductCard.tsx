// components/ProductCard.tsx
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
  const [imageSrc, setImageSrc] = useState<string>(img || productImage || DefaultProductImage.src);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart, cart } = useCart();
  const { wishlist, addToWishlist, isInWishlist, fetchWishlist } = useWishlist();

  const actualProductId = String(productId || id);
  const hasMounted = useRef(false);

  const isWishlisted = !wishlist.loading && isInWishlist(actualProductId);
  const isInCart = cart.items.some(item => item.productId?._id === actualProductId);

  useEffect(() => {
    if (!hasMounted.current && wishlist.items.length === 0 && !wishlist.loading) {
      fetchWishlist();
    }
    hasMounted.current = true;
  }, [fetchWishlist, wishlist.loading]);

  useEffect(() => {
    setIsLoading(wishlist.loading);
  }, [wishlist.loading]);

  // Keep imageSrc in sync with incoming props and ensure it's never an empty string
  useEffect(() => {
    const src = img || productImage || DefaultProductImage.src;
    setImageSrc(src || DefaultProductImage.src);
  }, [img, productImage]);

  const toggleWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!actualProductId || isTogglingWishlist) return;

    setIsTogglingWishlist(true);
    try {
      await addToWishlist(actualProductId);
    } catch (error: any) {
      alert(error.message || "Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!actualProductId) return;

    setIsAddingToCart(true);

    try {
      await addToCart(actualProductId, 1);

      // ✅ FIXED: Proper typing for style access
      const button = e.currentTarget as HTMLButtonElement;
      if (button) {
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "scale(1)";
        }, 200);
      }
    } catch (error: any) {
      alert(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!actualProductId) return;

    setIsBuyingNow(true);
    try {
      await addToCart(actualProductId, 1);
      window.location.href = "/checkout";
    } catch (error: any) {
      alert("Failed to process. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleCardClick = () => {
    window.location.href = `/shop/${id}`;
  };

  const actualOldPrice = oldPrice ? parseFloat(oldPrice.replace("₹", "")) : price;
  const actualNewPrice = parseFloat(newPrice.replace("₹", "")) || offerPrice;
  const calculatedDiscount =
    actualOldPrice > actualNewPrice
      ? Math.round(((actualOldPrice - actualNewPrice) / actualOldPrice) * 100)
      : (discount || 0);

  if (isLoading) {
    return (
      <div className="youmightlikecard" onClick={handleCardClick} style={{ cursor: "pointer" }}>
        <div className="card topcard3">
          <div className="cardimgdiv3" style={{ position: "relative", height: "200px", background: "#f0f0f0" }} />
          <div className="card-body">
            <div style={{ height: "60px", background: "#f0f0f0" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="youmightlikecard" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <div className="card topcard3">
        <div className="cardimgdiv3" style={{ position: "relative" }}>
          {/* <Image
            className="topimg3"
            src={imageSrc}
            alt={title}
            width={200}
            height={200}
            style={{ objectFit: "cover", width: "100%", height: "200px" }}
            onError={() => setImageSrc(DefaultProductImage.src)}
          /> */}

          <Image
            className="topimg3"
            src={imageSrc || DefaultProductImage.src}
            alt={title}
            width={200}
            height={200}
            style={{ objectFit: "cover", width: "100%", height: "200px" }}
            onError={() => setImageSrc(DefaultProductImage.src)}
            priority={false}
          />

          {calculatedDiscount > 0 && (
            <div className="discount-badge" style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              backgroundColor: "#007F27",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              zIndex: 2,
            }}>
              {calculatedDiscount}% OFF
            </div>
          )}

          <div className="icons" style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 2,
          }}>
            <button
              onClick={toggleWishlist}
              disabled={isTogglingWishlist || wishlist.loading}
              style={{
                background: isWishlisted ? "rgb(223 0 0)" : "#007F27",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: (isTogglingWishlist || wishlist.loading) ? "not-allowed" : "pointer",
              }}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {/* Your heart SVG here */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="card-body">
          <h2 className="card-title" style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
            {subtitle}
          </h2>
          <h6 className="subheading3" style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
            {title}
          </h6>
          <h5 className="card-text" style={{ fontSize: "14px", marginBottom: "12px" }}>
            {rating} ★ ({reviews})
          </h5>

          <div className="row row-2" style={{ alignItems: "center" }}>
            <div className="col-6">
              {oldPrice && actualOldPrice > actualNewPrice ? (
                <>
                  <span style={{ textDecoration: "line-through", color: "#6c757d", fontSize: "14px" }}>
                    {oldPrice}
                  </span>{" "}
                  <span style={{ color: "#007F27", fontWeight: "bold", fontSize: "16px" }}>
                    {newPrice}
                  </span>
                </>
              ) : (
                <span style={{ color: "#007F27", fontWeight: "bold", fontSize: "16px" }}>
                  {newPrice}
                </span>
              )}
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