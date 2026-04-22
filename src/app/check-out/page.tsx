import React from 'react'
import CheckOut from '../components/CheckOut/CheckOut'
import MerchantDashboardView from '../components/MerchantDashboardView/MerchantDashboardView'
import CheckoutPage from '../components/CheckOutPage/CheckOut'
import { CartProvider } from '@/context/CartContext'
import { OrderProvider } from '@/context/OrderContext'
import { BuyNowProvider } from '@/context/BuyNowContext'

const page = () => {
    return (
        //    <CheckOut/>
        // <MerchantDashboardView/>
        // <h2>this is my check out</h2>
        // <CheckoutPage/>

        <CartProvider>
            <OrderProvider>
                <BuyNowProvider>
                    <CheckoutPage />
                </BuyNowProvider>
            </OrderProvider>
        </CartProvider>
    )
}

export default page
