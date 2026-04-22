// components/checkout/OrderSummaryStep.tsx
"use client";

import { useOrder } from '@/context/OrderContext';
import { useBuyNow } from '@/context/BuyNowContext';
import React from 'react';

const OrderSummaryStep: React.FC = () => {
  const { selectedAddress, setCurrentStep } = useOrder();
  const { buyNowItem, isBuyNowMode } = useBuyNow();

  const currentProduct = isBuyNowMode && buyNowItem ? buyNowItem : null;

  // Calculate totals with dummy delivery fee
  const calculateTotals = () => {
    if (!currentProduct) return null;
    
    const subtotal = currentProduct.offerPrice * currentProduct.quantity;
    const deliveryFee = 40; // Dummy delivery fee
    const discount = currentProduct.price > currentProduct.offerPrice 
      ? (currentProduct.price - currentProduct.offerPrice) * currentProduct.quantity 
      : 0;
    const total = subtotal + deliveryFee;

    return {
      subtotal,
      deliveryFee,
      discount,
      total
    };
  };

  const totals = calculateTotals();

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleProceedToPayment = () => {
    setCurrentStep(3);
  };

  if (!currentProduct) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No product selected</p>
        <button
          onClick={handleBack}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">Delivery Address</h3>
              <button
                onClick={handleBack}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                Change
              </button>
            </div>
            {selectedAddress && (
              <div className="space-y-1">
                <p className="font-medium">{selectedAddress.fullName}</p>
                <p className="text-gray-600">{selectedAddress.phoneNumber}</p>
                <p className="text-gray-600">{selectedAddress.addressLine1}</p>
                {selectedAddress.addressLine2 && <p className="text-gray-600">{selectedAddress.addressLine2}</p>}
                <p className="text-gray-600">
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}
                </p>
                <p className="text-gray-600">{selectedAddress.country}</p>
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Product Details</h3>
            
            <div className="flex gap-4 pb-4">
              {/* Product Image */}
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {currentProduct.productImage ? (
                  <img 
                    src={currentProduct.productImage} 
                    alt={currentProduct.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📦
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-lg">{currentProduct.name}</h4>
                {currentProduct.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{currentProduct.subtitle}</p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">Quantity: {currentProduct.quantity}</p>
                  <div className="flex items-center gap-2">
                    {currentProduct.offerPrice < currentProduct.price ? (
                      <>
                        <span className="text-gray-400 line-through">₹{currentProduct.price}</span>
                        <span className="text-green-600 font-semibold text-lg">₹{currentProduct.offerPrice}</span>
                        <span className="text-green-600 text-sm">per item</span>
                      </>
                    ) : (
                      <span className="text-green-600 font-semibold text-lg">₹{currentProduct.price}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Price Summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold text-lg mb-4">Price Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totals?.subtotal.toFixed(2)}</span>
              </div>
              
              {totals?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <div className="text-right">
                  <span>₹{totals?.deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-right">
                *Free delivery on orders above ₹500
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{totals?.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <button
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Back to Address
        </button>
        <button
          onClick={handleProceedToPayment}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryStep;