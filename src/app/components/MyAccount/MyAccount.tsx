'use client'
import React, { useState, useEffect } from 'react'
import { Button, FormControlLabel, Radio, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Alert } from '@mui/material'
import { Edit, Delete, Add, Home, Work, LocationOn } from '@mui/icons-material'
import './MyAccount.css'

interface DeliveryAddress {
    _id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    addressType: 'home' | 'work' | 'other';
}

interface UserProfile {
    name: string;
    email: string;
    profileImage?: string;
}

const MyAccount = () => {
    const [gender, setGender] = useState("male")
    const [activeTab, setActiveTab] = useState("profile") // profile, addresses
    
    // Profile State
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [profileImage, setProfileImage] = useState("")
    
    // Address State
    const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
    const [openAddressDialog, setOpenAddressDialog] = useState(false)
    const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null)
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
        addressType: 'home' as 'home' | 'work' | 'other'
    })
    
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [loading, setLoading] = useState(false)

    // Fetch user profile
    useEffect(() => {
        fetchUserProfile()
        if (activeTab === 'addresses') {
            fetchAddresses()
        }
    }, [activeTab])

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/user/profile')
            const data = await response.json()
            if (data.success) {
                const nameParts = data.user.name.split(' ')
                setFirstName(nameParts[0] || '')
                setLastName(nameParts.slice(1).join(' ') || '')
                setEmail(data.user.email)
                setProfileImage(data.user.profileImage || '')
                // You might want to add mobile and gender to user model
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch profile')
        }
    }

    const fetchAddresses = async () => {
        try {
            const response = await fetch('/api/user/addresses')
            const data = await response.json()
            if (data.success) {
                setAddresses(data.addresses)
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch addresses')
        }
    }

    const handleUpdateProfile = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${firstName} ${lastName}`.trim(),
                    email,
                    mobile,
                    gender
                })
            })
            const data = await response.json()
            if (data.success) {
                showAlert('success', 'Profile updated successfully')
            } else {
                showAlert('error', data.message || 'Failed to update profile')
            }
        } catch (error) {
            showAlert('error', 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleAddressSubmit = async () => {
        setLoading(true)
        try {
            const url = editingAddress 
                ? `/api/user/addresses/${editingAddress._id}`
                : '/api/user/addresses'
            const method = editingAddress ? 'PUT' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressForm)
            })
            
            const data = await response.json()
            if (data.success) {
                showAlert('success', editingAddress ? 'Address updated' : 'Address added')
                setOpenAddressDialog(false)
                resetAddressForm()
                fetchAddresses()
            } else {
                showAlert('error', data.message || 'Failed to save address')
            }
        } catch (error) {
            showAlert('error', 'Failed to save address')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return
        
        try {
            const response = await fetch(`/api/user/addresses/${id}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (data.success) {
                showAlert('success', 'Address deleted')
                fetchAddresses()
            }
        } catch (error) {
            showAlert('error', 'Failed to delete address')
        }
    }

    const handleSetDefaultAddress = async (id: string) => {
        try {
            const response = await fetch(`/api/user/addresses/${id}/set-default`, {
                method: 'PATCH'
            })
            const data = await response.json()
            if (data.success) {
                showAlert('success', 'Default address updated')
                fetchAddresses()
            }
        } catch (error) {
            showAlert('error', 'Failed to set default address')
        }
    }

    const openEditDialog = (address: DeliveryAddress) => {
        setEditingAddress(address)
        setAddressForm({
            fullName: address.fullName,
            phoneNumber: address.phoneNumber,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault,
            addressType: address.addressType
        })
        setOpenAddressDialog(true)
    }

    const resetAddressForm = () => {
        setEditingAddress(null)
        setAddressForm({
            fullName: '',
            phoneNumber: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            isDefault: false,
            addressType: 'home'
        })
    }

    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 3000)
    }

    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home': return <Home />
            case 'work': return <Work />
            default: return <LocationOn />
        }
    }

    return (
        <div className="my-account-page">
            {alert && (
                <Alert severity={alert.type} className="fixed-alert">
                    {alert.message}
                </Alert>
            )}
            
            <div className="container">
                <div className="row justify-content-center">
                    <div className="account-title">My Account</div>
                    <div className='col-12 col-sm-12 col-md-2 col-lg-4 mb-4'>
                        {/* Sidebar */}
                        <div className="sidebar">
                            <div className="profile-section">
                                <div className="profile-item">
                                    <div className="profile-icon">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                            </svg>
                                        )}
                                    </div>
                                    <span>Hello, {firstName}</span>
                                </div>
                            </div>

                            <div className="settings-section">
                                <div className={`settings-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                                    </svg>
                                    Profile Information
                                </div>
                                <div className={`settings-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 16 16">
                                        <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                                        <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                                    </svg>
                                    Delivery Addresses
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className='col-12 col-sm-12 col-md-2 col-lg-8 mb-4'>
                        {/* Main Content */}
                        <div className="main-content">
                            {activeTab === 'profile' && (
                                <>
                                    {/* Personal Info */}
                                    <div className="section">
                                        <div className="section-header">
                                            <div className="section-title">Personal Information</div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    label="First Name"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    label="Last Name"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="gender-label">Your Gender</div>
                                        <div className="radio-group">
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        checked={gender === "male"}
                                                        onChange={() => setGender("male")}
                                                        value="male"
                                                        name="gender"
                                                        color="primary"
                                                    />
                                                }
                                                label="Male"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        checked={gender === "female"}
                                                        onChange={() => setGender("female")}
                                                        value="female"
                                                        name="gender"
                                                        color="primary"
                                                    />
                                                }
                                                label="Female"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="section">
                                        <div className="section-header">
                                            <div className="section-title">Email Address</div>
                                        </div>
                                        <div className="form-group full-width">
                                            <TextField
                                                type="email"
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile */}
                                    <div className="section">
                                        <div className="section-header">
                                            <div className="section-title">Mobile Number</div>
                                        </div>
                                        <div className="form-group full-width">
                                            <TextField
                                                type="tel"
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Mobile Number"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                placeholder="+91 0000000000"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="section-save">
                                        <Button 
                                            className="save-btn" 
                                            onClick={handleUpdateProfile}
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="section">
                                    <div className="section-header">
                                        <div className="section-title">Delivery Addresses</div>
                                        <Button 
                                            variant="contained" 
                                            startIcon={<Add />}
                                            onClick={() => {
                                                resetAddressForm()
                                                setOpenAddressDialog(true)
                                            }}
                                            className="add-address-btn"
                                        >
                                            Add New Address
                                        </Button>
                                    </div>

                                    <div className="addresses-grid">
                                        {addresses.length === 0 ? (
                                            <div className="no-addresses">
                                                <LocationOn style={{ fontSize: 60, color: '#ccc' }} />
                                                <p>No addresses found</p>
                                                <Button 
                                                    variant="outlined" 
                                                    onClick={() => setOpenAddressDialog(true)}
                                                >
                                                    Add Your First Address
                                                </Button>
                                            </div>
                                        ) : (
                                            addresses.map((address) => (
                                                <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                                                    <div className="address-header">
                                                        <div className="address-type">
                                                            {getAddressIcon(address.addressType)}
                                                            <span>{address.addressType.toUpperCase()}</span>
                                                        </div>
                                                        {address.isDefault && (
                                                            <span className="default-badge">Default</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="address-details">
                                                        <strong>{address.fullName}</strong>
                                                        <p>{address.addressLine1}</p>
                                                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                                                        <p>{address.city}, {address.state} - {address.postalCode}</p>
                                                        <p>{address.country}</p>
                                                        <p>Phone: {address.phoneNumber}</p>
                                                    </div>

                                                    <div className="address-actions">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => openEditDialog(address)}
                                                            title="Edit"
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleDeleteAddress(address._id)}
                                                            title="Delete"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                        {!address.isDefault && (
                                                            <Button 
                                                                size="small" 
                                                                onClick={() => handleSetDefaultAddress(address._id)}
                                                            >
                                                                Set as Default
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Dialog */}
            <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={addressForm.phoneNumber}
                            onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Address Line 1"
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Address Line 2 (Optional)"
                            value={addressForm.addressLine2}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <TextField
                                label="City"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                required
                            />
                            <TextField
                                label="State"
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <TextField
                                label="Postal Code"
                                value={addressForm.postalCode}
                                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                required
                            />
                            <TextField
                                label="Country"
                                value={addressForm.country}
                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ marginBottom: '8px', display: 'block' }}>Address Type</label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <FormControlLabel
                                    control={
                                        <Radio
                                            checked={addressForm.addressType === 'home'}
                                            onChange={() => setAddressForm({ ...addressForm, addressType: 'home' })}
                                        />
                                    }
                                    label="Home"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            checked={addressForm.addressType === 'work'}
                                            onChange={() => setAddressForm({ ...addressForm, addressType: 'work' })}
                                        />
                                    }
                                    label="Work"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            checked={addressForm.addressType === 'other'}
                                            onChange={() => setAddressForm({ ...addressForm, addressType: 'other' })}
                                        />
                                    }
                                    label="Other"
                                />
                            </div>
                        </div>
                        <FormControlLabel
                            control={
                                <Radio
                                    checked={addressForm.isDefault}
                                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                />
                            }
                            label="Set as default address"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddressDialog(false)} sx={{color:'#00a651'}}>Cancel</Button>
                    <Button onClick={handleAddressSubmit} className='save-btn' variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Address'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default MyAccount