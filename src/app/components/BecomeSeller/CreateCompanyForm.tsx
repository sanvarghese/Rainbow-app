"use client";

import React, { useState } from "react";
import '../BecomeSeller/BecomeSeller.css'
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

const CreateCompanyForm: React.FC = () => {
    const [formData, setFormData] = useState({
        companyLogo: null as File | null,
        badges: null as File | null,
        banner: null as File | null,
        name: "",
        description: "",
        address: "",
        email: "",
        phoneNumber: "",
        gstNumber: "",
        instagramLink: "",
        facebookLink: "",

    });

    const [preview, setPreview] = useState({
        companyLogo: "",
        badges: "",
        banner: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "companyLogo" | "badges" | "banner"
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, [field]: file }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview((prev) => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
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
                }}
            >
                <Container>
                    <Typography variant="h3" fontWeight="bold">
                        Create Your Company Profile
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                        Fill in the details below to register your company
                    </Typography>
                </Container>
            </Box>

            {/* 🔹 Form Section */}
            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            {/* Company Logo */}
                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Company Logo
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "companyLogo")}
                                />
                                {preview.companyLogo && (
                                    <img
                                        src={preview.companyLogo}
                                        alt="Company Logo"
                                        style={{ maxWidth: "200px", marginTop: "10px" }}
                                    />
                                )}
                            </div>

                            {/* Badges */}
                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Badges
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "badges")}
                                />
                                {preview.badges && (
                                    <img
                                        src={preview.badges}
                                        alt="Badges"
                                        style={{ maxWidth: "200px", marginTop: "10px" }}
                                    />
                                )}
                            </div>

                            {/* Banner */}
                            <div className="col-12">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Banner Image
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "banner")}
                                />
                                {preview.banner && (
                                    <img
                                        src={preview.banner}
                                        alt="Banner"
                                        style={{
                                            maxWidth: "100%",
                                            marginTop: "10px",
                                            borderRadius: "8px",
                                        }}
                                    />
                                )}
                            </div>

                            {/* Company Name */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    name="name"
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

                            {/* Description */}
                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    type='text'
                                />
                            </div>

                            {/* Address */}
                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    type='text'
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                />
                            </div>

                            {/* GST Number */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="GST Number"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleInputChange}
                                    type='text'
                                />
                            </div>

                            {/* Fb Media */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Face book Link"
                                    name="facebookLink"
                                    value={formData.facebookLink}
                                    onChange={handleInputChange}
                                    placeholder="https://www.facebook.com/"
                                    type='text'
                                />
                            </div>

                            {/* Social Media */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Instagram Link"
                                    name="instagramLink"
                                    value={formData.instagramLink}
                                    onChange={handleInputChange}
                                    placeholder="https://www.instagram.com/"
                                />
                            </div>

                            {/* Actions */}
                            <div className="col-12 d-flex justify-content-end gap-2">
                                <Button variant="outlined" className="cancel-btn">Cancel</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="create-btn">
                                    Create Company
                                </Button>
                            </div>
                        </div>
                    </form>
                </Paper>
            </Container>
        </div>
    );
};
export default CreateCompanyForm;
