"use client";
import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import TopHeader from '../TopHeader/TopHeader';
import { FaBars, FaTimes } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import '../Navbar/Navbar.css'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // ← add this


  return (
    <div className="header-wrapper">
      <TopHeader />
      {/* <SearchBar /> */}
      <SearchBar onMobileSearchToggle={setMobileSearchOpen} /> {/* ← pass callback */}

       {!mobileSearchOpen && (
        <div className="custom-toggle" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      )}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}

export default Header