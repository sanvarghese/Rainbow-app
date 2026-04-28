// app/products/[productId]/page.tsx (UPDATED)
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FaStar, FaRegHeart, FaHeart, FaStarHalfAlt, FaUser, FaCalendarAlt } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSession } from "next-auth/react";
import "./productenter.css";
import { useBuyNow } from "@/context/BuyNowContext";
import ReviewModal from "@/app/components/Review/ReviewModal";
import { Star } from "lucide-react";

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

interface Review {
  _id: string;
  rating: number;
  title?: string;
  review: string;
  name: string;
  images: Array<{ url: string; publicId: string }>;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

const ProductSingle = () => {
  const { productId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "specifications">("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  
  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<any>(null);
  const [checkingReview, setCheckingReview] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  
  const { addToCart, cart } = useCart();
  const { wishlist, addToWishlist, isInWishlist, fetchWishlist } = useWishlist();
  const { setBuyNowItem } = useBuyNow();

  // Check if product is in wishlist
  const isWishlisted = !wishlist.loading && productId && isInWishlist(String(productId));

  // Check if product is in cart
  const isInCart = productId && cart.items.some(item => item.productId._id === String(productId));
  const cartItem = isInCart ? cart.items.find(item => item.productId._id === String(productId)) : null;
  const cartQuantity = cartItem?.quantity || 0;

  // Fetch product details
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

  // Check if user can review this product (similar to ordersPage)
  const checkUserReviewStatus = async () => {
    if (!session || !productId) return;
    
    setCheckingReview(true);
    try {
      // First check if user has any delivered order containing this product
      const response = await fetch(`/api/reviews/check-user-review?productId=${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviewStatus(data);
        if (data.existingReview) {
          setUserReview(data.existingReview);
        }
      }
    } catch (error) {
      console.error('Error checking review status:', error);
      setReviewStatus({ canReview: false });
    } finally {
      setCheckingReview(false);
    }
  };

  useEffect(() => {
    if (session && productId) {
      checkUserReviewStatus();
    }
  }, [session, productId]);

  // Fetch reviews
  const fetchReviews = async (page: number = 1, append: boolean = false) => {
    if (!productId) return;
    
    try {
      setReviewsLoading(true);
      const res = await fetch(`/api/reviews/product/${productId}?page=${page}&limit=5`);
      const data = await res.json();
      
      if (data.success) {
        if (append) {
          setReviews(prev => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
        }
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        setRatingDistribution(data.ratingDistribution);
        setHasMoreReviews(page < data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, false);
  }, [productId]);

  const loadMoreReviews = () => {
    const nextPage = reviewPage + 1;
    setReviewPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
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

      setBuyNowItem(buyNowItemData);
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

  const handleReviewClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    // If user has already reviewed, pass existing review data
    if (userReview) {
      setShowReviewModal(true);
    } 
    // If user can review (has purchased product)
    else if (reviewStatus?.canReview) {
      setShowReviewModal(true);
    }
    // Otherwise, show message or redirect
    else {
      alert('You can only review products you have purchased and received.');
    }
  };

  const handleReviewSuccess = () => {
    // Refresh reviews after successful review submission
    fetchReviews(1, false);
    // Recheck user review status
    checkUserReviewStatus();
    // Refresh the page data
    setShowReviewModal(false);
  };

  // Render star rating component
  const renderStars = (rating: number, size: number = 16) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} size={size} className="text-yellow-400 inline-block" />
        ))}
        {hasHalfStar && <FaStarHalfAlt size={size} className="text-yellow-400 inline-block" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} size={size} className="text-gray-300 inline-block" />
        ))}
      </>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

  // Calculate rating percentage for distribution
  const getRatingPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

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
            <div className="flex items-center gap-1">
              {totalReviews > 0 ? (
                renderStars(averageRating, 16)
              ) : (
                [...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-gray-300" size={16} />
                ))
              )}
            </div>
            <span className="rating-score ml-2">
              {totalReviews > 0 ? `${averageRating.toFixed(1)} out of 5` : 'No ratings yet'}
            </span>
            <span className="product-id ml-2">
              | SKU: <strong>{product._id.slice(-6).toUpperCase()}</strong>
            </span>
          </div>

          <div className="mt-1">
            <span className="text-sm text-gray-600">
              {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
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
            Reviews ({totalReviews})
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
              {/* Rating Summary */}
              {totalReviews > 0 && (
                <div className="rating-summary mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Average Rating */}
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
                      <div className="flex justify-center gap-1 my-2">
                        {renderStars(averageRating, 20)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                    
                    {/* Rating Distribution */}
                    <div>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2 mb-2">
                          <div className="w-12 text-sm">{star} star</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-yellow-400 h-full rounded-full"
                              style={{ width: `${getRatingPercentage(ratingDistribution[star as keyof typeof ratingDistribution])}%` }}
                            />
                          </div>
                          <div className="w-12 text-sm text-gray-600">
                            {ratingDistribution[star as keyof typeof ratingDistribution]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Write/Edit Review Button - Same logic as ordersPage */}
              {session ? (
                checkingReview ? (
                  <div className="mb-6 text-right">
                    <button className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed" disabled>
                      Checking eligibility...
                    </button>
                  </div>
                ) : userReview ? (
                  <div className="mb-6 text-right">
                    <button
                      onClick={handleReviewClick}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <Star className="inline-block w-4 h-4 mr-2" />
                      Update Your Review
                    </button>
                  </div>
                ) : reviewStatus?.canReview ? (
                  <div className="mb-6 text-right">
                    <button
                      onClick={handleReviewClick}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <Star className="inline-block w-4 h-4 mr-2" />
                      Write a Review
                    </button>
                  </div>
                ) : (
                  <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-800 text-sm">
                      You can only review products you have purchased and received.
                    </p>
                  </div>
                )
              ) : (
                <div className="mb-6 text-right">
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    Login to Write a Review
                  </button>
                </div>
              )}
              
              {/* Reviews List */}
              {reviewsLoading && reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item border-b pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FaUser className="text-gray-400" />
                            <span className="font-semibold">{review.name}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            {renderStars(review.rating, 14)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FaCalendarAlt size={12} />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                      
                      {review.title && (
                        <h4 className="font-semibold text-lg mt-2">{review.title}</h4>
                      )}
                      
                      <p className="text-gray-700 mt-2">{review.review}</p>
                      
                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {review.images.map((image, idx) => (
                            <div key={idx} className="relative w-20 h-20 cursor-pointer">
                              <Image
                                src={image.url}
                                alt={`Review image ${idx + 1}`}
                                fill
                                className="object-cover rounded-lg"
                                onClick={() => window.open(image.url, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMoreReviews && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMoreReviews}
                        disabled={reviewsLoading}
                        className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
                      >
                        {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No reviews yet.</p>
                  {session && (reviewStatus?.canReview || userReview) && (
                    <button
                      onClick={handleReviewClick}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Be the first to review!
                    </button>
                  )}
                </div>
              )}
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
                  <tr className="border-b">
                    <td className="py-2 font-semibold">SKU</td>
                    <td className="py-2">{product._id.slice(-8).toUpperCase()}</td>
                  </tr>
                  {totalReviews > 0 && (
                    <tr className="border-b">
                      <td className="py-2 font-semibold">Customer Rating</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          {renderStars(averageRating, 16)}
                          <span>({totalReviews} reviews)</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal - Same as ordersPage */}
      {showReviewModal && productId && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
          }}
          productId={typeof productId === 'string' ? productId : productId[0]}
          orderId={userReview?.orderId || ''}
          productName={product.name}
          productImage={product.productImages?.[0] || ''}
          existingReview={userReview}
          onSuccess={handleReviewSuccess}
        />
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