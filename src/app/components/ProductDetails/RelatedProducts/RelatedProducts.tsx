"use client";

import React from "react";
import "./RelatedProducts.css";

import card_5 from "../../../../assets/images/card_5.png";
import card_6 from "../../../../assets/images/card_6.png";
import card_7 from "../../../../assets/images/card_7.png";
import card_8 from "../../../../assets/images/card_8.png";
import ProductCard from "../../ProductCard/ProductCard";

// import ProductCard from "./ProductCard";

const RelatedProducts = () => {
  const products = [
    {
      id: 1,
      img: card_5,
      title: "KOTTHAS KITCHEN",
      subtitle: "Chicken Masala (100g)",
      rating: "4.8",
      reviews: "10k",
      oldPrice: "₹59.00",
      newPrice: "₹55.00",
    },
    {
      id: 2,
      img: card_6,
      title: "KOTTHAS KITCHEN",
      subtitle: "Fish Masala (100g)",
      rating: "4.7",
      reviews: "8k",
      oldPrice: "₹60.00",
      newPrice: "₹56.00",
    },
    {
      id: 3,
      img: card_7,
      title: "KOTTHAS KITCHEN",
      subtitle: "Mutton Masala (100g)",
      rating: "4.9",
      reviews: "12k",
      oldPrice: "₹65.00",
      newPrice: "₹60.00",
    },
    {
      id: 4,
      img: card_8,
      title: "KOTTHAS KITCHEN",
      subtitle: "Veg Curry Masala (100g)",
      rating: "4.6",
      reviews: "7k",
      oldPrice: "₹55.00",
      newPrice: "₹50.00",
    },
  ];

  return (
    <div className="relatedProducts">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="youmightheading">
            <h4 className="h4_1">You might also like</h4>
            <h4 className="h4_2">
              All Products{" "}
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#1f1f1f"
              >
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
              </svg> */}
            </h4>
          </div>

          {products.map((product) => (
            <div
              key={product.id}
              className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
