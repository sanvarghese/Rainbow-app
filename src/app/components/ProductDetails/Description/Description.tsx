"use client";

import React, { useState } from "react";
import "./Description.css";

const Description = () => {
  const [activeTab, setActiveTab] = useState("description");

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
      </div>
      <hr />
      <div className="tab-content">
        {activeTab === "description" && (
          <>
            <h4>Product Description</h4>
            <p>
              Create delicious, aromatic chicken dishes with our Chicken Masala
              Powder. This spice blend adds a rich, flavorful kick to your
              curries, grills, and stir-fries, making every meal a feast.
            </p>
            <ul>
              <li>
                <strong>Authentic Garam Masala</strong> – Delivers the perfect
                taste and rich color to your dishes.
              </li>
              <li>
                <strong>No Added Flavours</strong> – Pure, unadulterated spices
                for a genuine flavor experience.
              </li>
              <li>
                <strong>Original Fragrance</strong> – Enjoy the fresh, natural
                aroma of traditional spices.
              </li>
              <li>
                <strong>Hygienically Packed</strong> – Sealed with care to
                maintain freshness and quality.
              </li>
              <li>
                <strong>Versatile Spice Blend</strong> – Ideal for enhancing a
                wide variety of Indian and international dishes.
              </li>
            </ul>

            <h4>Product Specifications</h4>
            <ul className="specs">
              <li>
                <strong>Product Type:</strong> Curry Masala
              </li>
              <li>
                <strong>Product Name:</strong> Chicken Masala
              </li>
              <li>
                <strong>Brand:</strong> Kothas Kitchen
              </li>
              <li>
                <strong>FSA Eligible:</strong> Yes
              </li>
              <li>
                <strong>Size/Count:</strong> 100g
              </li>
              <li>
                <strong>Item Code:</strong> 331593
              </li>
              <li>
                <strong>Ingredients:</strong> Natural Spices
              </li>
            </ul>
          </>
        )}

        {activeTab === "reviews" && (
          <div className="placeholder">No reviews available.</div>
        )}
      </div>
    </div>
  );
};

export default Description;
