'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Alert,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateCompanyForm from '../components/BecomeSeller/CreateCompanyForm';
import CreateProduct from '../components/BecomeSeller/CreateProduct';
import MerchantDashboardView from '../components/MerchantDashboardView/MerchantDashboardView';

interface OnboardingStatus {
    hasCompany: boolean;
    hasProducts: boolean;
    completedSteps: {
        step1: boolean;
        step2: boolean;
        step3: boolean;
    };
    nextStep: number | 'complete';
    company: any;
    products: any[];
}

export default function MerchantDashboard() {
    const router = useRouter();
    const [status, setStatus] = useState<OnboardingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [showView, setShowView] = useState<'preview' | 'editCompany' | 'editProduct' | 'addProduct' | 'dashboard'>('preview');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);

    const steps = ['Account Created', 'Company Profile', 'Add Products'];

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    useEffect(() => {
        // If we're returning from dashboard and setup is complete, redirect back
        if (setupComplete && showView === 'preview') {
            const savedStatus = localStorage.getItem('merchantSetupComplete');
            if (savedStatus === 'true') {
                router.push('/dashboard');
            }
        }
    }, [setupComplete, showView, router]);

    const checkOnboardingStatus = async () => {
        try {
            const res = await fetch('/api/merchant/status');
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStatus(data);

            // Check if setup is complete
            const isComplete = data.hasCompany && data.hasProducts;
            setSetupComplete(isComplete);

            if (!data.hasCompany) {
                setActiveStep(1);
                setShowView('editCompany');
            } else if (!data.hasProducts) {
                setActiveStep(2);
                setShowView('addProduct');
            } else {
                setActiveStep(3);
                setShowView('preview');
            }
        } catch (error) {
            console.error('Status check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySuccess = () => checkOnboardingStatus();
    const handleProductSuccess = () => checkOnboardingStatus();
    const handleEditCompany = () => setShowView('editCompany');
    const handleAddProduct = () => {
        setSelectedProduct(null);
        setShowView('addProduct');
    };
    const handleEditProduct = (product: any) => {
        setSelectedProduct(product);
        setShowView('editProduct');
    };
    const handleBackToPreview = () => {
        setShowView('preview');
        setSelectedProduct(null);
        checkOnboardingStatus();
    };
    const handleSaveAll = () => setShowSaveDialog(true);
    const handleConfirmSave = async () => {
        setShowSaveDialog(false);
        
        try {
            // Mark setup as complete
            const res = await fetch('/api/merchant/complete-setup', {
                method: 'POST',
            });

            if (res.ok) {
                localStorage.setItem('merchantSetupComplete', 'true');
                // Refresh the page to trigger server-side role check
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to complete setup:', error);
        }
    };
    const handleViewDashboard = () => {
        // Temporarily view dashboard without saving
        router.push('/merchant-preview');
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    // Show onboarding if not complete
    if (status && (!status.hasCompany || !status.hasProducts)) {
        return (
            <Container sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h4" gutterBottom className="text-center">
                        Complete Your Merchant Setup
                    </Typography>
                    <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>

                {!status.hasCompany && <CreateCompanyForm onSuccess={handleCompanySuccess} />}
                {status.hasCompany && !status.hasProducts && <CreateProduct onSuccess={handleProductSuccess} />}
            </Container>
        );
    }

    // Show merchant dashboard view
    if (showView === 'dashboard') {
        const handleBack = () => setShowView('preview');
        return <MerchantDashboardView onBackToPreview={handleBack} isStandalone={false} />;
    }

    // Show edit company form
    if (showView === 'editCompany') {
        return (
            <Container sx={{ py: 4 }}>
                <Button variant="outlined" onClick={handleBackToPreview} sx={{ mb: 3 }}>
                    ← Back to Preview
                </Button>
                <CreateCompanyForm onSuccess={handleBackToPreview} />
            </Container>
        );
    }

    // Show add/edit product form
    if (showView === 'addProduct' || showView === 'editProduct') {
        return (
            <Container sx={{ py: 4 }}>
                <Button variant="outlined" onClick={handleBackToPreview} sx={{ mb: 3 }}>
                    ← Back to Preview
                </Button>
                <CreateProduct onSuccess={handleBackToPreview} initialData={selectedProduct} />
            </Container>
        );
    }

    // Show preview section
    return (
        <Container sx={{ py: 4 }}>
            {/* Company Preview */}
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Company Profile</Typography>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditCompany}>
                        Edit Company
                    </Button>
                </Box>

                <div className="row g-4">
                    {status?.company?.companyLogo && (
                        <div className="col-md-4 col-12">
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Company Logo
                            </Typography>
                            <img
                                src={status.company.companyLogo}
                                alt="Company Logo"
                                style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                    )}

                    {status?.company?.banner && (
                        <div className="col-12">
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Banner</Typography>
                            <img
                                src={status.company.banner}
                                alt="Banner"
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                    )}

                    <div className="col-md-8 col-12">
                        <Typography variant="h6" gutterBottom>{status?.company?.name}</Typography>
                        {status?.company?.description && (
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {status.company.description}
                            </Typography>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <div className="row g-3">
                            <div className="col-sm-6">
                                <Typography variant="body2" color="text.secondary">Email</Typography>
                                <Typography variant="body1">{status?.company?.email}</Typography>
                            </div>
                            <div className="col-sm-6">
                                <Typography variant="body2" color="text.secondary">Phone</Typography>
                                <Typography variant="body1">{status?.company?.phoneNumber}</Typography>
                            </div>
                            <div className="col-12">
                                <Typography variant="body2" color="text.secondary">Address</Typography>
                                <Typography variant="body1">{status?.company?.address}</Typography>
                            </div>
                            {status?.company?.gstNumber && (
                                <div className="col-sm-6">
                                    <Typography variant="body2" color="text.secondary">GST Number</Typography>
                                    <Typography variant="body1">{status.company.gstNumber}</Typography>
                                </div>
                            )}
                            {(status?.company?.facebookLink || status?.company?.instagramLink) && (
                                <div className="col-12">
                                    <Typography variant="body2" color="text.secondary" gutterBottom>Social Media</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {status?.company?.facebookLink && (
                                            <Chip label="Facebook" component="a" href={status.company.facebookLink} target="_blank" clickable size="small" />
                                        )}
                                        {status?.company?.instagramLink && (
                                            <Chip label="Instagram" component="a" href={status.company.instagramLink} target="_blank" clickable size="small" />
                                        )}
                                    </Box>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Paper>

            {/* Products Preview */}
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Your Products ({status?.products?.length || 0})</Typography>
                    <Button variant="contained" onClick={handleAddProduct}>+ Add Product</Button>
                </Box>

                {status?.products && status.products.length > 0 ? (
                    <div className="row g-4">
                        {status.products.map((product: any) => (
                            <div className="col-md-4 col-sm-6 col-12" key={product._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleEditProduct(product)}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            zIndex: 1,
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                                        }}>
                                        Edit
                                    </Button>
                                    {product.productImage && (
                                        <CardMedia component="img" height="200" image={product.productImage} alt={product.name} sx={{ objectFit: 'cover' }} />
                                    )}
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" gutterBottom>{product.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {product.descriptionShort.substring(0, 100)}
                                            {product.descriptionShort.length > 100 ? '...' : ''}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                            <Chip label={product.category} size="small" color="primary" />
                                            <Chip label={product.subCategory} size="small" variant="outlined" />
                                            {product.foodType && (
                                                <Chip label={product.foodType} size="small" color={product.foodType === 'veg' ? 'success' : 'error'} />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Quantity: <strong>{product.quantity}</strong>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Alert severity="info">No products added yet. Click "Add Product" to get started.</Alert>
                )}
            </Paper>

            {/* Save Section */}
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>Merchant Setup Preview</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" />
                            <Typography color="success.main">Review your details before saving</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<DashboardIcon />} onClick={handleViewDashboard} sx={{ textTransform: 'capitalize' }}>
                            View Dashboard
                        </Button>
                        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveAll} size="large" sx={{ textTransform: 'capitalize' }}>
                            Save All & Complete
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Save Confirmation Dialog */}
            <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
                <DialogTitle>Confirm Save</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to save all changes and complete the setup? Your profile will be submitted for approval.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSaveDialog(false)} sx={{ color: '#2e7d32', textTransform: 'capitalize' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmSave} variant="contained" color="success" sx={{ textTransform: 'capitalize' }}>
                        Confirm & Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}