"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FaStar, FaRegHeart } from "react-icons/fa";
import "./productenter.css";


import product1 from "../../../../assets/images/product_1.png";
import productmain from "../../../../assets/images/product_main.png";
import product2 from "../../../../assets/images/card_2.png";
import product3 from "../../../../assets/images/card_3.png";
import product4 from "../../../../assets/images/card_4.png";
import megasale from "../../../../assets/images/megasale.png";

const ProductSingle = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        // Replace this with your real API call
        // const res = await fetch(`/api/products/${id}`);
        // const data = await res.json();
        // setProduct(data);

        setProduct({
          id,
          title: "KOTTHAS KITCHEN Chicken Masala (100g)",
          rating: 4.7,
          sku: "ED4RPB",
          stock: true,
          price: 55,
          originalPrice: 59,
          features: [
            "Ingredient Feature: Vegetarian",
            "Packed hygienic",
            "Spices and masala",
          ],
        });
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    fetchProduct();
  }, [id]);

 
  const updateCartQuantity = async (newQty: number) => {
    setQuantity(newQty);

    try {
      await fetch(`/api/cart/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: newQty }),
      });
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const handleAddToCart = async () => {
    try {
      await fetch(`/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          quantity,
        }),
      });
      console.log("Product added to cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleBuyNow = async () => {
    try {
      await fetch(`/api/cart/buy-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          quantity,
        }),
      });
      console.log("Redirecting to checkout...");
      // Use Next.js navigation
      // router.push("/checkout");
    } catch (err) {
      console.error("Failed to proceed with buy now:", err);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await fetch(`/api/wishlist/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
        }),
      });
      console.log("Added to wishlist");
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    }
  };

  console.log(product, 'product single.!')

//   if (!product) return <div>Loading product...</div>;

   const products ={
          id,
          title: "KOTTHAS KITCHEN Chicken Masala (100g)",
          rating: 4.7,
          sku: "ED4RPB",
          stock: true,
          price: 55,
          originalPrice: 59,
          features: [
            "Ingredient Feature: Vegetarian",
            "Packed hygienic",
            "Spices and masala",
          ],
        };


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
          <Image className="main-image" src={productmain} alt="Main Product" />
        </div>

        {/* Product Details */}
        <div className="product-details">
          <h2 className="product-title">{products.title}</h2>
          <div className="rating-line">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="stars" />
            ))}
            <span className="rating-score">{products.rating} Star Rating</span>
            <span className="product-id">
              | SKU: <strong>{products.sku}</strong>
            </span>
          </div>
          <span className="stock-status">
            {products.stock ? "IN STOCK" : "OUT OF STOCK"}
          </span>

          <ul className="bullet-description">
            {products.features.map((feat: string, i: number) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>

          <h6 className="spcl">Special Price</h6>
          <div className="pricing">
            <span className="discounted-price">
              ₹{products.price.toFixed(2)}
            </span>
            <span className="original-price">
              ₹{products.originalPrice.toFixed(2)}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-wrapper">
            <label className="quantity-label">Quantity:</label>
            <div className="quantity-control">
              <button
                className="btn btn-outline inc"
                onClick={() =>
                  updateCartQuantity(quantity > 1 ? quantity - 1 : 1)
                }
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity">{quantity}</span>
              <button
                className="btn btn-outline dec"
                onClick={() => updateCartQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="action-buttons">
            <button className="buy-button" onClick={handleBuyNow}>
              Buy Now
            </button>
            <button className="cart-button" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>

          <button className="wishlist-button" onClick={handleAddToWishlist}>
            <FaRegHeart style={{ marginRight: "5px" }} /> Add to Wishlist
          </button>
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
