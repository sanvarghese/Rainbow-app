'use client';

import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { TextField, Button, Typography, Paper, Link } from '@mui/material';
import '../login/Login.css'

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <Container className="login-section d-flex align-items-center justify-content-center min-vh-100">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h4" align="center" gutterBottom className='title'>
                            Login
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
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
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Forgot Password link */}
                            <div className="d-flex justify-content-end mb-3">
                                <Link href="/forgot-password" underline="hover" className='login-link'>
                                    Forgot Password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                className='submit-btn'
                            >
                                Login
                            </Button>
                        </form>
                    </Paper>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;
