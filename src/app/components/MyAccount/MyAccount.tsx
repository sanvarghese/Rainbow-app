import React from 'react'
import { Button, TextField } from '@mui/material'
import './MyAccount.css'

const MyAccount = () => {
    return (
        <div className="container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="account-title">My Account</div>

                <div className="profile-section">
                    <div className="profile-item">
                        <div className="profile-icon">👤</div>
                        <span>Hello</span>
                    </div>
                </div>

                <div className="settings-section">
                    <div className="settings-title">
                        <div className="settings-icon"></div>
                        ACCOUNT SETTINGS
                    </div>
                    <div className="settings-item">Profile Information</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Personal Info */}
                <div className="section">
                    <div className="section-header">
                        <div className="section-title">Personal Information</div>
                        <a href="#" className="edit-link">
                            Edit
                        </a>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="First Name"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Last Name"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="gender-label">Your Gender</div>
                    <div className="radio-group">
                        <div className="radio-item">
                            <div className="radio-input checked"></div>
                            <label className="radio-label">Male</label>
                        </div>
                        <div className="radio-item">
                            <div className="radio-input"></div>
                            <label className="radio-label">Female</label>
                        </div>
                    </div>

                    <div className="section-save">
                        <Button className="save-btn">Save</Button>
                    </div>
                </div>

                {/* Email */}
                <div className="section">
                    <div className="section-header">
                        <div className="section-title">Email Address</div>
                        <a href="#" className="edit-link">
                            Edit
                        </a>
                    </div>

                    <div className="form-group full-width">
                        <TextField
                            type="email"
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="example@domain.com"
                            className="form-input"
                        />
                    </div>

                    <div className="section-save">
                        <Button className="save-btn">Save</Button>
                    </div>
                </div>

                {/* Mobile */}
                <div className="section">
                    <div className="section-header">
                        <div className="section-title">Mobile Number</div>
                        <a href="#" className="edit-link">
                            Edit
                        </a>
                    </div>

                    <div className="form-group full-width">
                        <TextField
                            type="tel"
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="+91 0000000000"
                            className="form-input"
                        />
                    </div>

                    <div className="section-save">
                        <Button className="save-btn">Save</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyAccount
