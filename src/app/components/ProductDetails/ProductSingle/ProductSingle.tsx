"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FaStar, FaRegHeart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import "./productenter.css";

import product1 from "../../../../assets/images/product_1.png";
import productmain from "../../../../assets/images/product_main.png";
import product2 from "../../../../assets/images/card_2.png";
import product3 from "../../../../assets/images/card_3.png";
import product4 from "../../../../assets/images/card_4.png";
import megasale from "../../../../assets/images/megasale.png";

interface Product {
  _id: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;
  productImage?: string;
  price: number;
  offerPrice: number;
  quantity: number;
  category: string;
  subCategory: string;
  foodType?: string;
  isApproved: boolean;
  discount: number;
  company: {
    _id: string;
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
  const { addToCart } = useCart();

  console.log(productId, "productId from product details page.!")

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await res.json();
        
        if (data.success) {
          setProduct(data.product);
        } else {
          throw new Error(data.error || 'Product not found');
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product._id, quantity);
      console.log("Product added to cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      await addToCart(product._id, quantity);
      // Redirect to cart page after adding
      window.location.href = '/cart';
    } catch (err) {
      console.error("Failed to proceed with buy now:", err);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    try {
      await fetch(`/api/wishlist/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
        }),
      });
      console.log("Added to wishlist");
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    }
  };

  if (loading) {
    return (
      <section className="product-page mt-3">
        <div className="product-container">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading product...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-page mt-3">
        <div className="product-container">
          <div className="text-center py-5">
            <h4>Product not found</h4>
            <p>The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </section>
    );
  }

  // Calculate discount percentage
  const discountPercentage = product.discount > 0 ? product.discount : 
    (product.price > product.offerPrice 
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : 0);

  // Mock features based on product data
  const features = [
    `Category: ${product.category}`,
    `Type: ${product.foodType || 'Vegetarian'}`,
    "Packed hygienically",
    "Fresh spices and masala",
  ];

  return (
    <section className="product-page mt-3">
      <div className="product-container">
        {/* Left thumbnails */}
        <div className="image-column">
          <Image className="thumbnail selected" src={product1} alt="thumb1" />
          <Image className="thumbnail" src={product2} alt="thumb2" />
          <Image className="thumbnail" src={product3} alt="thumb3" />
          <Image className="thumbnail" src={product4} alt="thumb4" />
        </div>

        {/* Main Image */}
        <div className="main-image-section">
          <Image 
            className="main-image" 
            src={product.productImage || productmain} 
            alt={product.name}
            width={400}
            height={400}
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Product Details */}
        <div className="product-details">
          <h2 className="product-title">{product.name}</h2>
          <div className="rating-line">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="stars" />
            ))}
            <span className="rating-score">4.7 Star Rating</span>
            <span className="product-id">
              | SKU: <strong>{product._id.slice(-6).toUpperCase()}</strong>
            </span>
          </div>
          <span className="stock-status">
            {product.quantity > 0 ? "IN STOCK" : "OUT OF STOCK"}
          </span>

          <p className="short-description">{product.descriptionShort}</p>

          <ul className="bullet-description">
            {features.map((feat: string, i: number) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>

          <h6 className="spcl">Special Price</h6>
          <div className="pricing">
            <span className="discounted-price">
              ₹{product.offerPrice.toFixed(2)}
            </span>
            {product.price > product.offerPrice && (
              <span className="original-price">
                ₹{product.price.toFixed(2)}
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="discount-badge">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="quantity-wrapper">
            <label className="quantity-label">Quantity:</label>
            <div className="quantity-control">
              <button
                className="btn btn-outline inc"
                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity">{quantity}</span>
              <button
                className="btn btn-outline dec"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.quantity}
              >
                +
              </button>
            </div>
            {product.quantity > 0 && (
              <small className="stock-info">
                {product.quantity} items available
              </small>
            )}
          </div>

          {/* Buttons */}
          <div className="action-buttons">
            <button 
              className="buy-button" 
              onClick={handleBuyNow}
              disabled={product.quantity === 0}
            >
              Buy Now
            </button>
            <button 
              className="cart-button" 
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
            >
              Add to Cart
            </button>
          </div>

          <button className="wishlist-button" onClick={handleAddToWishlist}>
            <FaRegHeart style={{ marginRight: "5px" }} /> Add to Wishlist
          </button>

          {/* Product Meta */}
          <div className="product-meta">
            <div className="meta-item">
              <strong>Category:</strong> {product.category}
            </div>
            <div className="meta-item">
              <strong>Subcategory:</strong> {product.subCategory}
            </div>
            {product.foodType && (
              <div className="meta-item">
                <strong>Food Type:</strong> {product.foodType}
              </div>
            )}
            <div className="meta-item">
              <strong>Brand:</strong> {product.company?.name || 'Unknown Brand'}
            </div>
          </div>
        </div>

        {/* Right Banner */}
        <div className="right-banner">
          <Image src={megasale} alt="Mega Sale" className="banner-image" />
        </div>
      </div>
    </section>
  );
};

export default ProductSingle;