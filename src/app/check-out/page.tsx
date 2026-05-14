// app/check-out/page.tsx
import React from 'react'
import CheckoutPage from '../components/CheckOutPage/CheckOut'
import { CartProvider } from '@/context/CartContext'
import { OrderProvider } from '@/context/OrderContext'
import { BuyNowProvider } from '@/context/BuyNowContext'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

const page = () => {
    return (
        <>
            <Header />
            <CartProvider>
                <OrderProvider>
                    <BuyNowProvider>
                        <CheckoutPage />
                    </BuyNowProvider>
                </OrderProvider>
            </CartProvider>
            <Footer />
        </>
    )
}

export default page