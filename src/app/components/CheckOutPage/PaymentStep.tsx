// components/checkout/PaymentStep.tsx
"use client";

import { useOrder } from '@/context/OrderContext';
import { useBuyNow } from '@/context/BuyNowContext';
import React, { useState } from 'react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cod' | 'card' | 'upi' | 'netbanking';
  icon: string;
  description?: string;
}

const PaymentStep: React.FC = () => {
  const { 
    selectedPaymentMethod, 
    setSelectedPaymentMethod, 
    setCurrentStep,
    placeOrder,
    isPlacingOrder,
    orderSummary,
    selectedAddress  // Add this line - it was missing
  } = useOrder();
  
  const { buyNowItem, isBuyNowMode, clearBuyNow } = useBuyNow();
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const paymentMethods: PaymentMethod[] = [
    { 
      id: 'cod', 
      name: 'Cash on Delivery', 
      type: 'cod', 
      icon: '💵',
      description: 'Pay when you receive your order'
    },
    { 
      id: 'card', 
      name: 'Credit / Debit Card', 
      type: 'card', 
      icon: '💳',
      description: 'Visa, Mastercard, RuPay'
    },
    { 
      id: 'upi', 
      name: 'UPI', 
      type: 'upi', 
      icon: '📱',
      description: 'Google Pay, PhonePe, Paytm'
    },
    { 
      id: 'netbanking', 
      name: 'Net Banking', 
      type: 'netbanking', 
      icon: '🏦',
      description: 'All major banks'
    },
  ];

  const handleBack = () => {
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setError(null);
    try {
      // Pass buyNow data to placeOrder function
      const result = await placeOrder(buyNowItem, isBuyNowMode);
      
      if (result && result.success) {
        setOrderDetails(result.order);
        setShowConfirmation(true);
        // Clear buy now item after successful order
        if (isBuyNowMode) {
          clearBuyNow();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    }
  };

  const currentProduct = isBuyNowMode && buyNowItem ? buyNowItem : null;
  const deliveryFee = 40;
  const totalAmount = currentProduct 
    ? (currentProduct.offerPrice * currentProduct.quantity) + deliveryFee
    : orderSummary.total;

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Payment Methods Section */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method);
                    setError(null);
                  }}
                  className={`
                    relative flex items-center p-4 border-2 rounded-xl cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${selectedPaymentMethod?.id === method.id 
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500/20' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Radio Indicator */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0
                    transition-all duration-200
                    ${selectedPaymentMethod?.id === method.id 
                      ? 'border-green-500 bg-green-500 ring-2 ring-green-500/30' 
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedPaymentMethod?.id === method.id && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Icon */}
                  <span className="text-2xl mr-3">{method.icon}</span>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{method.name}</span>
                      {method.type === 'cod' && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          No extra fee
                        </span>
                      )}
                    </div>
                    {method.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                    )}
                  </div>

                  {/* Chevron indicator for selected */}
                  {selectedPaymentMethod?.id === method.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure payment • SSL encrypted</span>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-xl p-5 sticky top-4">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            
            {currentProduct ? (
              <div className="space-y-4">
                <div className="flex gap-3 pb-3 border-b border-gray-200">
                  {currentProduct.productImage && (
                    <img 
                      src={currentProduct.productImage} 
                      alt={currentProduct.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{currentProduct.name}</p>
                    <p className="text-sm text-gray-500">Qty: {currentProduct.quantity}</p>
                  </div>
                  <p className="font-medium">₹{((currentProduct.offerPrice || currentProduct.price) * currentProduct.quantity).toFixed(2)}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{((currentProduct.offerPrice || currentProduct.price) * currentProduct.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  {currentProduct.offerPrice < currentProduct.price && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{((currentProduct.price - currentProduct.offerPrice) * currentProduct.quantity).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total Amount</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>₹{orderSummary.deliveryFee.toFixed(2)}</span>
                  </div>
                  {orderSummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{orderSummary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>₹{orderSummary.tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-green-600">₹{orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <button
          onClick={handleBack}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || !selectedPaymentMethod}
          className={`
            px-8 py-2.5 rounded-lg font-medium transition-all duration-200
            flex items-center gap-2
            ${isPlacingOrder || !selectedPaymentMethod
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
            }
          `}
        >
          {isPlacingOrder ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            `Place Order • ₹${totalAmount.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 transform animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2">Order Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{selectedPaymentMethod?.name}</span>
                  </div>
                  {selectedAddress && (
                    <div className="flex justify-between">
                      <span>Delivery Address:</span>
                      <span className="text-right">{selectedAddress?.fullName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    window.location.href = '/orders';
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  View Orders
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    window.location.href = '/';
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;