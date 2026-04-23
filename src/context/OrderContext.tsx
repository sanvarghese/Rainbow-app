// contexts/OrderContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';

interface DeliveryAddress {
  _id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
}

interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cod' | 'card' | 'upi' | 'netbanking';
}

interface BuyNowItem {
  productId: string;
  name: string;
  subtitle?: string;
  quantity: number;
  price: number;
  offerPrice: number;
  productImage?: string;
  totalAmount: number;
}

interface OrderContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedAddress: DeliveryAddress | null;
  setSelectedAddress: (address: DeliveryAddress | null) => void;
  addresses: DeliveryAddress[];
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Partial<DeliveryAddress>) => Promise<void>;
  updateAddress: (id: string, address: Partial<DeliveryAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  orderSummary: OrderSummary;
  isPlacingOrder: boolean;
  placeOrder: (buyNowItem?: BuyNowItem | null, isBuyNowMode?: boolean) => Promise<void>;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { cart } = useCart();

  const paymentMethods: PaymentMethod[] = [
    { id: 'cod', name: 'Cash on Delivery', type: 'cod' },
    { id: 'card', name: 'Credit/Debit Card', type: 'card' },
    { id: 'upi', name: 'UPI', type: 'upi' },
    { id: 'netbanking', name: 'Net Banking', type: 'netbanking' },
  ];

  // Calculate order summary based on cart
  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = cart.totalAmount;
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const tax = subtotal * 0.05;
    const discount = cart.totalSavings;
    const total = subtotal + deliveryFee + tax - discount;

    return {
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
    };
  };

  const orderSummary = calculateOrderSummary();

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses');
      const data = await response.json();

      if (data.success) {
        setAddresses(data.addresses);
        const defaultAddress = data.addresses.find((addr: DeliveryAddress) => addr.isDefault);
        if (defaultAddress && !selectedAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const addAddress = async (address: Partial<DeliveryAddress>) => {
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAddresses();
      } else {
        throw new Error(data.error || data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  };

  const updateAddress = async (id: string, address: Partial<DeliveryAddress>) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAddresses();
      } else {
        throw new Error(data.error || data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchAddresses();
        if (selectedAddress?._id === id) {
          setSelectedAddress(null);
        }
      } else {
        throw new Error(data.error || data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  };

  const placeOrder = async (buyNowItem?: BuyNowItem | null, isBuyNowMode?: boolean) => {
    if (!selectedAddress) {
      throw new Error('Please select a delivery address');
    }
    if (!selectedPaymentMethod) {
      throw new Error('Please select a payment method');
    }

    // For Buy Now mode, we don't need cart items
    if (!isBuyNowMode && cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    setIsPlacingOrder(true);
    try {
      let orderItems;
      let orderSummaryData;

      if (isBuyNowMode && buyNowItem) {
        // Create order from buy now item
        orderItems = [{
          productId: buyNowItem.productId,
          name: buyNowItem.name,
          subtitle: buyNowItem.subtitle || '',
          quantity: buyNowItem.quantity,
          price: buyNowItem.price,
          offerPrice: buyNowItem.offerPrice,
          image: buyNowItem.productImage || '',
        }];

        // Calculate order summary for buy now
        const subtotal = buyNowItem.offerPrice * buyNowItem.quantity;
        const deliveryFee = 40;
        const tax = subtotal * 0.05;
        const discount = buyNowItem.price > buyNowItem.offerPrice
          ? (buyNowItem.price - buyNowItem.offerPrice) * buyNowItem.quantity
          : 0;
        const total = subtotal + deliveryFee + tax - discount;

        orderSummaryData = {
          subtotal,
          deliveryFee,
          tax,
          discount,
          total,
        };
      } else {
        // Use cart order
        orderItems = cart.items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          subtitle: item.name,
          quantity: item.quantity,
          price: item.price,
          offerPrice: item.offerPrice,
          image: item.productImage || '',
        }));

        orderSummaryData = {
          subtotal: orderSummary.subtotal,
          deliveryFee: orderSummary.deliveryFee,
          tax: orderSummary.tax,
          discount: orderSummary.discount,
          total: orderSummary.total,
        };
      }

      const orderData = {
        addressId: selectedAddress._id,
        paymentMethod: selectedPaymentMethod.type,
        items: orderItems,
        orderSummary: orderSummaryData,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Clear buy now item after successful order
        if (isBuyNowMode) {
          localStorage.removeItem('buyNowItem');
          sessionStorage.removeItem('buyNowItem');
        }
        
        return { success: true, order: data.order };
      } else {
        throw new Error(data.error || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      throw new Error(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedAddress,
        setSelectedAddress,
        addresses,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        orderSummary,
        isPlacingOrder,
        placeOrder,
        paymentMethods,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};