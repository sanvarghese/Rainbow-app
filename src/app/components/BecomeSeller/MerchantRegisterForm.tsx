'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import '../BecomeSeller/BecomeSeller.css'
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Alert,
    Chip,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MerchantRegisterForm: React.FC = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Pre-fill form when user is already logged in
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user?.name || "",
                email: session.user?.email || "",
                // Password fields left empty intentionally for logged-in users
            }));
        }
    }, [session]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLoggedIn) {
                // User is already logged in — just upgrade their role to merchant
                const res = await fetch('/api/auth/merchant-signup/upgrade-to-merchant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Something went wrong');

                router.push('/dashboard');
                router.refresh();
            } else {
                // Fresh signup flow
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }

                const res = await fetch('/api/auth/merchant-signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Something went wrong');

                const result = await signIn('credentials', {
                    redirect: false,
                    email: formData.email,
                    password: formData.password,
                });

                if (result?.error) throw new Error('Registration successful but login failed');

                router.push('/dashboard');
                router.refresh();
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
                    background: "linear-gradient(135deg, #007F27 0%, #00bb38ff 100%)",
                    color: "white",
                    py: 6,
                    my: 6,
                    textAlign: "center",
                }}>
                <Container>
                    <Typography variant="h3" fontWeight="bold">
                        Create Your Merchant Account
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                        Step 1 of 3: Account Registration
                    </Typography>
                </Container>
            </Box>

            <Container className="mt-n4 mb-5">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>

                    {/* Show a notice banner when user is already logged in */}
                    {isLoggedIn && (
                        <Alert
                            severity="info"
                            icon={<CheckCircleIcon />}
                            sx={{ mb: 3 }}
                        >
                            You&apos;re already signed in as <strong>{session?.user?.email}</strong>. 
                            Your account details are pre-filled. Just add your phone number to continue.
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    // Make read-only if logged in — name comes from session
                                    InputProps={{
                                        readOnly: isLoggedIn,
                                        endAdornment: isLoggedIn ? (
                                            <Chip label="From account" size="small" color="success" variant="outlined" />
                                        ) : null,
                                    }}
                                    sx={isLoggedIn ? { backgroundColor: '#f9f9f9' } : {}}
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
                                    // Make read-only if logged in — email comes from session
                                    InputProps={{
                                        readOnly: isLoggedIn,
                                        endAdornment: isLoggedIn ? (
                                            <Chip label="From account" size="small" color="success" variant="outlined" />
                                        ) : null,
                                    }}
                                    sx={isLoggedIn ? { backgroundColor: '#f9f9f9' } : {}}
                                />
                            </div>

                            <div className="col-12">
                                <TextField
                                    fullWidth
                                    label="Phone number"
                                    name="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Hide password fields entirely when the user is already logged in */}
                            {!isLoggedIn && (
                                <>
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
                                </>
                            )}

                            <div className="col-12 d-flex justify-content-end gap-2">
                                <Button
                                    variant="outlined"
                                    className="cancel-btn"
                                    onClick={() => router.push('/')}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="create-btn"
                                    disabled={loading}>
                                    {loading
                                        ? 'Processing...'
                                        : isLoggedIn
                                            ? 'Upgrade to Merchant & Continue'
                                            : 'Create Account & Continue'
                                    }
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