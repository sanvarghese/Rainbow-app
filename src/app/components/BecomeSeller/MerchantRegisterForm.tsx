'use client'

import React, { useState } from 'react'
import '../BecomeSeller/BecomeSeller.css'
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

const MerchantRegisterForm: React.FC = () => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    return (
        <div className="create-company-section min-vh-100 bg-light">
            {/* 🔹 Banner Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #007F27 0%, #00bb38ff 100%)",
                    color: "white",
                    py: 6,
                    my: 6,
                    textAlign: "center",
                }}>
                    
                <Container>
                    <Typography variant="h3" fontWeight="bold">
                        Create Your Account
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                        Fill in the details
                        {/* below to register your company */}
                    </Typography>
                </Container>
            </Box>

            {/* 🔹 Form Section */}
            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">

                            {/* Company Name */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Phone number */}
                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Phone number"
                                    name="phoneNumber"
                                    type="number"
                                    // multiline
                                    // rows={3}
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Password */}
                            <div className="col-6">
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Confirm password */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Confirm password"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Actions */}
                            <div className="col-12 d-flex justify-content-end gap-2">
                                <Button variant="outlined" className="cancel-btn">Cancel</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="create-btn">
                                    Create Account
                                </Button>
                            </div>
                        </div>
                    </form>
                </Paper>
            </Container>
        </div>
    )
}

export default MerchantRegisterForm
