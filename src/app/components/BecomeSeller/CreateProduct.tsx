"use client"

import React, { useState } from 'react'
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Radio,
    RadioGroup,
    FormControlLabel
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import '../BecomeSeller/BecomeSeller.css'

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        productImage: null as File | null,
        badges: null as File | null,
        name: "",
        descriptionShort: "",
        descriptionLong: "",
        quantity: "",
        category: "",
        subCategory: "",
        foodType: "",
    });

    const [preview, setPreview] = useState({
        productImage: "",
        badges: ""
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target as HTMLInputElement;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "productImage" | "badges"
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

    // handle Select (dropdowns) separately
    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    return (
        <div className="create-product-section min-vh-100 bg-light">
            {/* 🔹 Banner Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #006d21ff 0%, #00bb38ff 100%)",
                    color: "white",
                    py: 6,
                    my: 6,
                    textAlign: "center",
                }}
            >
                <Container>
                    <Typography variant="h3" fontWeight="bold">
                        Create your product
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                        Fill in the details below to add your product
                    </Typography>
                </Container>
            </Box>

            {/* 🔹 Form Section */}
            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">

                            {/* Product image */}
                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Product image
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "productImage")}
                                />
                                {preview.productImage && (
                                    <img
                                        src={preview.productImage}
                                        alt="Product"
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

                            {/* Product Name */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    type='text'
                                />
                            </div>

                            {/* Short Description */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Description (At least 500 words)"
                                    name="descriptionShort"
                                    value={formData.descriptionShort}
                                    onChange={handleInputChange}
                                    required
                                    type='text'
                                />
                            </div>

                            {/* Long Description */}
                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Description (At least 2000 words)"
                                    name="descriptionLong"
                                    multiline
                                    rows={3}
                                    value={formData.descriptionLong}
                                    onChange={handleInputChange}
                                    type='text'
                                />
                            </div>

                            {/* Quantity */}
                            <div className="col-6">
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                />
                            </div>

                            {/* Category */}
                            <div className="col-6">
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value="food">Food</MenuItem>
                                        <MenuItem value="powder">Powder</MenuItem>
                                        <MenuItem value="paste">Paste</MenuItem>
                                        <MenuItem value="accessories">Accessories</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            {/* Subcategory */}
                            <div className="col-6">
                                <FormControl fullWidth>
                                    <InputLabel>Subcategory</InputLabel>
                                    <Select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleSelectChange} >
                                        <MenuItem value="pickle">Pickle</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            {/* Veg / Non-Veg (only for Food or Powder) */}
                            {(formData.category === "food" || formData.category === "powder") && (
                                <div className="col-6">
                                    <FormControl>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                            Food Type
                                        </Typography>
                                        <RadioGroup
                                            row
                                            name="foodType"
                                            value={formData.foodType}
                                            onChange={handleInputChange}
                                        >
                                            <FormControlLabel value="veg" control={<Radio />} label="Veg" />
                                            <FormControlLabel value="non-veg" control={<Radio />} label="Non-Veg" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="col-12 d-flex justify-content-end gap-2">
                                <Button variant="outlined" className="cancel-btn">Cancel</Button>
                                <Button type="submit" variant="contained" className="create-btn">
                                    Create Product
                                </Button>
                            </div>
                        </div>
                    </form>
                </Paper>
            </Container>
        </div>
    )
}

export default CreateProduct
