// app/checkout/page.tsx
"use client";

import React, { useEffect } from 'react';
import AddressStep from '../CheckOutPage/AddressStep';
import OrderSummaryStep from '../CheckOutPage/OrderSummaryStep';
import PaymentStep from '../CheckOutPage/PaymentStep';
import OrderStepper from '../CheckOutPage/OrderStepper';
import { OrderProvider, useOrder } from '@/context/OrderContext';
// import { OrderProvider, useOrder } from '@/contexts/OrderContext';
// import AddressStep from '@/components/checkout/AddressStep';
// import OrderSummaryStep from '@/components/checkout/OrderSummaryStep';
// import PaymentStep from '@/components/checkout/PaymentStep';
// import OrderStepper from '@/components/checkout/OrderStepper';

const CheckoutContent = () => {
  const { currentStep, setCurrentStep, fetchAddresses } = useOrder();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AddressStep />;
      case 2:
        return <OrderSummaryStep />;
      case 3:
        return <PaymentStep />;
      default:
        return <AddressStep />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <OrderStepper currentStep={currentStep} />
        
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <OrderProvider>
      <CheckoutContent />
    </OrderProvider>
  );
};

export default CheckoutPage;