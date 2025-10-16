"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "./RelatedProducts.css";
import ProductCard from "../../ProductCard/ProductCard";

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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        
        // First, get the current product to find related ones
        const productRes = await fetch(`/api/products/${productId}`);
        if (!productRes.ok) return;
        
        const productData = await productRes.json();
        if (!productData.success) return;

        const currentProduct = productData.product;
        
        // Then fetch related products (same category or subcategory)
        const params = new URLSearchParams({
          category: currentProduct.category,
          limit: '4',
          exclude: productId
        });

        const relatedRes = await fetch(`/api/products?${params}`);
        
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            setRelatedProducts(relatedData.products);
          }
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  // Fallback dummy data if no related products found
  const fallbackProducts = [
    {
      _id: "1",
      name: "Chicken Masala",
      descriptionShort: "Authentic chicken masala powder",
      price: 59,
      offerPrice: 55,
      discount: 7,
      category: "food",
      subCategory: "spices",
      company: {
        _id: "1",
        name: "KOTTHAS KITCHEN"
      }
    },
    {
      _id: "2",
      name: "Fish Masala",
      descriptionShort: "Special fish masala blend",
      price: 60,
      offerPrice: 56,
      discount: 7,
      category: "food",
      subCategory: "spices",
      company: {
        _id: "1",
        name: "KOTTHAS KITCHEN"
      }
    },
    {
      _id: "3",
      name: "Mutton Masala",
      descriptionShort: "Rich mutton masala powder",
      price: 65,
      offerPrice: 60,
      discount: 8,
      category: "food",
      subCategory: "spices",
      company: {
        _id: "1",
        name: "KOTTHAS KITCHEN"
      }
    },
    {
      _id: "4",
      name: "Veg Curry Masala",
      descriptionShort: "Vegetarian curry masala",
      price: 55,
      offerPrice: 50,
      discount: 9,
      category: "food",
      subCategory: "spices",
      company: {
        _id: "1",
        name: "KOTTHAS KITCHEN"
      }
    }
  ];

  const productsToShow = relatedProducts.length > 0 ? relatedProducts : fallbackProducts;

  return (
    <div className="relatedProducts">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="youmightheading">
            <h4 className="h4_1">You might also like</h4>
            <h4 className="h4_2">
              All Products
            </h4>
          </div>

          {loading ? (
            <div className="col-12 text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading related products...</p>
            </div>
          ) : (
            productsToShow.map((product) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;