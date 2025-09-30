'use client'
import React, { useState } from 'react'
import { Button, FormControlLabel, Radio, TextField } from '@mui/material'
import './MyAccount.css'

const MyAccount = () => {
    const [gender, setGender] = useState("male")

    return (

        <div className="my-account-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="account-title ">My Account</div>
                    <div className='col-12 col-sm-12 col-md-2 col-lg-4 mb-4'>
                        {/* Sidebar */}
                        <div className="sidebar">

                            <div className="profile-section">
                                <div className="profile-item">
                                    <div className="profile-icon">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                            </svg>
                                        </span>
                                    </div>
                                    <span>Hello</span>
                                </div>
                            </div>

                            <div className="settings-section">
                                <div className="settings-title">
                                    <div className="settings-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40"
                                            height="40" fill="currentColor" className="bi bi-person-fill-gear"
                                            viewBox="0 0 16 16">
                                            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
                                        </svg>
                                    </div>
                                    <div className='setting-title d-grid'>
                                        <span className='act-setting'>
                                            ACCOUNT SETTINGS
                                        </span>
                                        <span className="settings-item">
                                            Profile Information
                                        </span>
                                    </div>
                                </div>
                                {/* <div className="settings-item">Profile Information</div> */}
                            </div>
                        </div>
                    </div>
                    <div className='col-12 col-sm-12 col-md-2 col-lg-8 mb-4'>

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
                                    <div className="section-save">
                                        <Button className="save-btn">Save</Button>
                                    </div>
                                </div>

                                {/* ✅ Fixed Gender Radio */}
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
                                    <a href="#" className="edit-link">
                                        Edit
                                    </a>
                                </div>

                                <div className="form-group full-width d-flex justify-content-center align-items-center">
                                    <TextField
                                        type="email"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        placeholder="example@domain.com"
                                        className="form-input"
                                    />
                                    <div className="section-save">
                                        <Button className="save-btn">Save</Button>
                                    </div>
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

                                <div className="form-group full-width d-flex justify-content-center align-items-center">
                                    <TextField
                                        type="tel"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        placeholder="+91 0000000000"
                                        className="form-input"
                                    />
                                    <div className="section-save">
                                        <Button className="save-btn">Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyAccount
