"use client";

import React, { useState, useEffect } from "react";
import {
    Box, Button, Container, Paper, TextField, Typography, Alert, CircularProgress, IconButton,
} from "@mui/material";
import { Upload, X } from 'lucide-react';

interface AdminCreateCompanyProps {
    onSuccess?: () => void;
    initialData?: any;
}

const AdminCreateCompany: React.FC<AdminCreateCompanyProps> = ({ onSuccess, initialData }) => {
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

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Load initial data when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                companyLogo: null,
                badges: null,
                banner: null,
                name: initialData.name || "",
                description: initialData.description || "",
                address: initialData.address || "",
                email: initialData.email || "",
                phoneNumber: initialData.phoneNumber || "",
                gstNumber: initialData.gstNumber || "",
                instagramLink: initialData.instagramLink || "",
                facebookLink: initialData.facebookLink || "",
            });

            setPreview({
                companyLogo: initialData.companyLogo || "",
                badges: initialData.badges || "",
                banner: initialData.banner || "",
            });
        }
    }, [initialData]);

    const validateField = (name: string, value: string) => {
        let errorMsg = '';

        switch (name) {
            case 'name':
                if (!value.trim()) errorMsg = 'Company name is required';
                break;
            case 'email':
                if (!value.trim()) {
                    errorMsg = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMsg = 'Invalid email format';
                }
                break;
            case 'phoneNumber':
                if (!value.trim()) {
                    errorMsg = 'Phone number is required';
                } else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
                    errorMsg = 'Invalid phone number (10 digits required)';
                }
                break;
            case 'address':
                if (!value.trim()) errorMsg = 'Address is required';
                break;
        }

        setFieldErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));

        return !errorMsg;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
        validateField(name, value);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "companyLogo" | "badges" | "banner"
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError(`${field} file size must be less than 5MB`);
                return;
            }

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

    const removeImage = (field: "companyLogo" | "badges" | "banner") => {
        setFormData((prev) => ({ ...prev, [field]: null }));
        setPreview((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFieldErrors({});

        // Validate required fields
        const requiredFields = ['name', 'email', 'phoneNumber', 'address'];
        let hasErrors = false;

        requiredFields.forEach(field => {
            if (!validateField(field, formData[field as keyof typeof formData] as string)) {
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setError('Please fix the errors above');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Add text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && typeof value === 'string') {
                    formDataToSend.append(key, value);
                }
            });

            // Add files
            if (formData.companyLogo) formDataToSend.append("companyLogo", formData.companyLogo);
            if (formData.badges) formDataToSend.append("badges", formData.badges);
            if (formData.banner) formDataToSend.append("banner", formData.banner);

            // Add existing images when updating
            if (initialData?._id) {
                formDataToSend.append("companyId", initialData._id);
                if (preview.companyLogo && !formData.companyLogo) {
                    formDataToSend.append("existingCompanyLogo", preview.companyLogo);
                }
                if (preview.badges && !formData.badges) {
                    formDataToSend.append("existingBadges", preview.badges);
                }
                if (preview.banner && !formData.banner) {
                    formDataToSend.append("existingBanner", preview.banner);
                }
            }

            const res = await fetch('/api/admin/company', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || 'Something went wrong');
            }

            setSuccess(data.message);

            if (!initialData) {
                // Reset form only for create
                setFormData({
                    companyLogo: null,
                    badges: null,
                    banner: null,
                    name: "",
                    description: "",
                    address: "",
                    email: "",
                    phoneNumber: "",
                    gstNumber: "",
                    instagramLink: "",
                    facebookLink: "",
                });
                setPreview({ companyLogo: "", badges: "", banner: "" });
            }

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
        <div className="create-company-section min-vh-100 bg-light">
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
                        {initialData ? 'Edit Company' : 'Create Company Profile'}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                        {initialData ? 'Update company details' : 'Fill in the details below to register your company'}
                    </Typography>
                </Container>
            </Box>

            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            {/* Company Logo */}
                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Company Logo
                                </Typography>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<Upload />}
                                    sx={{ mb: 2 }}
                                >
                                    Upload Logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleFileChange(e, "companyLogo")}
                                    />
                                </Button>
                                {preview.companyLogo && (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={preview.companyLogo}
                                            alt="Company Logo"
                                            style={{ maxWidth: "200px", borderRadius: "8px" }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeImage("companyLogo")}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'rgba(200, 0, 0, 1)' }
                                            }}
                                        >
                                            <X size={16} />
                                        </IconButton>
                                    </div>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="col-md-6">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Badges (Optional)
                                </Typography>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<Upload />}
                                    sx={{ mb: 2 }}
                                >
                                    Upload Badges
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleFileChange(e, "badges")}
                                    />
                                </Button>
                                {preview.badges && (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={preview.badges}
                                            alt="Badges"
                                            style={{ maxWidth: "200px", borderRadius: "8px" }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeImage("badges")}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'rgba(200, 0, 0, 1)' }
                                            }}
                                        >
                                            <X size={16} />
                                        </IconButton>
                                    </div>
                                )}
                            </div>

                            {/* Banner Image */}
                            <div className="col-12">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Banner Image (Optional)
                                </Typography>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<Upload />}
                                    sx={{ mb: 2 }}
                                >
                                    Upload Banner
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleFileChange(e, "banner")}
                                    />
                                </Button>
                                {preview.banner && (
                                    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                                        <img
                                            src={preview.banner}
                                            alt="Banner"
                                            style={{
                                                maxWidth: "100%",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeImage("banner")}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'rgba(200, 0, 0, 1)' }
                                            }}
                                        >
                                            <X size={16} />
                                        </IconButton>
                                    </div>
                                )}
                            </div>

                            {/* Text Inputs */}
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    error={!!fieldErrors.name}
                                    helperText={fieldErrors.name}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    error={!!fieldErrors.email}
                                    helperText={fieldErrors.email}
                                />
                            </div>

                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    error={!!fieldErrors.address}
                                    helperText={fieldErrors.address}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    type="tel"
                                    error={!!fieldErrors.phoneNumber}
                                    helperText={fieldErrors.phoneNumber}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="GST Number (Optional)"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Facebook Link (Optional)"
                                    name="facebookLink"
                                    value={formData.facebookLink}
                                    onChange={handleInputChange}
                                    placeholder="https://www.facebook.com/"
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Instagram Link (Optional)"
                                    name="instagramLink"
                                    value={formData.instagramLink}
                                    onChange={handleInputChange}
                                    placeholder="https://www.instagram.com/"
                                />
                            </div>

                            {/* Actions */}
                            <div className="col-12">
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    pt: 2,
                                    borderTop: '2px solid #e0e0e0'
                                }}>
                                    <Typography variant="body2" color="textSecondary">
                                        * Required fields
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            className="cancel-btn"
                                            disabled={loading}
                                            sx={{
                                                borderColor: '#006d21ff',
                                                color: '#006d21ff',
                                                '&:hover': {
                                                    borderColor: '#00bb38ff',
                                                    backgroundColor: 'rgba(0, 109, 33, 0.04)'
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="create-btn"
                                            disabled={loading}
                                            sx={{
                                                backgroundColor: '#006d21ff',
                                                minWidth: '160px',
                                                '&:hover': { backgroundColor: '#00bb38ff' },
                                                '&:disabled': { backgroundColor: '#ccc' }
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                                    {initialData ? 'Updating...' : 'Creating...'}
                                                </>
                                            ) : (
                                                <>
                                                    {initialData ? 'Update Company' : 'Create Company'}
                                                </>
                                            )}
                                        </Button>
                                    </Box>
                                </Box>
                            </div>
                        </div>
                    </form>
                </Paper>
            </Container>
        </div>
    );
};

export default AdminCreateCompany