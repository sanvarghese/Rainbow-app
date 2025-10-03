'use client';

import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { TextField, Button, Typography, Paper, Alert } from '@mui/material';
import '../ForgotPassword/ForgotPassword.css'

const ForgotPassword: React.FC = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        // Here you'd trigger your backend API to send reset link
        console.log('Email submitted:', email);
        setStep(2);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Password reset with:', formData);
        // Call API to update password
    };

    return (
        <Container className="forgot-section d-flex align-items-center justify-content-center min-vh-100">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h4" align="center" gutterBottom className='title'>
                            Forgot Password
                        </Typography>

                        {/* Step 1: Email Form */}
                        {step === 1 && (
                            <form onSubmit={handleEmailSubmit}>
                                <div className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={!email}
                                    className='submit-btn'
                                >
                                    Submit
                                </Button>
                            </form>
                        )}

                        {/* Step 2: Show message + password form */}
                        {step === 2 && (
                            <>
                                <Alert severity="success" className="mb-3">
                                    Check your email for the password reset instructions.
                                </Alert>
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="mb-3">
                                        <TextField
                                            fullWidth
                                            label="New Password"
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <TextField
                                            fullWidth
                                            label="Confirm Password"
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        className='rest-btn'
                                    >
                                        Reset Password
                                    </Button>
                                </form>
                            </>
                        )}
                    </Paper>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;
