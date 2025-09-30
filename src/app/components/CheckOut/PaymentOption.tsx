"use client";

import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { Typography } from "@mui/material";
import '../CheckOut/PaymentOption.css'

const PaymentOptions = () => {
    const [selectedOption, setSelectedOption] = useState("cod"); // cod | upi | card
    const [upiId, setUpiId] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");
    const [cvv, setCvv] = useState("");

    return (
        <Container className="my-4">
            <Typography variant="h6" className="mb-4 fw-bold">
                Payment options
            </Typography>
            <Card className="p-4">

                {/* Cash on Delivery */}
                <div className="mb-4 pb-3 border-bottom">
                    <Form.Check
                        type="radio"
                        label="Cash on delivery"
                        name="payment"
                        checked={selectedOption === "cod"}
                        onChange={() => setSelectedOption("cod")}
                    />
                </div>

                {/* UPI */}
                <div className="mb-4 pb-3 border-bottom">
                    <Form.Check
                        type="radio"
                        label="UPI"
                        name="payment"
                        checked={selectedOption === "upi"}
                        onChange={() => setSelectedOption("upi")}
                    />

                    {selectedOption === "upi" && (
                        <div className="mt-3 ms-4">
                            <Row className="align-items-center mb-3">
                                <Col>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your UPI ID here..."
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                    />
                                </Col>
                                <Col xs="auto">
                                    <a href="#" className="text-success fw-bold">
                                        Verify
                                    </a>
                                </Col>
                            </Row>
                            <Button variant="warning" className="fw-bold">
                                Pay ₹110.00
                            </Button>
                        </div>
                    )}
                </div>

                {/* Credit/Debit Card */}
                <div className="mb-4">
                    <Form.Check
                        type="radio"
                        label="Credit/Debit / ATM Card"
                        name="payment"
                        checked={selectedOption === "card"}
                        onChange={() => setSelectedOption("card")}
                    />

                    {selectedOption === "card" && (
                        <div className="mt-3 ms-4">
                            <Form.Control
                                type="text"
                                placeholder="Enter card number"
                                className="mb-3"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />

                            <Row className="mb-3">
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Valid thru</Form.Label>
                                        <Form.Select
                                            value={expiryMonth}
                                            onChange={(e) => setExpiryMonth(e.target.value)}
                                        >
                                            <option>MM</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group>
                                        <Form.Label>&nbsp;</Form.Label>
                                        <Form.Select
                                            value={expiryYear}
                                            onChange={(e) => setExpiryYear(e.target.value)}
                                        >
                                            <option>YY</option>
                                            {[24, 25, 26, 27, 28, 29, 30].map((year) => (
                                                <option key={year}>{year}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>CVV</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="CVV"
                                            maxLength={3}
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button variant="warning" className="fw-bold">
                                Pay ₹110.00
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </Container>
    );
};

export default PaymentOptions;
