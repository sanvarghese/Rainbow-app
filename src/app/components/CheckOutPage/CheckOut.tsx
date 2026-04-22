// components/CheckOutPage/CheckOut.tsx
"use client";

import React, { useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import AddressStep from './AddressStep';
import OrderSummaryStep from './OrderSummaryStep';
import PaymentStep from './PaymentStep';
// import AddressStep from '../checkout/AddressStep';
// import OrderSummaryStep from '../checkout/OrderSummaryStep';
// import PaymentStep from '../checkout/PaymentStep';

const CheckoutPage: React.FC = () => {
  const { currentStep, setCurrentStep, fetchAddresses } = useOrder();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const steps = [
    { id: 1, name: 'Delivery Address', icon: '📍' },
    { id: 2, name: 'Order Summary', icon: '📦' },
    { id: 3, name: 'Payment', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${currentStep >= step.id 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-500'}
                    `}
                  >
                    {currentStep > step.id ? '✓' : step.icon}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                    <div
                      className={`h-full bg-green-600 transition-all duration-300 ${
                        currentStep > step.id ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {currentStep === 1 && <AddressStep />}
          {currentStep === 2 && <OrderSummaryStep />}
          {currentStep === 3 && <PaymentStep />}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;