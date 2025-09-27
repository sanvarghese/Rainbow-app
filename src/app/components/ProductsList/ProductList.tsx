"use client";

import React, { useState } from 'react'
import card_5 from "../../../assets/images/card_5.png";
// import card_5 from "../../../../assets/images/card_5.png";
import card_6 from "../../../assets/images/card_6.png";
import card_7 from "../../../assets/images/card_7.png";
import card_8 from "../../../assets/images/card_8.png";
import ProductCard from '../ProductCard/ProductCard';
import "./RelatedProducts.css";
// import '../../components/ProductDetails/RelatedProducts/RelatedProducts.css'

import Header from '../Header/Header';

// import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import FilterMenu from '../FilterMenu/FilterMenu';
import { ChevronDown } from 'lucide-react';
// import ProductCard from "../../ProductCard/ProductCard";

const ProductList = () => {

    const products = [
        {
            id: 1,
            img: card_5,
            title: "KOTTHAS KITCHEN",
            subtitle: "Chicken Masala (100g)",
            rating: "4.8",
            reviews: "10k",
            oldPrice: "₹59.00",
            newPrice: "₹55.00",
        },
        {
            id: 2,
            img: card_6,
            title: "KOTTHAS KITCHEN",
            subtitle: "Fish Masala (100g)",
            rating: "4.7",
            reviews: "8k",
            oldPrice: "₹60.00",
            newPrice: "₹56.00",
        },
        {
            id: 3,
            img: card_7,
            title: "KOTTHAS KITCHEN",
            subtitle: "Mutton Masala (100g)",
            rating: "4.9",
            reviews: "12k",
            oldPrice: "₹65.00",
            newPrice: "₹60.00",
        },
        {
            id: 4,
            img: card_8,
            title: "KOTTHAS KITCHEN",
            subtitle: "Veg Curry Masala (100g)",
            rating: "4.6",
            reviews: "7k",
            oldPrice: "₹55.00",
            newPrice: "₹50.00",
        },
    ];


    const [sortOption, setSortOption] = useState('Options');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const sortOptions = [
        'Relevance',
        'Date (Newest)',
        'Date (Oldest)',
        'Price (Low to High)',
        'Price (High to Low)',
        'Alphabetical',
        'Rating'
    ];

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setIsDropdownOpen(false);
    };


    return (
        <>
            {/* <Header /> */}
            {/* <div className='container-fluid'>
                <div className='row justify-content-center'>
                    <div className='col-12 col-sm-4 col-md-2 col-lg-2 mb-4'>
                        <FilterMenu />

                    </div>

                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                        >
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </div>
            <Footer /> */}

            <div className='container-fluid product-list-page'>
                <div className='row justify-content-center'>
                    <div className='col-12 col-sm-4 col-md-2 col-lg-2 mb-4'>
                        <FilterMenu />
                    </div>
                    <div className='col-12 col-sm-8 col-md-8 col-lg-10 mb-4'>
                        <div className="relatedProducts product-list">
                            <div className="container-fluid">
                                <div className="row justify-content-center">
                                    {/* <div className="youmightheading">
                                        <h4 className="h4_1">Showing 1-20 of 85 result</h4>
                                        <h4 className="h4_2">
                                            Options
                                        </h4>
                                    </div> */}

                                    <div className="youmightheading productlist d-flex justify-content-between align-items-center">
                                        <h4 className="h4_1">Showing 1-20 of 85 result</h4>

                                        <div className="sort-section">
                                            <span className="sort-label">Sort by:</span>
                                            <select
                                                className="sort-dropdown box-wrapper"
                                                value={sortOption}
                                                onChange={(e) => handleSortChange(e.target.value)}
                                            >
                                                <option>Options</option>
                                                {sortOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>


                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                                        >
                                            <ProductCard {...product} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default ProductList
