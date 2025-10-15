"use client";
import React from "react";
import Image from "next/image"; 
import "./Cart.css";
import card_2 from "../../../assets/images/card_2.png";
import PriceDetails from "./PriceDetails";
import { useCart } from "@/context/CartContext";
// import { useCart } from "../../../contexts/CartContext";

const Cart = () => {
  const { cart, updateCartItem, removeFromCart } = useCart();

  console.log(cart, 'cart data')

  const handleIncrement = (productId: string, currentQuantity: number) => {
    updateCartItem(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItem(productId, currentQuantity - 1);
    }
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const handleSaveForLater = (productId: string) => {
    console.log(`Item with id ${productId} saved for later.`);
    // Implement save for later functionality
  };

  if (cart.loading) {
    return (
      <div className="cart-page">
        <div className="container-fluid cart-shop pb-5">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container-fluid cart-shop pb-5">
          <div className="text-center py-5">
            <h4 className="shoppingcarthead">Your Shopping Cart</h4>
            <p className="text-muted">Your cart is empty</p>
            <button className="btn btn-success mt-3">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container-fluid cart-shop pb-5">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-8 col-lg-8 cartone">
            <h4 className="shoppingcarthead">Your Shopping Cart ({cart.totalItems} items)</h4>

            {cart.items.map((item) => (
              <div key={item._id} className="card cartcard row position-relative">
                <button
                  className="btn remove-btn"
                  onClick={() => handleRemove(item.productId._id)}
                >
                  <span className="remove"> Remove</span>
                </button>

                <div className="col-3 d-flex align-items-center justify-content-center">
                  <Image
                    className="cartimg"
                    src={item.productImage || card_2}
                    alt={item.name}
                    width={120}
                    height={120}
                    onError={(e) => {
                      e.currentTarget.src = card_2;
                    }}
                  />
                </div>

                <div className="card-body col-6 cartbody">
                  <h2 className="card-title carttitle">{item.name}</h2>
                  <h6 className="subheadingcart">
                    Sold by: {item.companyId.name}
                  </h6>
                  <div className="amount">
                    ₹{item.price}{" "}
                    {item.productId.offerPrice < item.productId.price && (
                      <span className="text-muted text-decoration-line-through">
                        ₹{item.productId.price}
                      </span>
                    )}
                  </div>

                  <div className="row row-cart2 mt-2">
                    <div className="col d-flex align-items-center gap-3">
                      <div className="countbtn d-flex align-items-center gap-2">
                        <button
                          className="btn btn-outline btninc"
                          onClick={() => handleDecrement(item.productId._id, item.quantity)}
                        >
                          <b>-</b>
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-outline btndec"
                          onClick={() => handleIncrement(item.productId._id, item.quantity)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="btn btncart btn-outline"
                        onClick={() => handleSaveForLater(item.productId._id)}
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
          <PriceDetails cartItems={cart.items.map(item => ({
            id: parseInt(item._id),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            rating: 4.7, // You can add rating to your product model if needed
          }))} />
        </div>
      </div>
    </div>
  );
};

export default Cart;