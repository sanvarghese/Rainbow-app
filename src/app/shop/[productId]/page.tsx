import Footer from '@/app/components/Footer/Footer'
import Header from '@/app/components/Header/Header'
import Description from '@/app/components/ProductDetails/Description/Description'
import ProductSingle from '@/app/components/ProductDetails/ProductSingle/ProductSingle'
import RelatedProducts from '@/app/components/ProductDetails/RelatedProducts/RelatedProducts'
import React from 'react'

const page = () => {
    return (
        <>
            <Header />
            <ProductSingle/>
            <Description />
            <RelatedProducts />
            <Footer />
        </>
    )
}

export default page
