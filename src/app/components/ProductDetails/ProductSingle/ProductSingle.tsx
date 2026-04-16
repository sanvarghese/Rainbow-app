"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FaStar, FaRegHeart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import "./productenter.css";

import megasale from "../../../../assets/images/megasale.png";

interface Product {
  _id: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;
  productImages: string[];
  price: number;
  offerPrice: number;
  quantity: number;
  category: string;
  subCategory: string;
  foodType?: string;
  discount: number;
  company: {
    name: string;
    companyLogo?: string;
    description?: string;
  };
}

const ProductSingle = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "specifications">("description");

  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setProduct(data.product);
        } else {
          console.error("Product fetch failed:", data.error);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product._id, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product._id, quantity);
    window.location.href = '/cart';
  };

  if (loading) {
    return <div className="text-center py-20">Loading product...</div>;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  const discountPercentage = product.discount || 
    (product.price > product.offerPrice 
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
      : 0);

  const productImages = product.productImages?.length > 0 ? product.productImages : [];

  return (
    <section className="product-page">
      <div className="product-container">
        
        {/* Left Thumbnails */}
        <div className="image-column">
          {productImages.map((img, index) => (
            <div
              key={index}
              className={`thumbnail ${selectedImageIndex === index ? 'selected' : ''}`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image src={img} alt={`thumb-${index}`} width={90} height={90} />
            </div>
          ))}
        </div>

        {/* Main Image */}
        <div className="main-image-section">
          <div className="main-image-wrapper">
            <Image
              src={productImages[selectedImageIndex] || "/placeholder.jpg"}
              alt={product.name}
              fill
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>

          <div className="rating-line">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="star" />
            ))}
            <span className="rating-score">4.7 Star Rating</span>
            <span className="product-id">
              | SKU: <strong>{product._id.slice(-6).toUpperCase()}</strong>
            </span>
          </div>

          <span className={`stock-status ${product.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
            {product.quantity > 0 ? "IN STOCK" : "OUT OF STOCK"}
          </span>

          <p className="short-description">{product.descriptionShort}</p>

          {/* Pricing */}
          <div className="pricing">
            <span className="discounted-price">₹{product.offerPrice.toFixed(2)}</span>
            {product.price > product.offerPrice && (
              <span className="original-price">₹{product.price.toFixed(2)}</span>
            )}
            {discountPercentage > 0 && (
              <span className="discount-badge">{discountPercentage}% OFF</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="quantity-wrapper">
            <label>Quantity:</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.quantity}>+</button>
            </div>
            <small>{product.quantity} items available</small>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="buy-button" onClick={handleBuyNow} disabled={product.quantity === 0}>
              Buy Now
            </button>
            <button className="cart-button" onClick={handleAddToCart} disabled={product.quantity === 0}>
              Add to Cart
            </button>
          </div>

          <button className="wishlist-button" onClick={() => alert("Added to wishlist")}>
            <FaRegHeart /> Add to Wishlist
          </button>

          {/* Meta Info */}
          <div className="product-meta">
            <div><strong>Category:</strong> {product.category}</div>
            <div><strong>Subcategory:</strong> {product.subCategory}</div>
            <div><strong>Brand:</strong> {product.company?.name}</div>
          </div>
        </div>

        {/* Right Banner */}
        {/* <div className="right-banner">
          <Image src={megasale} alt="Mega Sale" />
        </div> */}

      </div>

      {/* Tabs Section */}
      <div className="tabs-container">

        {/* <div className="tabs">
          <button className={activeTab === "description" ? "active" : ""} onClick={() => setActiveTab("description")}>
            Description
          </button>
          <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>
            Reviews
          </button>
          <button className={activeTab === "specifications" ? "active" : ""} onClick={() => setActiveTab("specifications")}>
            Specifications
          </button>
        </div> */}

        {/* <div className="tab-content">
          {activeTab === "description" && (
            <div className="description-content">
              <h3>Product Description</h3>
              <div dangerouslySetInnerHTML={{ __html: product.descriptionLong || product.descriptionShort }} />
            </div>
          )}
          {activeTab === "reviews" && <p>Reviews coming soon...</p>}
          {activeTab === "specifications" && <p>Specifications coming soon...</p>}
        </div> */}
      </div>
    </section>
  );
};

export default ProductSingle;