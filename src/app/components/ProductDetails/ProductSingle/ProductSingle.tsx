"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  FaStar, FaRegHeart, FaHeart, FaStarHalfAlt, FaUser, FaCalendarAlt,
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSession } from "next-auth/react";
import "./productenter.css";
import { useBuyNow } from "@/context/BuyNowContext";
import ReviewModal from "@/app/components/Review/ReviewModal";
import { Star } from "lucide-react";
import AuthDrawer from "../../AuthDrawer/AuthDrawer";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
  url: string;
  publicId: string;
  _id?: string;
}

interface VariantOption {
  _id: string;
  optionType: "color" | "size" | "custom";
  optionLabel: string;
  colorHex?: string;
  images: ProductImage[];       // array of Cloudinary images
  quantity: number;
  price: number;
  offerPrice: number;
}

interface Variant {
  _id: string;
  variantType: "weight" | "volume" | "size" | "piece" | "pack" | "color" | "custom";
  variantUnit?: string;
  variantValue: string;
  displayValue: string;
  colorHex?: string;
  images: ProductImage[];       // array of Cloudinary images
  quantity: number;
  price: number;
  offerPrice: number;
  options: VariantOption[];
}

interface Product {
  _id: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;
  productImages: ProductImage[];
  price: number;
  offerPrice: number;
  quantity: number;
  category: string;
  subCategory: string;
  childSubCategory?: string;
  foodType?: string;
  discount: number;
  hasVariants: boolean;
  variants?: Variant[];
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcDiscount(price: number, offerPrice: number) {
  return price > offerPrice ? Math.round(((price - offerPrice) / price) * 100) : 0;
}

// ─── Variant selector sub-components ─────────────────────────────────────────

/** Color swatch button */
const ColorChip: React.FC<{
  hex: string;
  label: string;
  selected: boolean;
  outOfStock: boolean;
  onClick: () => void;
}> = ({ hex, label, selected, outOfStock, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={outOfStock}
    title={label}
    style={{
      width: 34,
      height: 34,
      borderRadius: "50%",
      backgroundColor: hex,
      border: selected ? "3px solid #006d21" : "2px solid #ccc",
      boxShadow: selected ? "0 0 0 2px rgba(0,109,33,0.35)" : "none",
      cursor: outOfStock ? "not-allowed" : "pointer",
      opacity: outOfStock ? 0.4 : 1,
      transition: "all 0.15s",
      flexShrink: 0,
    }}
  />
);

/** Text / label pill button (for size, weight, pack, etc.) */
const LabelChip: React.FC<{
  label: string;
  selected: boolean;
  outOfStock: boolean;
  onClick: () => void;
}> = ({ label, selected, outOfStock, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={outOfStock}
    style={{
      padding: "6px 14px",
      borderRadius: 6,
      border: selected ? "2px solid #006d21" : "1px solid #ccc",
      backgroundColor: selected ? "#e9f7ef" : outOfStock ? "#f5f5f5" : "white",
      color: selected ? "#006d21" : outOfStock ? "#aaa" : "#333",
      fontWeight: selected ? 700 : 400,
      fontSize: "0.85rem",
      cursor: outOfStock ? "not-allowed" : "pointer",
      opacity: outOfStock ? 0.5 : 1,
      transition: "all 0.15s",
      whiteSpace: "nowrap",
      textDecoration: outOfStock ? "line-through" : "none",
    }}
  >
    {label}
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────

const ProductSingle = () => {
  const params = useParams();
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
  const router = useRouter();
  const { data: session } = useSession();

  // ── Core state ─────────────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "specifications">("description");

  // ── Variant selection state ────────────────────────────────────────────
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId]   = useState<string | null>(null);

  // ── Action loading states ──────────────────────────────────────────────
  const [isAddingToCart, setIsAddingToCart]     = useState(false);
  const [isBuyingNow, setIsBuyingNow]           = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // ── Review state ───────────────────────────────────────────────────────
  const [reviews, setReviews]                   = useState<Review[]>([]);
  const [averageRating, setAverageRating]        = useState(0);
  const [totalReviews, setTotalReviews]          = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [reviewsLoading, setReviewsLoading]      = useState(true);
  const [reviewPage, setReviewPage]              = useState(1);
  const [hasMoreReviews, setHasMoreReviews]      = useState(true);
  const [showReviewModal, setShowReviewModal]    = useState(false);
  const [reviewStatus, setReviewStatus]          = useState<any>(null);
  const [checkingReview, setCheckingReview]      = useState(false);
  const [userReview, setUserReview]              = useState<any>(null);

  const [authDrawer, setAuthDrawer] = useState<{
    open: boolean;
    pendingAction: "addToCart" | "buyNow" | null;
  }>({ open: false, pendingAction: null });

  const { addToCart, cart }              = useCart();
  const { wishlist, addToWishlist, isInWishlist, fetchWishlist } = useWishlist();
  const { setBuyNowItem }                = useBuyNow();

  // ── Derived: selected variant / option objects ─────────────────────────
  const selectedVariant = useMemo<Variant | null>(() => {
    if (!product?.hasVariants || !product.variants?.length) return null;
    return product.variants.find(v => v._id === selectedVariantId) ?? product.variants[0];
  }, [product, selectedVariantId]);

  const selectedOption = useMemo<VariantOption | null>(() => {
    if (!selectedVariant?.options?.length) return null;
    return selectedVariant.options.find(o => o._id === selectedOptionId) ?? selectedVariant.options[0];
  }, [selectedVariant, selectedOptionId]);

  /**
   * The "active price node" is whichever object holds the price/qty/image
   * that should currently be displayed: option > variant > product-level.
   */
  const activePriceNode = useMemo(() => {
    if (selectedOption)  return selectedOption;
    if (selectedVariant) return selectedVariant;
    return product ? { price: product.price, offerPrice: product.offerPrice, quantity: product.quantity } : null;
  }, [selectedOption, selectedVariant, product]);

  const activePrice     = activePriceNode?.price     ?? 0;
  const activeOfferPrice = activePriceNode?.offerPrice ?? 0;
  const activeQuantity  = activePriceNode?.quantity  ?? 0;
  const activeDiscount  = calcDiscount(activePrice, activeOfferPrice);

  /** All images to show in the thumbnail strip when a variant/option is selected.
   *  Priority: option images → variant images → product images */
  const activeGalleryImages = useMemo<ProductImage[]>(() => {
    const optImgs  = selectedOption?.images?.length  ? selectedOption.images  : null;
    const varImgs  = selectedVariant?.images?.length ? selectedVariant.images : null;
    const prodImgs = product?.productImages ?? [];

    if (optImgs)  return optImgs;
    if (varImgs)  return varImgs;
    return prodImgs;
  }, [selectedOption, selectedVariant, product]);

  /** Hero image — first in the active gallery at the selected index */
  const activeHeroImage = useMemo<string | null>(() => {
    if (activeGalleryImages.length === 0) return null;
    const idx = selectedImageIndex < activeGalleryImages.length ? selectedImageIndex : 0;
    return activeGalleryImages[idx]?.url ?? null;
  }, [activeGalleryImages, selectedImageIndex]);

  // When product loads, pre-select first in-stock variant/option
  useEffect(() => {
    if (!product?.hasVariants || !product.variants?.length) return;

    const firstInStock = product.variants.find(v =>
      v.options?.length > 0
        ? v.options.some(o => o.quantity > 0)
        : v.quantity > 0
    ) ?? product.variants[0];

    setSelectedVariantId(firstInStock._id);

    if (firstInStock.options?.length > 0) {
      const firstOpt = firstInStock.options.find(o => o.quantity > 0) ?? firstInStock.options[0];
      setSelectedOptionId(firstOpt._id);
    }
  }, [product]);

  // Reset option when variant changes
  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setSelectedOptionId(null);
    setSelectedImageIndex(0);
    const v = product?.variants?.find(x => x._id === variantId);
    if (v?.options?.length) {
      const first = v.options.find(o => o.quantity > 0) ?? v.options[0];
      setSelectedOptionId(first._id);
    }
    setQuantity(1);
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setSelectedImageIndex(0);
    setQuantity(1);
  };

  // ── Wishlist & cart helpers ────────────────────────────────────────────
  const isWishlisted = !wishlist.loading && productId && isInWishlist(String(productId));

  const isInCart = Boolean(
    productId && cart?.items?.some((item: any) =>
      item?.productId?._id && String(item.productId._id) === String(productId)
    )
  );
  const cartItem     = isInCart ? cart.items.find((item: any) => String(item.productId._id) === String(productId)) : null;
  const cartQuantity = cartItem?.quantity || 0;

  // ── Fetch product ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        setLoading(true);
        const res  = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (res.ok && data.success) setProduct(data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    })();
    fetchWishlist();
  }, [productId, fetchWishlist]);

  // ── Reviews ────────────────────────────────────────────────────────────
  const checkUserReviewStatus = async () => {
    if (!session || !productId) return;
    setCheckingReview(true);
    try {
      const res  = await fetch(`/api/reviews/check-user-review?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviewStatus(data);
        if (data.existingReview) setUserReview(data.existingReview);
      }
    } catch { setReviewStatus({ canReview: false }); }
    finally   { setCheckingReview(false); }
  };

  useEffect(() => { if (session && productId) checkUserReviewStatus(); }, [session, productId]);

  const fetchReviews = async (page = 1, append = false) => {
    if (!productId) return;
    try {
      setReviewsLoading(true);
      const res  = await fetch(`/api/reviews/product/${productId}?page=${page}&limit=5`);
      const data = await res.json();
      if (data.success) {
        setReviews(prev => append ? [...prev, ...data.reviews] : data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        setRatingDistribution(data.ratingDistribution);
        setHasMoreReviews(page < data.totalPages);
      }
    } catch { /* silent */ }
    finally { setReviewsLoading(false); }
  };

  useEffect(() => { fetchReviews(1, false); }, [productId]);

  const loadMoreReviews = () => {
    const next = reviewPage + 1;
    setReviewPage(next);
    fetchReviews(next, true);
  };

  // ── Cart / Buy actions ─────────────────────────────────────────────────
  const buildCartPayload = () => ({
    productId:   product!._id,
    quantity,
    variantId:   selectedVariant?._id,
    optionId:    selectedOption?._id,
  });

  const buildBuyNowPayload = () => ({
    productId:   product!._id,
    name:        product!.name,
    subtitle:    product!.descriptionShort?.substring(0, 100),
    quantity,
    price:       activePrice,
    offerPrice:  activeOfferPrice,
    productImage: activeHeroImage || product?.productImages?.[0]?.url || "",
    totalAmount: activeOfferPrice * quantity,
    // pass variant/option labels for checkout display
    variantLabel: selectedVariant?.displayValue,
    optionLabel:  selectedOption?.optionLabel,
  });

  const handleAddToCart = async () => {
    if (!session) { setAuthDrawer({ open: true, pendingAction: "addToCart" }); return; }
    if (!product) return;
    // Enforce variant selection
    if (product.hasVariants && !selectedVariant) {
      toast.error("Please select a variant"); return;
    }
    if (selectedVariant?.options?.length && !selectedOption) {
      toast.error("Please select an option"); return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally { setIsAddingToCart(false); }
  };

  const handleBuyNow = async () => {
    if (!session) { setAuthDrawer({ open: true, pendingAction: "buyNow" }); return; }
    if (!product) return;
    if (product.hasVariants && !selectedVariant) { toast.error("Please select a variant"); return; }
    if (selectedVariant?.options?.length && !selectedOption) { toast.error("Please select an option"); return; }
    setIsBuyingNow(true);
    try {
      setBuyNowItem(buildBuyNowPayload());
      router.push("/check-out");
    } catch (error: any) {
      toast.error(error.message || "Failed to process. Please try again.");
      setIsBuyingNow(false);
    }
  };

  const handleGoToCart = () => router.push("/cart");

  const handleToggleWishlist = async () => {
    if (!productId || isTogglingWishlist) return;
    setIsTogglingWishlist(true);
    try { await addToWishlist(String(productId)); }
    catch (error: any) { toast.error(error.message || "Failed to update wishlist"); }
    finally { setIsTogglingWishlist(false); }
  };

  const handleAuthSuccess = async () => {
    if (!product) return;
    if (authDrawer.pendingAction === "addToCart") {
      setIsAddingToCart(true);
      try { await addToCart(product._id, quantity); }
      catch (error: any) { toast.error(error.message || "Failed to add to cart"); }
      finally { setIsAddingToCart(false); }
    } else if (authDrawer.pendingAction === "buyNow") {
      setBuyNowItem(buildBuyNowPayload());
      router.push("/check-out");
    }
  };

  const handleQuantityChange = (val: number) => {
    if (val >= 1 && val <= activeQuantity) setQuantity(val);
  };

  const handleReviewClick = () => {
    if (!session) { router.push("/login"); return; }
    if (userReview || reviewStatus?.canReview) { setShowReviewModal(true); }
    else toast.error("You can only review products you have purchased and received.");
  };

  const handleReviewSuccess = () => {
    fetchReviews(1, false);
    checkUserReviewStatus();
    setShowReviewModal(false);
  };

  // ── Render helpers ─────────────────────────────────────────────────────
  const renderStars = (rating: number, size = 16) => {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {[...Array(full)].map( (_, i) => <FaStar     key={`f${i}`} size={size} className="text-yellow-400 inline-block" />)}
        {half &&                          <FaStarHalfAlt             size={size} className="text-yellow-400 inline-block" />}
        {[...Array(empty)].map((_, i) => <FaStar     key={`e${i}`} size={size} className="text-gray-300 inline-block" />)}
      </>
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const getRatingPercentage = (count: number) =>
    totalReviews > 0 ? (count / totalReviews) * 100 : 0;

  // ── Guards ─────────────────────────────────────────────────────────────
  if (!productId) return <div>Invalid Product</div>;

  if (loading) return (
    <div className="text-center py-20">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      <p className="mt-4 text-gray-600">Loading product...</p>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-600">Product not found</p>
      <button onClick={() => router.push("/")} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
        Continue Shopping
      </button>
    </div>
  );

  const productImages   = product.productImages?.length > 0 ? product.productImages : [];
  const isOutOfStock    = activeQuantity === 0;
  const needsVariant    = product.hasVariants && !selectedVariant;
  const needsOption     = selectedVariant?.options?.length && !selectedOption;
  const canInteract     = !isOutOfStock && !needsVariant && !needsOption;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <section className="product-page">
      <Toaster position="top-right" />

      <div className="product-container">
        {/* ── Thumbnail strip ── */}
        {activeGalleryImages.length > 0 && (
          <div className="image-column">
            {activeGalleryImages.map((img, index) => (
              <div
                key={`${img.publicId || index}`}
                className={`thumbnail ${selectedImageIndex === index ? "selected" : ""}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image src={img.url} alt={`thumb-${index}`} width={90} height={90} />
              </div>
            ))}
          </div>
        )}

        {/* ── Main image ── */}
        <div className="main-image-section">
          <div className="main-image-wrapper">
            {activeHeroImage ? (
              <Image src={activeHeroImage} alt={product.name} fill priority style={{ objectFit: "contain" }} />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>
        </div>

        {/* ── Product details column ── */}
        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>

          {/* Rating line */}
          <div className="rating-line">
            <div className="flex items-center gap-1">
              {totalReviews > 0 ? renderStars(averageRating, 16) : [...Array(5)].map((_, i) => <FaStar key={i} className="text-gray-300" size={16} />)}
            </div>
            <span className="rating-score ml-2">{totalReviews > 0 ? `${averageRating.toFixed(1)} out of 5` : "No ratings yet"}</span>
            <span className="product-id ml-2">| SKU: <strong>{product._id.slice(-6).toUpperCase()}</strong></span>
          </div>
          <div className="mt-1">
            <span className="text-sm text-gray-600">{totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}</span>
          </div>

          <span className={`stock-status ${!isOutOfStock ? "in-stock" : "out-stock"}`}>
            {!isOutOfStock ? `IN STOCK (${activeQuantity} items left)` : "OUT OF STOCK"}
          </span>

          <p className="short-description">{product.descriptionShort}</p>

          {/* ── Pricing (reflects selected variant/option) ── */}
          <div className="pricing">
            <span className="discounted-price">₹{activeOfferPrice.toFixed(2)}</span>
            {activePrice > activeOfferPrice && (
              <span className="original-price">₹{activePrice.toFixed(2)}</span>
            )}
            {activeDiscount > 0 && (
              <span className="discount-badge">{activeDiscount}% OFF</span>
            )}
          </div>

          {/* ── VARIANT SELECTOR ── */}
          {product.hasVariants && product.variants && product.variants.length > 0 && (
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                  {/* Label changes based on variant type of first variant */}
                  {product.variants[0]?.variantType === "color" ? "Color" :
                   product.variants[0]?.variantType === "size"  ? "Size"  :
                   product.variants[0]?.variantType === "weight"? "Weight" :
                   product.variants[0]?.variantType === "volume"? "Volume" :
                   "Select Variant"}
                  {selectedVariant && (
                    <span style={{ fontWeight: 400, color: "#006d21", marginLeft: 8 }}>
                      {selectedVariant.displayValue}
                    </span>
                  )}
                </span>
              </div>

              {/* Color swatches vs. label pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {product.variants.map(v => {
                  const oos = v.options?.length > 0
                    ? v.options.every(o => o.quantity === 0)
                    : v.quantity === 0;

                  if (v.variantType === "color" && v.colorHex) {
                    return (
                      <ColorChip
                        key={v._id}
                        hex={v.colorHex}
                        label={v.displayValue}
                        selected={selectedVariant?._id === v._id}
                        outOfStock={oos}
                        onClick={() => handleSelectVariant(v._id)}
                      />
                    );
                  }
                  return (
                    <LabelChip
                      key={v._id}
                      label={v.displayValue}
                      selected={selectedVariant?._id === v._id}
                      outOfStock={oos}
                      onClick={() => handleSelectVariant(v._id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ── OPTION SELECTOR (child options of selected variant) ── */}
          {selectedVariant?.options && selectedVariant.options.length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                  {selectedVariant.options[0]?.optionType === "color" ? "Color" :
                   selectedVariant.options[0]?.optionType === "size"  ? "Size"  : "Option"}
                  {selectedOption && (
                    <span style={{ fontWeight: 400, color: "#006d21", marginLeft: 8 }}>
                      {selectedOption.optionLabel}
                    </span>
                  )}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedVariant.options.map(opt => {
                    const oos = opt.quantity === 0;
                    const optThumb = opt.images?.[0]?.url;

                  // Option with its own image → show small image chip
                  if (optThumb) {
                    return (
                      <button
                        key={opt._id}
                        type="button"
                        onClick={() => !oos && handleSelectOption(opt._id)}
                        disabled={oos}
                        style={{
                          padding: 2,
                          border: selectedOption?._id === opt._id ? "2.5px solid #006d21" : "2px solid #ccc",
                          borderRadius: 8,
                          cursor: oos ? "not-allowed" : "pointer",
                          opacity: oos ? 0.4 : 1,
                          background: "none",
                          transition: "all 0.15s",
                        }}
                        title={opt.optionLabel}
                      >
                        <Image
                          src={optThumb}
                          alt={opt.optionLabel}
                          width={52}
                          height={52}
                          style={{ borderRadius: 6, objectFit: "cover", display: "block" }}
                        />
                      </button>
                    );
                  }

                  if (opt.optionType === "color" && opt.colorHex) {
                    return (
                      <ColorChip
                        key={opt._id}
                        hex={opt.colorHex}
                        label={opt.optionLabel}
                        selected={selectedOption?._id === opt._id}
                        outOfStock={oos}
                        onClick={() => handleSelectOption(opt._id)}
                      />
                    );
                  }

                  return (
                    <LabelChip
                      key={opt._id}
                      label={opt.optionLabel}
                      selected={selectedOption?._id === opt._id}
                      outOfStock={oos}
                      onClick={() => handleSelectOption(opt._id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Selection prompt */}
          {product.hasVariants && (needsVariant || needsOption) && (
            <p style={{ fontSize: "0.8rem", color: "#c0392b", marginTop: 6 }}>
              {needsVariant ? "Please select a variant to continue." : "Please select an option to continue."}
            </p>
          )}

          {/* ── Quantity selector ── */}
          <div className="quantity-wrapper">
            <label>Quantity:</label>
            <div className="quantity-control">
              <button onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1 || isOutOfStock}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= activeQuantity || isOutOfStock}>+</button>
            </div>
            <small>{activeQuantity} items available</small>
          </div>

          {/* Cart badge */}
          {isInCart && cartQuantity > 0 && (
            <div className="cart-info">
              <span className="text-green-600 text-sm">✓ {cartQuantity} item(s) already in cart</span>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="action-buttons">
            <button className="buy-button" onClick={handleBuyNow} disabled={isOutOfStock || isBuyingNow || !!needsVariant || !!needsOption}>
              {isBuyingNow ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processing...
                </span>
              ) : "Buy Now..!"}
            </button>

            {isInCart ? (
              <button className="cart-button" onClick={handleGoToCart} style={{ backgroundColor: "#28a745" }}>
                Go to Cart
              </button>
            ) : (
              <button className="cart-button" onClick={handleAddToCart} disabled={isOutOfStock || isAddingToCart || !!needsVariant || !!needsOption}>
                {isAddingToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Adding...
                  </span>
                ) : "Add to Cart"}
              </button>
            )}
          </div>

          {/* ── Wishlist ── */}
          <button className="wishlist-button" onClick={handleToggleWishlist} disabled={isTogglingWishlist}>
            {isTogglingWishlist ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 inline-block mr-2" />
            ) : isWishlisted ? (
              <FaHeart className="text-red-600 inline-block mr-2" />
            ) : (
              <FaRegHeart className="inline-block mr-2" />
            )}
            {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>

          {/* ── Meta ── */}
          <div className="product-meta">
            <div><strong>Category:</strong> {product.category}</div>
            <div><strong>Subcategory:</strong> {product.subCategory}</div>
            {product.company?.name && <div><strong>Brand:</strong> {product.company.name}</div>}
            {product.foodType && (
              <div>
                <strong>Food Type:</strong>
                <span className={product.foodType === "veg" ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                  {product.foodType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                </span>
              </div>
            )}
            {/* Show selected variant summary */}
            {selectedVariant && (
              <div>
                <strong>Selected:</strong>{" "}
                <span style={{ color: "#006d21" }}>
                  {selectedVariant.displayValue}
                  {selectedOption ? ` / ${selectedOption.optionLabel}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── Delivery info ── */}
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

      {/* ── Tabs ── */}
      <div className="tabs-container mt-8">
        <div className="tabs">
          <button className={activeTab === "description"    ? "active" : ""} onClick={() => setActiveTab("description")}>Description</button>
          <button className={activeTab === "reviews"        ? "active" : ""} onClick={() => setActiveTab("reviews")}>Reviews ({totalReviews})</button>
          <button className={activeTab === "specifications" ? "active" : ""} onClick={() => setActiveTab("specifications")}>Specifications</button>
        </div>

        <div className="tab-content p-6 border border-t-0 rounded-b-lg">

          {/* Description tab */}
          {activeTab === "description" && (
            <div className="description-content">
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.descriptionLong || product.descriptionShort }} />
            </div>
          )}

          {/* Reviews tab (unchanged) */}
          {activeTab === "reviews" && (
            <div className="reviews-content">
              {totalReviews > 0 && (
                <div className="rating-summary mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
                      <div className="flex justify-center gap-1 my-2">{renderStars(averageRating, 20)}</div>
                      <div className="text-sm text-gray-600">Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}</div>
                    </div>
                    <div>
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="flex items-center gap-2 mb-2">
                          <div className="w-12 text-sm">{star} star</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${getRatingPercentage(ratingDistribution[star as keyof typeof ratingDistribution])}%` }} />
                          </div>
                          <div className="w-12 text-sm text-gray-600">{ratingDistribution[star as keyof typeof ratingDistribution]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {session ? (
                checkingReview ? (
                  <div className="mb-6 text-right"><button className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed" disabled>Checking eligibility...</button></div>
                ) : userReview ? (
                  <div className="mb-6 text-right">
                    <button onClick={handleReviewClick} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                      <Star className="inline-block w-4 h-4 mr-2" />Update Your Review
                    </button>
                  </div>
                ) : reviewStatus?.canReview ? (
                  <div className="mb-6 text-right">
                    <button onClick={handleReviewClick} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                      <Star className="inline-block w-4 h-4 mr-2" />Write a Review
                    </button>
                  </div>
                ) : (
                  <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-800 text-sm">You can only review products you have purchased and received.</p>
                  </div>
                )
              ) : (
                <div className="mb-6 text-right">
                  <button onClick={() => router.push("/login")} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">Login to Write a Review</button>
                </div>
              )}

              {reviewsLoading && reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                  <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list space-y-6">
                  {reviews.map(review => (
                    <div key={review._id} className="review-item border-b pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1"><FaUser className="text-gray-400" /><span className="font-semibold">{review.name}</span></div>
                          <div className="flex items-center gap-1 mb-1">{renderStars(review.rating, 14)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500"><FaCalendarAlt size={12} /><span>{formatDate(review.createdAt)}</span></div>
                      </div>
                      {review.title && <h4 className="font-semibold text-lg mt-2">{review.title}</h4>}
                      <p className="text-gray-700 mt-2">{review.review}</p>
                      {review.images?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {review.images.map((img, idx) => (
                            <div key={idx} className="relative w-20 h-20 cursor-pointer">
                              <Image src={img.url} alt={`Review image ${idx + 1}`} fill className="object-cover rounded-lg" onClick={() => window.open(img.url, "_blank")} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {hasMoreReviews && (
                    <div className="text-center pt-4">
                      <button onClick={loadMoreReviews} disabled={reviewsLoading} className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition disabled:opacity-50">
                        {reviewsLoading ? "Loading..." : "Load More Reviews"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No reviews yet.</p>
                  {session && (reviewStatus?.canReview || userReview) && (
                    <button onClick={handleReviewClick} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">Be the first to review!</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Specifications tab */}
          {activeTab === "specifications" && (
            <div className="specifications-content">
              <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
              <table className="w-full">
                <tbody>
                  <tr className="border-b"><td className="py-2 font-semibold">Category</td><td className="py-2">{product.category}</td></tr>
                  <tr className="border-b"><td className="py-2 font-semibold">Subcategory</td><td className="py-2">{product.subCategory}</td></tr>
                  {product.company?.name && <tr className="border-b"><td className="py-2 font-semibold">Brand</td><td className="py-2">{product.company.name}</td></tr>}
                  <tr className="border-b"><td className="py-2 font-semibold">Stock Status</td><td className="py-2">{!isOutOfStock ? "In Stock" : "Out of Stock"}</td></tr>
                  <tr className="border-b"><td className="py-2 font-semibold">SKU</td><td className="py-2">{product._id.slice(-8).toUpperCase()}</td></tr>
                  {product.hasVariants && product.variants && (
                    <tr className="border-b">
                      <td className="py-2 font-semibold">Variants</td>
                      <td className="py-2">{product.variants.map(v => v.displayValue).join(", ")}</td>
                    </tr>
                  )}
                  {totalReviews > 0 && (
                    <tr className="border-b">
                      <td className="py-2 font-semibold">Customer Rating</td>
                      <td className="py-2"><div className="flex items-center gap-2">{renderStars(averageRating, 16)}<span>({totalReviews} reviews)</span></div></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Review modal */}
      {showReviewModal && productId && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          productId={productId}
          orderId={userReview?.orderId || ""}
          productName={product?.name || ""}
          productImage={product?.productImages?.[0]?.url || ""}
          existingReview={userReview}
          onSuccess={handleReviewSuccess}
        />
      )}

      <style jsx>{`
        .cart-info { margin-top: 8px; }
        .delivery-info { margin-top: 16px; }
        .prose { line-height: 1.6; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <AuthDrawer
        isOpen={authDrawer.open}
        onClose={() => setAuthDrawer({ open: false, pendingAction: null })}
        pendingAction={authDrawer.pendingAction}
        onAuthSuccess={handleAuthSuccess}
      />
    </section>
  );
};

export default ProductSingle;