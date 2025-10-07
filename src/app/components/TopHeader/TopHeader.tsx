import React from 'react'
// import '../../../assets/css/TopHeader.css';
import './TopHeader.css'
import Link from 'next/link'

const TopHeader = () => {
    return (
        <section >
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
                                <li className="list-inline-item px-3">My Account</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TopHeader