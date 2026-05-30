'use client'

import React, { useState, useEffect, useRef } from 'react'
import './TopHeader.css'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

const TopHeader = () => {
    const { data: session, status } = useSession()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isFullyOnboarded, setIsFullyOnboarded] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const dropdownRef = useRef<HTMLLIElement>(null)

    const userRole = (session?.user?.role as string)?.toLowerCase() || 'user'
    const isMerchant = userRole === 'merchant'

    const showDashboard = isMerchant || userRole === 'admin'
    const showBecomeSeller = !isFullyOnboarded  // Only show if merchant but not fully onboarded

    // Check full merchant onboarding status
    useEffect(() => {
        if (!session?.user?.email || !isMerchant) {
            setIsFullyOnboarded(false)
            setIsLoading(false)
            return
        }

        const checkOnboardingStatus = async () => {
            try {
                setIsLoading(true)
                const res = await fetch('/api/merchant/onboarding-status')

                if (!res.ok) throw new Error('Failed to fetch')

                const data = await res.json()
                setIsFullyOnboarded(data.isFullyOnboarded ?? false)
            } catch (error) {
                console.error('Onboarding status fetch failed:', error)
                setIsFullyOnboarded(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkOnboardingStatus()
    }, [session?.user?.email, isMerchant]) // Better dependencies

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isDropdownOpen])

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' })
    }

    const toggleDropdown = () => setIsDropdownOpen(prev => !prev)

    return (
        <section>
            <div className="top-header-bg text-white py-2 top-header mt-0">
                <div className="container-fluid topheader-fluid">
                    <div className="row align-items-center">

                        <div className="col-md-6 row-first">
                            <ul className="list-inline m-0">
                                {/* Only show for merchants who are NOT fully onboarded */}
                                {showBecomeSeller && (
                                    <li className="list-inline-item border-end px-3">
                                        <Link href="/become-a-seller" className="text-white text-decoration-none">
                                            Become A Seller
                                        </Link>
                                    </li>
                                )}

                                <li className="list-inline-item border-end px-3">Free Delivery</li>
                                <li className="list-inline-item px-3">Returns Policy</li>
                            </ul>
                        </div>

                        <div className="col-md-6 text-md-end row-second">
                            <ul className="list-inline m-0">
                                <li className="list-inline-item border-end px-3">About us</li>
                                <li className="list-inline-item border-end px-3">Help Center</li>

                                {session ? (
                                    <li className="list-inline-item px-3 dropdown" ref={dropdownRef}>
                                        <span
                                            className="text-white"
                                            onClick={toggleDropdown}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            My Account
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor"
                                                className={`ms-1 transition ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                            </svg>
                                        </span>

                                        <ul className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`}
                                            style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem' }}>
                                            <li>
                                                <Link className="dropdown-item" href="/my-account" onClick={() => setIsDropdownOpen(false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person me-2" viewBox="0 0 16 16">
                                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                                    </svg>
                                                    My Profile
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" href="/my-account">
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person me-2" viewBox="0 0 16 16">
                                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                                    </svg> */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-seam me-2" viewBox="0 0 16 16">
                                                        <path d="M9.828.122a1 1 0 0 0-.656 0l-8 3A1 1 0 0 0 .5 4.06V12a1 1 0 0 0 .672.938l8 3a1 1 0 0 0 .656 0l8-3A1 1 0 0 0 15.5 12V4.06a1 1 0 0 0-.672-.938zM8 1.21 14.5 3.65 8 6.09 1.5 3.65zM1.5 4.74 7.5 7v7.09l-6-2.25zm7 9.35V7l6-2.26v7.1z" />
                                                    </svg>
                                                    Orders
                                                </Link>
                                            </li>

                                            {showDashboard && (
                                                <li>
                                                    <Link className="dropdown-item" href="/dashboard" onClick={() => setIsDropdownOpen(false)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-house-door me-2" viewBox="0 0 16 16">
                                                            <path d="M8 4a.5.5 0 0 1 .5.5v3.293l2.146 2.147a.5.5 0 0 1-.708.708L7.5 8.207V4.5A.5.5 0 0 1 8 4" />
                                                            <path d="M4.5 14a.5.5 0 0 1-.5-.5v-1a4 4 0 1 1 8 0v1a.5.5 0 0 1-.5.5h-7zM8 1a7 7 0 0 0-7 7v5.5A1.5 1.5 0 0 0 2.5 15h11A1.5 1.5 0 0 0 15 13.5V8a7 7 0 0 0-7-7" />
                                                        </svg>
                                                        Dashboard
                                                    </Link>
                                                </li>
                                            )}

                                            {/* Other menu items... */}
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                ) : (
                                    <li className="list-inline-item px-3">
                                        <Link href="/auth/login" className="text-white text-decoration-none">
                                            Login
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TopHeader