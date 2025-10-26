import React from 'react'
import './TopHeader.css'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

const TopHeader = () => {
    const { data: session } = useSession()

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' })
    }

    return (
        <section>
            <div className="top-header-bg text-white py-2 top-header mt-0">
                <div className="container-fluid topheader-fluid">
                    <div className="row align-items-center">

                        <div className="col-md-6 row-first">
                            <ul className="list-inline m-0">
                                <li className="list-inline-item border-end px-3">
                                    <Link href="/become-a-seller" className="text-white text-decoration-none">
                                        Become A Seller
                                    </Link>
                                </li>
                                <li className="list-inline-item border-end px-3">Free Delivery</li>
                                <li className="list-inline-item px-3">Returns Policy</li>
                            </ul>
                        </div>

                        <div className="col-md-6 text-md-end row-second">
                            <ul className="list-inline m-0">
                                <li className="list-inline-item border-end px-3">About us</li>
                                <li className="list-inline-item border-end px-3">Help Center</li>
                                <li className="list-inline-item border-end px-3">Languages</li>

                                {/* Dropdown Section */}
                                {session ? (
                                    <li className="list-inline-item px-3 dropdown">
                                        <span 
                                            className="dropdown-toggle text-white" 
                                            data-bs-toggle="dropdown" 
                                            style={{ cursor: 'pointer' }}
                                        >
                                            My Account
                                        </span>

                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li>
                                                <Link className="dropdown-item" href="/my-profile">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person me-2" viewBox="0 0 16 16">
                                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                                                    </svg>
                                                    My Profile
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" href="/orders">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-seam me-2" viewBox="0 0 16 16">
                                                        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
                                                    </svg>
                                                    My Orders
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" href="/cart">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart me-2" viewBox="0 0 16 16">
                                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                                                    </svg>
                                                    Cart
                                                </Link>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button 
                                                    className="dropdown-item text-danger" 
                                                    onClick={handleLogout}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right me-2" viewBox="0 0 16 16">
                                                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                                                    </svg>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                ) : (
                                    <li className="list-inline-item px-3">
                                        <Link href="/login" className="text-white text-decoration-none">
                                            Login
                                        </Link>
                                    </li>
                                )}
                                {/* End Dropdown */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TopHeader