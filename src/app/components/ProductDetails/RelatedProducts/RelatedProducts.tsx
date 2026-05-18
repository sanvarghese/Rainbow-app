// components/RelatedProducts/RelatedProducts.tsx
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
  productImages?: string[];        // ← Important
  productImage?: string;           // fallback
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
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);

        if (!wishlist.items?.length) {
          setRelatedProducts([]);
          return;
        }

        const wishlistProductIds = wishlist.items
          .map((item: any) => item?.productId?._id || item?.productId)
          .filter(Boolean);

        const params = new URLSearchParams({
          productId: productId as string,
          relatedTo: wishlistProductIds.join(","),
          limit: "8",
        });

        const res = await fetch(`/api/products/related?${params}`);

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRelatedProducts(data.products || []);
          }
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchRelatedProducts();
  }, [productId, wishlist.items]);

  return (
    <div className="relatedProducts">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="youmightheading">
            <h4 className="h4_1">You might also like</h4>
          </div>

          {loading ? (
            <div className="col-12 text-center py-4">
              <div className="spinner-border text-success" role="status" />
              <p className="mt-2">Loading...</p>
            </div>
          ) : relatedProducts.length > 0 ? (
            relatedProducts.map((product) => {
              // ✅ FIXED: Get image from productImages array
              const imageUrl =
                product.productImages?.[0] ||
                product.productImage ||
                "";

              return (
                <div
                  key={product._id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                >
                  <ProductCard
                    id={product._id}
                    productId={product._id}
                    img={imageUrl}                    // ← Fixed
                    title={product.company?.name || 'Unknown Brand'}
                    subtitle={product.name}
                    rating="4.5"
                    reviews="100"
                    oldPrice={`₹${product.price}`}
                    newPrice={`₹${product.offerPrice}`}
                    discount={product.discount}
                    price={product.price}
                    offerPrice={product.offerPrice}
                    companyId={product.company._id}
                    productImage={imageUrl}           // ← Also pass here
                  />
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-8">
              <p className="text-muted">No related products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;