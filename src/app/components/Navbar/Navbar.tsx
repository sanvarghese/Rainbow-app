import React from 'react'
// import { NavLink, useLocation } from 'react-router-dom'
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (value: boolean) => void }) => {
    // const location = useLocation();

    const pathname = usePathname();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        // { name: "Pages", path: "/pages" },
        { name: "Vendors", path: "/vendors" },
        { name: "Blog", path: "/blog" },
        { name: "Contact Us", path: "/contact" },
    ];

    return (
        <div className="nav-bar">
            <nav className="navbar">
                <div className="navbar-container">
                    <ul className={`nav-list ${isOpen ? "active" : ""}`}>
                        {navItems.map((item, index) => (
                            <li
                                className={`nav-item ${index === navItems.length - 1 ? "no-border" : ""}`}
                                key={item.name}
                            >
                                <Link
                                    href={item.path}
                                    className={`nav-link ${pathname === item.path ? "active" : ""}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default Navbar