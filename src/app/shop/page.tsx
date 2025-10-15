import React from 'react'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import ProductSingle from '../components/ProductDetails/ProductSingle/ProductSingle'
import RelatedProducts from '../components/ProductDetails/RelatedProducts/RelatedProducts'
import Description from '../components/ProductDetails/Description/Description'
import ContactUs from '../components/ContactUs/ContactUs'
import BlogPage from '../components/Blog/Blog'
import FilterMenu from '../components/FilterMenu/FilterMenu'
import ProductList from '../components/ProductsList/ProductList'
import "../components/ProductDetails/RelatedProducts/RelatedProducts";

const page = () => {
    return (
        <>
            <Header />
            {/* product details page */}
            {/* <ProductSingle />
            <Description />
            <RelatedProducts /> */}

            {/* <ContactUs/> */}
            {/* <BlogPage/> */}

            <ProductList />
            <Footer />
        </>

    )
}

export default page
