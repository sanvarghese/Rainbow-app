"use client";

import React, { useState } from "react";
import { Button, Card, Typography } from "@mui/material";
import PaymentOptions from "./PaymentOption";
import "../CheckOut/CheckOut.css";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

export default async function CheckOut() {

  const session = await auth();
  
    // If user is not logged in, redirect to login
    if (!session?.user) {
      redirect('/auth/login');
    }

  // toggle state for address selection
  const [selectedOption, setSelectedOption] = useState<"existing" | "new">(
    "existing"
  );

  // mock saved addresses (replace with API data later)
  const savedAddresses = [
    {
      id: 1,
      name: "John Doe",
      mobile: "9876543210",
      address: "123, MG Road, Ernakulam",
      city: "Kochi",
      state: "Kerala",
      pincode: "682304",
      type: "Home",
    },
    {
      id: 2,
      name: "Jane Smith",
      mobile: "9123456789",
      address: "45, Vyttila Hub, Near Metro",
      city: "Kochi",
      state: "Kerala",
      pincode: "682019",
      type: "Work",
    },
  ];

  return (
    <div className="checkOut-page-section">
      <div className="container checkout-container">
        <Typography variant="h6" className="checkout-title mb-3">
          Check out..
        </Typography>

        {/* Header with radio toggle */}
        <div className="delivery-header d-flex gap-4 align-items-center mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="addressOption"
              id="deliveryAddress"
              checked={selectedOption === "existing"}
              onChange={() => setSelectedOption("existing")}
            />
            <label className="form-check-label" htmlFor="deliveryAddress">
              Delivery address
            </label>
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="addressOption"
              id="addNewAddress"
              checked={selectedOption === "new"}
              onChange={() => setSelectedOption("new")}
            />
            <label className="form-check-label" htmlFor="addNewAddress">
              Add new address
            </label>
          </div>
        </div>

        <div className="row">
          {/* LEFT SIDE */}
          <div className="col-md-8">
            {selectedOption === "existing" ? (
              // show saved address list
              <div>
                {savedAddresses.map((addr) => (
                  <Card key={addr.id} className="p-3 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="selectedDeliveryAddress"
                        id={`addr-${addr.id}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`addr-${addr.id}`}
                      >
                        <div className="fw-bold">{addr.name}</div>
                        <div>{addr.mobile}</div>
                        <div>
                          {addr.address}, {addr.city}, {addr.state},{" "}
                          {addr.pincode}
                        </div>
                        <div className="text-muted">{addr.type}</div>
                      </label>
                    </div>
                  </Card>
                ))}

                <Button
                  variant="contained"
                  color="success"
                  className="save-deliver-btn"
                >
                  Deliver to this address
                </Button>
              </div>
            ) : (
              // show new address form
              <form>
                <div className="delivery-section">
                  <Card className="checkout-form p-4">
                    {/* Row 1 */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <input
                          type="text"
                          placeholder="Name"
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          placeholder="10-digit mobile number"
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <input
                          type="text"
                          placeholder="Pincode"
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          placeholder="Locality"
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Full width */}
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Address (Area and Street)"
                        className="form-control"
                      />
                    </div>

                    {/* Row 3 */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <input
                          type="text"
                          placeholder="City/District/Town"
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <select className="form-select">
                          <option>--Select State--</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <input
                          type="text"
                          placeholder="Landmark (Optional)"
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          placeholder="Alternate Phone (Optional)"
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Address Type */}
                    <div className="address-type-section mb-3">
                      <div className="address-type-title mb-2">
                        Address Type
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="addressType"
                          id="home"
                          defaultChecked
                        />
                        <label
                          className="form-check-label"
                          htmlFor="home"
                        >
                          Home{" "}
                          <small className="text-muted">
                            (All day delivery)
                          </small>
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="addressType"
                          id="work"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="work"
                        >
                          Work{" "}
                          <small className="text-muted">
                            (Delivery between 10 AM - 5 PM)
                          </small>
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      className="save-deliver-btn"
                    >
                      Save & Deliver here
                    </Button>
                  </Card>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT SIDE (Price Sidebar) */}
          <div className="col-md-4">
            <Card className="price-sidebar p-4">
              <div className="price-title">Price details</div>
              <div className="d-flex justify-content-between mb-4">
                <span className="price-label">Subtotal</span>
                <span className="price-value">₹118.00</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="price-label">Discount</span>
                <span className="price-value text-success">- ₹08.00</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="price-label">Delivery Charges</span>
                <span className="price-value text-success">Free</span>
              </div>
              <div className="d-flex justify-content-between total-payable pt-2">
                <span className="fw-semibold">Total Payable</span>
                <span className="fw-semibold">₹110.00</span>
              </div>
              <div className="savings-text text-success text-center mt-2">
                You will save ₹08.00 on this order
              </div>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="col-md-8 mt-4">
            <PaymentOptions />
          </div>
        </div>
      </div>
    </div>
  );
};


