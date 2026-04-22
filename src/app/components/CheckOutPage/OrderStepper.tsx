// components/checkout/OrderStepper.tsx
"use client";

import React from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface OrderStepperProps {
  currentStep: number;
}

const OrderStepper: React.FC<OrderStepperProps> = ({ currentStep }) => {
  const steps: Step[] = [
    { number: 1, title: 'Address', description: 'Delivery address' },
    { number: 2, title: 'Order Summary', description: 'Review items' },
    { number: 3, title: 'Payment', description: 'Payment method' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${currentStep >= step.number 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'}
                  ${currentStep > step.number ? 'ring-4 ring-green-200' : ''}
                `}
              >
                {currentStep > step.number ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="text-center mt-2">
                <div className={`font-semibold ${currentStep >= step.number ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 hidden sm:block">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OrderStepper;