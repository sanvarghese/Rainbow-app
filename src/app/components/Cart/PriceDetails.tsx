"use client";

import React from "react";
import Image from "next/image";
import "../cart/cart.css";
import cartpricebottom from "../../../assets/images/cartpricebottom.png";
import { useCart } from "@/context/CartContext";

const PriceDetails: React.FC = () => {
  const { cart } = useCart();
  
  // Calculate values based on cart items
  const subtotal = cart.items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
  const totalAmount = cart.totalAmount;
  const totalSavings = cart.totalSavings || subtotal - totalAmount;
  const deliveryCharge = 0;

  const handleCheckout = () => {
    console.log("Proceeding to checkout with items:", cart.items);
  };

  return (
    <div className="col-12 col-sm-12 col-md-4 col-lg-4 summerycol">
      <div className="summary-wrapper">
        <div className="card p-4 summary-card">
          <h5 className="mb-3 text-muted">Price details</h5>

          <div className="d-flex justify-content-between mb-2">
            <span>
              <b>Subtotal ({cart.totalItems} items)</b>
            </span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {totalSavings > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <span>
                <b>Discount</b>
              </span>
              <span className="text-success">- ₹{totalSavings.toFixed(2)}</span>
            </div>
          )}

          <div className="d-flex justify-content-between mb-2">
            <span>
              <b>Delivery Charges</b>
            </span>
            <span className="text-success">Free</span>
          </div>

          <hr />

          <div className="d-flex justify-content-between mb-2 totalamount">
            <span>
              <b>Total Amount</b>
            </span>
            <span>
              <b>₹{totalAmount.toFixed(2)}</b>
            </span>
          </div>

          {totalSavings > 0 && (
            <div className="youwillsave text-success mb-3">
              You will save ₹{totalSavings.toFixed(2)} on this order
            </div>
          )}

          <button className="btn checkoutbtn" onClick={handleCheckout}>
            <b>Proceed to checkout</b>
          </button>
        </div>

        <Image
          className="cartpricebottom"
          src={cartpricebottom}
          alt="cartpricebottom"
          width={400}
          height={120}
        />
      </div>
    </div>
  );
};

export default PriceDetails;