// app/products/[productId]/page.tsx (Fixed)
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import "./productenter.css";
import { useBuyNow } from "@/context/BuyNowContext";

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
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "specifications">("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const { addToCart, cart } = useCart();
  const { wishlist, addToWishlist, isInWishlist, fetchWishlist } = useWishlist();
const { setBuyNowItem, clearBuyNow, isBuyNowMode } = useBuyNow();

  // import { useBuyNow } from '@/context/BuyNowContext';


  // Check if product is in wishlist
  const isWishlisted = !wishlist.loading && productId && isInWishlist(String(productId));

  // Check if product is in cart
  const isInCart = productId && cart.items.some(item => item.productId._id === String(productId));
  const cartItem = isInCart ? cart.items.find(item => item.productId._id === String(productId)) : null;
  const cartQuantity = cartItem?.quantity || 0;

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
    fetchWishlist();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      // Optional: Show success toast/notification
    } catch (error: any) {
      alert(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
  if (!product) return;
  
  setIsBuyingNow(true);
  try {
    // Create buy now item with ONLY this product
    const buyNowItemData = {
      productId: product._id,
      name: product.name,
      subtitle: product.descriptionShort?.substring(0, 100),
      quantity: quantity,
      price: product.price,
      offerPrice: product.offerPrice,
      productImage: product.productImages?.[0] || '',
      totalAmount: (product.offerPrice || product.price) * quantity,
    };
    
    // Set the buy now item (this does NOT affect the cart)
    setBuyNowItem(buyNowItemData);
    
    // Redirect to checkout
    router.push('/check-out');
  } catch (error: any) {
    alert(error.message || "Failed to process. Please try again.");
    setIsBuyingNow(false);
  }
};


  const handleToggleWishlist = async () => {
    if (!productId || isTogglingWishlist) return;
    
    setIsTogglingWishlist(true);
    try {
      await addToWishlist(String(productId));
    } catch (error: any) {
      alert(error.message || "Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Product not found</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const discountPercentage = product.discount || 
    (product.price > product.offerPrice 
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
      : 0);

  const productImages = product.productImages?.length > 0 ? product.productImages : [];
  const isOutOfStock = product.quantity === 0;

  return (
    <section className="product-page">
      <div className="product-container">
        
        {/* Left Thumbnails */}
        {productImages.length > 0 && (
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
        )}

        {/* Main Image */}
        <div className="main-image-section">
          <div className="main-image-wrapper">
            {productImages.length > 0 ? (
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.name}
                fill
                priority
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
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

          <span className={`stock-status ${!isOutOfStock ? 'in-stock' : 'out-stock'}`}>
            {!isOutOfStock ? `IN STOCK (${product.quantity} items left)` : "OUT OF STOCK"}
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
              <button 
                onClick={() => handleQuantityChange(quantity - 1)} 
                disabled={quantity <= 1 || isOutOfStock}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)} 
                disabled={quantity >= product.quantity || isOutOfStock}
              >
                +
              </button>
            </div>
            <small>{product.quantity} items available</small>
          </div>

          {/* Show cart quantity if already in cart */}
          {isInCart && cartQuantity > 0 && (
            <div className="cart-info">
              <span className="text-green-600 text-sm">
                ✓ {cartQuantity} item(s) already in cart
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="buy-button" 
              onClick={handleBuyNow} 
              disabled={isOutOfStock || isBuyingNow}
            >
              {isBuyingNow ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                'Buy Now..!'
              )}
            </button>
            <button 
              className="cart-button" 
              onClick={handleAddToCart} 
              disabled={isOutOfStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </span>
              ) : (
                isInCart ? 'Update Cart' : 'Add to Cart'
              )}
            </button>
          </div>

          {/* Wishlist Button */}
          <button 
            className="wishlist-button" 
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
          >
            {isTogglingWishlist ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 inline-block mr-2"></div>
            ) : isWishlisted ? (
              <FaHeart className="text-red-600 inline-block mr-2" />
            ) : (
              <FaRegHeart className="inline-block mr-2" />
            )}
            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>

          {/* Meta Info */}
          <div className="product-meta">
            <div><strong>Category:</strong> {product.category}</div>
            <div><strong>Subcategory:</strong> {product.subCategory}</div>
            {product.company?.name && (
              <div><strong>Brand:</strong> {product.company.name}</div>
            )}
            {product.foodType && (
              <div>
                <strong>Food Type:</strong> 
                <span className={product.foodType === 'veg' ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                  {product.foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                </span>
              </div>
            )}
          </div>

          {/* Delivery Information */}
          <div className="delivery-info mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Delivery Information</h4>
            <p className="text-sm text-gray-600">
              Free delivery on orders above ₹500<br />
              Estimated delivery: 3-5 business days<br />
              Cash on Delivery available
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      {product.descriptionLong && (
        <div className="tabs-container mt-8">
          <div className="tabs">
            <button 
              className={activeTab === "description" ? "active" : ""} 
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button 
              className={activeTab === "reviews" ? "active" : ""} 
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
            <button 
              className={activeTab === "specifications" ? "active" : ""} 
              onClick={() => setActiveTab("specifications")}
            >
              Specifications
            </button>
          </div>

          <div className="tab-content p-6 border border-t-0 rounded-b-lg">
            {activeTab === "description" && (
              <div className="description-content">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.descriptionLong || product.descriptionShort }} 
                />
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="reviews-content">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
            {activeTab === "specifications" && (
              <div className="specifications-content">
                <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-semibold">Category</td>
                      <td className="py-2">{product.category}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-semibold">Subcategory</td>
                      <td className="py-2">{product.subCategory}</td>
                    </tr>
                    {product.company?.name && (
                      <tr className="border-b">
                        <td className="py-2 font-semibold">Brand</td>
                        <td className="py-2">{product.company.name}</td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="py-2 font-semibold">Stock Status</td>
                      <td className="py-2">{!isOutOfStock ? 'In Stock' : 'Out of Stock'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">SKU</td>
                      <td className="py-2">{product._id.slice(-8).toUpperCase()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .cart-info {
          margin-top: 8px;
        }
        .delivery-info {
          margin-top: 16px;
        }
        .prose {
          line-height: 1.6;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
};

export default ProductSingle;