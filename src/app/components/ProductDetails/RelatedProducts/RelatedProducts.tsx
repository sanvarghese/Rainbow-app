"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "./RelatedProducts.css";
import ProductCard from "../../ProductCard/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

interface Product {
  _id: string;
  name: string;
  descriptionShort: string;
  productImage?: string;
  price: number;
  offerPrice: number;
  discount: number;
  category: string;
  subCategory: string;
  company: {
    _id: string;
    name: string;
    companyLogo?: string;
  };
}

const RelatedProducts = () => {
  const { productId } = useParams();
  const { wishlist } = useWishlist();

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        setLoading(true);

        if (!wishlist.items || wishlist.items.length === 0) {
          setRelatedProducts([]);
          return;
        }

        // Safe product ID extraction
        const wishlistProductIds = wishlist.items
          .map((item: any) => {
            if (!item?.productId) return null;
            return typeof item.productId === "object" 
              ? item.productId._id?.toString() 
              : item.productId.toString();
          })
          .filter(Boolean);

        console.log("Wishlist IDs for API:", wishlistProductIds);

        if (wishlistProductIds.length === 0) {
          setRelatedProducts([]);
          return;
        }

        // ✅ FIXED: Properly pass productId
        const params = new URLSearchParams({
          productId: productId as string,        // ← This was missing
          relatedTo: wishlistProductIds.join(","),
          limit: "8",
        });

        const res = await fetch(`/api/products/related?${params}`);

        if (res.ok) {
          const data = await res.json();
          console.log("Related API Response:", data);
          if (data.success) {
            setRelatedProducts(data.products || []);
          }
        } else {
          console.error("API Error:", await res.text());
        }
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchWishlistProducts();
    }
  }, [productId, wishlist.items]);

  return (
    <div className="relatedProducts">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="youmightheading">
            <h4 className="h4_1">You might also like</h4>
            <h4 className="h4_2">From Your Wishlist</h4>
          </div>

          {loading ? (
            <div className="col-12 text-center py-4">
              <div className="spinner-border text-success" role="status" />
              <p className="mt-2">Loading wishlist products...</p>
            </div>
          ) : relatedProducts.length > 0 ? (
            relatedProducts.map((product) => (
              <div
                key={product._id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
              >
                <ProductCard
                  id={product._id}
                  productId={product._id}
                  img={product.productImage || ''}
                  title={product.company?.name || 'Unknown Brand'}
                  subtitle={product.name}
                  rating="4.5"
                  reviews="100"
                  oldPrice={`₹${product.price.toFixed(2)}`}
                  newPrice={`₹${product.offerPrice.toFixed(2)}`}
                  discount={product.discount}
                  price={product.price}
                  offerPrice={product.offerPrice}
                  companyId={product.company._id}
                  productImage={product.productImage}
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-8">
              <p className="text-muted">No products in wishlist yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;