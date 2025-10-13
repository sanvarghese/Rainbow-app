"use client"

import React, { useEffect, useState } from 'react'
import {
    Box, Button, Container, Paper, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Radio, RadioGroup, FormControlLabel, Alert, CircularProgress,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import '../BecomeSeller/BecomeSeller.css'

interface CreateProductProps {
    onSuccess?: () => void;
    initialData?: any;
}

const CreateProduct: React.FC<CreateProductProps> = ({ onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        productImage: null as File | null,
        badges: null as File | null,
        name: "",
        descriptionShort: "",
        descriptionLong: "",
        quantity: "",
        prize: "",
        offerPrize:"",
        category: "",
        subCategory: "",
        foodType: "",
    });

    const [preview, setPreview] = useState({
        productImage: "",
        badges: ""
    });

    // const [error, setError] = useState('');
    // const [success, setSuccess] = useState('');
    // const [loading, setLoading] = useState(false);
    // const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Load initial data when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                productImage: null,
                badges: null,
                name: initialData.name || "",
                descriptionShort: initialData.descriptionShort || "",
                descriptionLong: initialData.descriptionLong || "",
                quantity: initialData.quantity?.toString() || "",
                prize: initialData.prize?.toString() || "",
                offerPrize: initialData.OfferPrize?.toString() || "",
                category: initialData.category || "",
                subCategory: initialData.subCategory || "",
                foodType: initialData.foodType || "",
            });
            setPreview({
                productImage: initialData.productImage || "",
                badges: initialData.badges || ""
            });
        }
    }, [initialData]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
        let errorMsg = '';

        switch (name) {
            case 'name':
                if (!value.trim()) errorMsg = 'Product name is required';
                break;
            case 'descriptionShort':
                if (!value.trim()) {
                    errorMsg = 'Description is required';
                } else if (value.length < 50) {
                    errorMsg = `Description must be at least 50 characters (current: ${value.length})`;
                }
                break;
            case 'quantity':
                const qty = Number(value);
                if (!value) {
                    errorMsg = 'Quantity is required';
                } else if (isNaN(qty) || qty < 0) {
                    errorMsg = 'Quantity must be a positive number';
                }
                break;
                case 'prize':
                const prize = Number(value);
                if (!value) {
                    errorMsg = 'Prize is required';
                } else if (isNaN(prize) || prize < 0) {
                    errorMsg = 'Prize must be a positive number';
                }
                break;
                 case 'offerPrize':
                const offerPrize = Number(value);
                if (!value) {
                    errorMsg = 'Offer Prize is required';
                } else if (isNaN(offerPrize) || offerPrize < 0) {
                    errorMsg = 'Offer Prize must be a positive number';
                }
                break;
            case 'category':
                if (!value) errorMsg = 'Please select a category';
                break;
            case 'subCategory':
                if (!value) errorMsg = 'Please select a subcategory';
                break;
        }

        setFieldErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));

        return !errorMsg;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target as HTMLInputElement;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
        validateField(name, value);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "productImage" | "badges"
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError(`${field} file size must be less than 5MB`);
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError(`${field} must be an image file`);
                return;
            }

            setFormData((prev) => ({ ...prev, [field]: file }));
            setError('');

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview((prev) => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
        validateField(name, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({});

        // Validate all required fields
        const requiredFields = ['name', 'descriptionShort', 'quantity','prize','offer prize', 'category', 'subCategory'];
        let hasErrors = false;

        requiredFields.forEach(field => {
            if (!validateField(field, formData[field as keyof typeof formData] as string)) {
                hasErrors = true;
            }
        });

        // Validate food type for food/powder categories
        if ((formData.category === 'food' || formData.category === 'powder') && !formData.foodType) {
            setFieldErrors(prev => ({
                ...prev,
                foodType: 'Food type is required for food and powder categories'
            }));
            hasErrors = true;
        }

        if (hasErrors) {
            setError('Please fix the errors above');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Add all fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (value instanceof File) {
                        formDataToSend.append(key, value);
                    } else {
                        formDataToSend.append(key, value.toString());
                    }
                }
            });

            if (initialData?._id) {
                formDataToSend.append("productId", initialData._id);
            }

            const res = await fetch('/api/merchant/product', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || 'Something went wrong');
            }

            setSuccess(data.message);

            // Reset form
            setFormData({
                productImage: null,
                badges: null,
                name: "",
                descriptionShort: "",
                descriptionLong: "",
                quantity: "",
                prize:"",
                offerPrize:"",
                category: "",
                subCategory: "",
                foodType: "",
            });
            setPreview({ productImage: "", badges: "" });

            if (onSuccess) {
                setTimeout(() => onSuccess(), 1500);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product-section min-vh-100 bg-light">
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
                        {initialData ? 'Edit Product' : 'Create Your Product'}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                        {initialData ? 'Update product details' : 'Step 3 of 3: Add Product Details'}
                    </Typography>
                </Container>
            </Box>

            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Product Image
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
                                        style={{ maxWidth: "200px", marginTop: "10px", borderRadius: "8px" }}
                                    />
                                )}
                            </div>

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
                                        style={{ maxWidth: "200px", marginTop: "10px", borderRadius: "8px" }}
                                    />
                                )}
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    type='text'
                                    error={!!fieldErrors.name}
                                    helperText={fieldErrors.name}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Short Description (At least 50 characters)"
                                    name="descriptionShort"
                                    value={formData.descriptionShort}
                                    onChange={handleInputChange}
                                    required
                                    type='text'
                                    error={!!fieldErrors.descriptionShort}
                                    helperText={fieldErrors.descriptionShort}
                                />
                            </div>

                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Long Description (Optional)"
                                    name="descriptionLong"
                                    multiline
                                    rows={3}
                                    value={formData.descriptionLong}
                                    onChange={handleInputChange}
                                    type='text'
                                />
                            </div>

                            <div className="col-6">
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                    error={!!fieldErrors.quantity}
                                    helperText={fieldErrors.quantity}
                                />
                            </div>

                            <div className="col-6">
                                <TextField
                                    fullWidth
                                    label="Prize"
                                    name="prize"
                                    value={formData.prize}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                    error={!!fieldErrors.prize}
                                    helperText={fieldErrors.prize}
                                />
                            </div>

                             <div className="col-6">
                                <TextField
                                    fullWidth
                                    label="Offer Prize"
                                    name="offerPrize"
                                    value={formData.offerPrize}
                                    onChange={handleInputChange}
                                    required
                                    type='number'
                                    error={!!fieldErrors.offerPrize}
                                    helperText={fieldErrors.offerPrize}
                                />
                            </div>

                            <div className="col-6">
                                <FormControl fullWidth required error={!!fieldErrors.category}>
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
                                    {fieldErrors.category && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                            {fieldErrors.category}
                                        </Typography>
                                    )}
                                </FormControl>
                            </div>

                            <div className="col-6">
                                <FormControl fullWidth required error={!!fieldErrors.subCategory}>
                                    <InputLabel>Subcategory</InputLabel>
                                    <Select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleSelectChange}>
                                        <MenuItem value="pickle">Pickle</MenuItem>
                                        <MenuItem value="spices">Spices</MenuItem>
                                        <MenuItem value="snacks">Snacks</MenuItem>
                                    </Select>
                                    {fieldErrors.subCategory && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                            {fieldErrors.subCategory}
                                        </Typography>
                                    )}
                                </FormControl>
                            </div>

                            {(formData.category === "food" || formData.category === "powder") && (
                                <div className="col-6">
                                    <FormControl required error={!!fieldErrors.foodType}>
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
                                        {fieldErrors.foodType && (
                                            <Typography variant="caption" color="error">
                                                {fieldErrors.foodType}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </div>
                            )}

                            <div className="col-12 d-flex justify-content-end gap-2">
                                <Button
                                    variant="outlined"
                                    className="cancel-btn"
                                    disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="create-btn"
                                    disabled={loading}>
                                    {loading ? (
                                        <>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            {initialData ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (initialData ? 'Update Product' : 'Create Product')}
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