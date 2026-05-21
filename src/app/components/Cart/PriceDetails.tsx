"use client";

import React from "react";
import Image from "next/image";
import '../Cart/Cart.css'
import cartpricebottom from "../../../assets/images/cartpricebottom.png";
import { useCart } from "@/context/CartContext";

interface CartItemForPrice {
  id: number;
  name: string;
  price: number;
  quantity: number;
  rating?: number;
}

interface PriceDetailsProps {
  cartItems?: CartItemForPrice[];   // Accept prop from parent
}

const PriceDetails: React.FC<PriceDetailsProps> = ({ cartItems }) => {
  const { cart } = useCart();
  
  // Use passed cartItems if available, otherwise fallback to context
  const items = cartItems || cart.items.map(item => ({
    id: parseInt(item._id || '0'),
    name: item.name,
    price: item.price || item.offerPrice || 0,
    quantity: item.quantity,
  }));

  const subtotal = items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  const totalAmount = cart.totalAmount || subtotal;
  const totalSavings = cart.totalSavings || 0;

  const handleCheckout = () => {
    console.log("Proceeding to checkout with items:", items);
    // Add your checkout logic here
  };

  return (
    <div className="col-12 col-sm-12 col-md-4 col-lg-4 summerycol">
      <div className="summary-wrapper">
        <div className="card p-4 summary-card">
          <h5 className="mb-3 text-muted">Price details</h5>

          <div className="d-flex justify-content-between mb-2">
            <span>
              <b>Subtotal ({items.length} items)</b>
            </span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {totalSavings > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <span><b>Discount</b></span>
              <span className="text-success">- ₹{totalSavings.toFixed(2)}</span>
            </div>
          )}

          <div className="d-flex justify-content-between mb-2">
            <span><b>Delivery Charges</b></span>
            <span className="text-success">Free</span>
          </div>

          <hr />

          <div className="d-flex justify-content-between mb-2 totalamount">
            <span><b>Total Amount</b></span>
            <span><b>₹{totalAmount.toFixed(2)}</b></span>
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