import React from 'react'
import CheckOut from '../components/CheckOut/CheckOut'
import MerchantDashboardView from '../components/MerchantDashboardView/MerchantDashboardView'
import CheckoutPage from '../components/CheckOutPage/CheckOut'
import { CartProvider } from '@/context/CartContext'
import { OrderProvider } from '@/context/OrderContext'
import { BuyNowProvider } from '@/context/BuyNowContext'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

const page = () => {
    return (
        <>
            {/* <CheckOut/>
         <MerchantDashboardView/>
         <h2>this is my check out</h2>
         <CheckoutPage/> */}
            <Header />
            {/* <CartProvider>
                <OrderProvider>
                    <BuyNowProvider> */}
                        <CheckoutPage />
                    {/* </BuyNowProvider>
                </OrderProvider>
            </CartProvider> */}
            <Footer />
        </>

    )
}

export default page
