"use client";

import React, { useState } from "react";
import Image from "next/image"; 
import "./Cart.css";
import card_2 from "../../../assets/images/card_2.png";
// import card_2 from "../../../assets/images/card_2.png";
import PriceDetails from "./PriceDetails";
// import Pricedetaiules from "./Pricedetaiules"; 

// If using TypeScript, define type
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  rating: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "KOTTHAS KITCHEN Chicken Masala (100g)",
      price: 55.0,
      quantity: 1,
      rating: 4.7,
    },
    {
      id: 2,
      name: "KOTTHAS KITCHEN Chicken Masala (100g)",
      price: 55.0,
      quantity: 1,
      rating: 4.7,
    },
    {
      id: 3,
      name: "KOTTHAS KITCHEN Chicken Masala (100g)",
      price: 55.0,
      quantity: 1,
      rating: 4.7,
    },
  ]);

  const handleIncrement = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleSaveForLater = (id: number) => {
    console.log(`Item with id ${id} saved for later.`);
  };

  return (
    <div className="cart-page">
      <div className="container-fluid cart-shop pb-5">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-8 col-lg-8 cartone">
            <h4 className="shoppingcarthead">Your Shopping Cart</h4>

            {cartItems.map((item) => (
              <div key={item.id} className="card cartcard row position-relative">
                <button
                  className="btn remove-btn"
                  onClick={() => handleRemove(item.id)}
                >
                  <span className="remove"> Remove</span>
                </button>

                <div className="col-3 d-flex align-items-center justify-content-center">
                  <Image
                    className="cartimg"
                    src={card_2}
                    alt="cartimg"
                    width={120}
                    height={120}
                  />
                </div>

                <div className="card-body col-6 cartbody">
                  <h2 className="card-title carttitle">{item.name}</h2>
                  <h6 className="subheadingcart">
                    <span className="stars_in_cart">
                      {"★ ".repeat(Math.floor(item.rating))}
                    </span>{" "}
                    {item.rating} Star Rating
                  </h6>
                  <div className="amount">
                    ₹{item.price}{" "}
                    <span>
                      <b>₹{item.price}</b>
                    </span>
                  </div>

                  <div className="row row-cart2 mt-2">
                    <div className="col d-flex align-items-center gap-3">
                      <div className="countbtn d-flex align-items-center gap-2">
                        <button
                          className="btn btn-outline btninc"
                          onClick={() => handleDecrement(item.id)}
                        >
                          <b>-</b>
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-outline btndec"
                          onClick={() => handleIncrement(item.id)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="btn btncart btn-outline"
                        onClick={() => handleSaveForLater(item.id)}
                      >
                        <p className="saveforlater">Save for later</p>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-3 cartfinalamount">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <PriceDetails cartItems={cartItems} />
        </div>
      </div>
    </div>
  );
};

export default Cart;
