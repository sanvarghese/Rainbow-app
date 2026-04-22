"use client";

import { useOrder } from '@/context/OrderContext';
import { useCart } from '@/context/CartContext';
import { useBuyNow } from '@/context/BuyNowContext';
import React, { useState } from 'react';
import AddressForm from './AddressForm';
import AddressCard from './AddressCard';

const AddressStep: React.FC = () => {
  const { 
    addresses, 
    selectedAddress, 
    setSelectedAddress, 
    setCurrentStep,
    deleteAddress,
    orderSummary
  } = useOrder();
  
  const { cart } = useCart();
  const { buyNowItem, isBuyNowMode } = useBuyNow();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const handleContinue = () => {
    if (selectedAddress) {
      setCurrentStep(2);
    } else {
      alert('Please select a delivery address');
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  const handleAddressFormClose = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  // Get the product to display (only for Buy Now mode)
  const currentProduct = isBuyNowMode && buyNowItem ? buyNowItem : null;

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Address List Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Delivery Address</h2>
            <button
              onClick={() => setShowAddressForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              + Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No addresses found. Please add a new address.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  isSelected={selectedAddress?._id === address._id}
                  onSelect={() => setSelectedAddress(address)}
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => handleDeleteAddress(address._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order Preview - Single Product View */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold text-lg mb-4">Order Preview</h3>
            
            {currentProduct ? (
              <div className="space-y-4">
                {/* Product Image and Name */}
                <div className="flex gap-3 pb-3 border-b">
                  {currentProduct.productImage && (
                    <img 
                      src={currentProduct.productImage} 
                      alt={currentProduct.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{currentProduct.name}</h4>
                    {currentProduct.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{currentProduct.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Quantity: {currentProduct.quantity}</p>
                  </div>
                </div>

                {/* Price Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <div className="text-right">
                      {currentProduct.offerPrice < currentProduct.price ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">₹{currentProduct.price}</span>
                          <span className="text-green-600 font-medium">₹{currentProduct.offerPrice}</span>
                        </>
                      ) : (
                        <span>₹{currentProduct.price}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity</span>
                    <span>× {currentProduct.quantity}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{(currentProduct.offerPrice * currentProduct.quantity).toFixed(2)}</span>
                  </div>

                  {/* Discount Section */}
                  {currentProduct.offerPrice < currentProduct.price && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount Saved</span>
                      <span>-₹{((currentProduct.price - currentProduct.offerPrice) * currentProduct.quantity).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Delivery Fee - Dummy Fee */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>₹40.00</span>
                  </div>

                  {/* Free delivery message */}
                  <div className="text-xs text-gray-500 text-right -mt-1">
                    *Free delivery on orders above ₹500
                  </div>

                  {/* Total Amount */}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Total Amount</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{((currentProduct.offerPrice * currentProduct.quantity) + 40).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No product selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressForm
          address={editingAddress}
          onClose={handleAddressFormClose}
          onSuccess={handleAddressFormClose}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleContinue}
          disabled={!selectedAddress || !currentProduct}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue to Order Summary →
        </button>
      </div>
    </div>
  );
};

export default AddressStep;