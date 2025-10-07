"use client";

import React, { useState, useEffect } from "react";
import "../BecomeSeller/BecomeSeller.css";
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Alert,
} from "@mui/material";

interface CreateCompanyFormProps {
    onSuccess?: () => void;
}

const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({ onSuccess }) => {
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

    // Load existing company data if editing
    useEffect(() => {
        loadCompanyData();
    }, []);

    const loadCompanyData = async () => {
        try {
            const res = await fetch("/api/merchant/company");
            const data = await res.json();

            if (data.company) {
                setFormData({
                    ...data.company,
                    companyLogo: null,
                    badges: null,
                    banner: null,
                });

                setPreview({
                    companyLogo: data.company.companyLogo || "",
                    badges: data.company.badges || "",
                    banner: data.company.banner || "",
                });
            }
        } catch (error) {
            console.error("Failed to load company data:", error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const form = new FormData();

            // append text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value && typeof value === "string") {
                    form.append(key, value);
                }
            });

            // append files
            if (formData.companyLogo) form.append("companyLogo", formData.companyLogo);
            if (formData.badges) form.append("badges", formData.badges);
            if (formData.banner) form.append("banner", formData.banner);

            const res = await fetch("/api/merchant/company", {
                method: "POST",
                body: form,
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || "Failed to save company");

            setSuccess("Company saved successfully!");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setError("");
    //     setSuccess("");

    //     try {
    //         const form = new FormData();
    //         Object.entries(formData).forEach(([key, value]) => {
    //             if (value && typeof value === "string") {
    //                 form.append(key, value);
    //             }
    //         });
    //         if (formData.companyLogo) form.append("companyLogo", formData.companyLogo);
    //         if (formData.badges) form.append("badges", formData.badges);
    //         if (formData.banner) form.append("banner", formData.banner);

    //         console.log("FormData entries:", [...form.entries()]);

    //         const res = await fetch("/api/merchant/company", {
    //             method: "POST",
    //             body: form,
    //         });

    //         const text = await res.text();
    //         console.log("Raw response:", text);

    //         let result;
    //         try {
    //             result = JSON.parse(text);
    //         } catch (parseError) {
    //             throw new Error("Invalid JSON response from server");
    //         }

    //         if (!res.ok) throw new Error(result.message || "Failed to save company");

    //         setSuccess("Company saved successfully!");
    //         if (onSuccess) onSuccess();
    //     } catch (err: any) {
    //         console.error("Error in handleSubmit:", err);
    //         setError(err.message || "Something went wrong");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="create-company-section min-vh-100 bg-light">
            {/* Banner Section */}
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

            {/* Form Section */}
            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            {/* File Inputs with Preview */}
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

                            {/* Text Inputs */}
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
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="GST Number"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Facebook Link"
                                    name="facebookLink"
                                    value={formData.facebookLink}
                                    onChange={handleInputChange}
                                    placeholder="https://www.facebook.com/"
                                />
                            </div>

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
                                <Button
                                    variant="outlined"
                                    className="cancel-btn"
                                    onClick={() => loadCompanyData()}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="create-btn"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Create Company"}
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
