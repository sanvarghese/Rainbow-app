'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col } from 'react-bootstrap';
import { TextField, Button, Typography, Paper, Link, Alert } from '@mui/material';
import '../login/Login.css';

const SignUpPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/sign-up', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Redirect to login after successful signup
            router.push('/auth/login?registered=true');
        } catch (err: any) {
            console.log(err.message,"error message from login.!")
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="login-section d-flex align-items-center justify-content-center min-vh-100">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h4" align="center" gutterBottom className='title'>
                            Sign up
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
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

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                className='submit-btn'
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Sign up'}
                            </Button>

                            <div className="text-center mt-3">
                                <Typography variant="body2">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" underline="hover">
                                        Login
                                    </Link>
                                </Typography>
                            </div>
                        </form>
                    </Paper>
                </Col>
            </Row>
        </Container>
    );
};

export default SignUpPage;