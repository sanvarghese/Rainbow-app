"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";

interface ProductCardProps {
  img: StaticImageData;
  title: string;
  subtitle: string;
  rating: string;
  reviews: string;
  oldPrice: string;
  newPrice: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  img,
  title,
  subtitle,
  rating,
  reviews,
  oldPrice,
  newPrice,
}) => {
  return (
    <div className="youmightlikecard">
      <div className="card topcard3">
        {/* Product Image */}
        <div className="cardimgdiv3">
          <Image
            className="topimg3"
            src={img}
            alt={title}
            width={200}
            height={200}
          />
          {/* Wishlist & Cart icons */}
          <div className="icons">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="wishlisttop bi bi-suit-heart-fill"
              viewBox="0 0 16 16"
            >
              <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="carttop bi bi-cart-fill"
              viewBox="0 0 16 16"
            >
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
          </div>
        </div>

        {/* Product Details */}
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <h6 className="subheading3">{subtitle}</h6>
          <h5 className="card-text">
            {rating} <span className="star3">★</span> ({reviews})
          </h5>
          <div className="row row-2">
            <div className="col-6">
              {oldPrice} <span><b>{newPrice}</b></span>
            </div>
            <div className="col-6 d-flex justify-content-end">
              <button className="btn topbtn3">
                <b>Buy Now</b>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
