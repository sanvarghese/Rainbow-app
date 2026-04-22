"use client";

import { useOrder } from '@/context/OrderContext';
import React, { useState } from 'react';
// import { useOrder } from '@/contexts/OrderContext';

const PaymentStep: React.FC = () => {
  const { 
    selectedPaymentMethod, 
    setSelectedPaymentMethod, 
    paymentMethods,
    orderSummary,
    setCurrentStep,
    placeOrder,
    isPlacingOrder
  } = useOrder();
  
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    setError(null);
    try {
      await placeOrder();
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'cod':
        return '💵';
      case 'card':
        return '💳';
      case 'upi':
        return '📱';
      case 'netbanking':
        return '🏦';
      default:
        return '💰';
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
          
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${selectedPaymentMethod?.id === method.id 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'}
                `}
                onClick={() => setSelectedPaymentMethod(method)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getPaymentIcon(method.type)}</div>
                  <div>
                    <h3 className="font-semibold">{method.name}</h3>
                    {method.type === 'cod' && (
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    )}
                    {method.type === 'card' && (
                      <p className="text-sm text-gray-500">Credit/Debit Card</p>
                    )}
                    {method.type === 'upi' && (
                      <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm, etc.</p>
                    )}
                  </div>
                  {selectedPaymentMethod?.id === method.id && (
                    <div className="ml-auto text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{orderSummary.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{orderSummary.deliveryFee === 0 ? 'Free' : `₹${orderSummary.deliveryFee.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{orderSummary.tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total to Pay</span>
                  <span className="text-green-600">₹{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedPaymentMethod?.type === 'cod' && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
                <p className="font-semibold">Cash on Delivery</p>
                <p className="mt-1">Pay in cash when your order is delivered.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
        >
          ← Back to Order Summary
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={!selectedPaymentMethod || isPlacingOrder}
          className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isPlacingOrder ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Placing Order...
            </span>
          ) : (
            `Pay ₹${orderSummary.total.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;