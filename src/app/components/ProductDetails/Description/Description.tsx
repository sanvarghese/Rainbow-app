"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "./Description.css";

interface ProductDescription {
  _id: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;
  price: number;
  offerPrice: number;
  quantity: number;
  category: string;
  subCategory: string;
  foodType?: string;
  company: {
    name: string;
    description?: string;
  };
}

const Description = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<ProductDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");

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

  if (loading) {
    return (
      <div className="product-details-container container-fluid">
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-container container-fluid">
        <div className="text-center py-4">
          <h4>Product not found</h4>
          <p>Unable to load product details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-container container-fluid">
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
      <hr />
      <div className="tab-content">
        {activeTab === "description" && (
          <>
            <h4>Product Description</h4>
            <p>{product.descriptionShort}</p>
            
            {product.descriptionLong ? (
              <div 
                dangerouslySetInnerHTML={{ __html: product.descriptionLong }}
                className="long-description"
              />
            ) : (
              <ul>
                <li>
                  <strong>High Quality Ingredients</strong> – Made with premium, 
                  carefully selected spices for authentic flavor.
                </li>
                <li>
                  <strong>No Artificial Flavors</strong> – Pure, natural ingredients 
                  for a genuine taste experience.
                </li>
                <li>
                  <strong>Fresh Aroma</strong> – Enjoy the authentic fragrance 
                  of traditional spices.
                </li>
                <li>
                  <strong>Hygienically Packed</strong> – Sealed with care to 
                  maintain freshness and quality.
                </li>
                <li>
                  <strong>Versatile Use</strong> – Perfect for enhancing a wide 
                  variety of dishes.
                </li>
              </ul>
            )}

            {product.company?.description && (
              <>
                <h4>About {product.company.name}</h4>
                <p>{product.company.description}</p>
              </>
            )}
          </>
        )}

        {activeTab === "specifications" && (
          <>
            <h4>Product Specifications</h4>
            <ul className="specs">
              <li>
                <strong>Product Name:</strong> {product.name}
              </li>
              <li>
                <strong>Brand:</strong> {product.company?.name || 'Unknown Brand'}
              </li>
              <li>
                <strong>Category:</strong> {product.category}
              </li>
              <li>
                <strong>Subcategory:</strong> {product.subCategory}
              </li>
              {product.foodType && (
                <li>
                  <strong>Food Type:</strong> {product.foodType}
                </li>
              )}
              <li>
                <strong>Net Quantity:</strong> As per packaging
              </li>
              <li>
                <strong>Price:</strong> ₹{product.offerPrice.toFixed(2)}
                {product.price > product.offerPrice && (
                  <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#666' }}>
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </li>
              <li>
                <strong>Stock Status:</strong> 
                <span className={product.quantity > 0 ? "text-success" : "text-danger"}>
                  {product.quantity > 0 ? ' In Stock' : ' Out of Stock'}
                </span>
              </li>
              <li>
                <strong>Ingredients:</strong> Natural Spices and Herbs
              </li>
              <li>
                <strong>Shelf Life:</strong> 12 Months
              </li>
              <li>
                <strong>Storage:</strong> Store in a cool, dry place
              </li>
            </ul>
          </>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            <h4>Customer Reviews</h4>
            <div className="placeholder">
              <p>No reviews yet for this product.</p>
              <p>Be the first to share your experience!</p>
            </div>
            
            {/* You can add a review form here later */}
            <div className="review-form-placeholder">
              <button className="btn btn-outline-success mt-3">
                Write a Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Description;