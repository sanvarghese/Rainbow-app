// contexts/BuyNowContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BuyNowItem {
  productId: string;
  name: string;
  subtitle?: string;
  quantity: number;
  price: number;
  offerPrice: number;
  productImage?: string;
  totalAmount: number;
}

interface BuyNowContextType {
  buyNowItem: BuyNowItem | null;
  setBuyNowItem: (item: BuyNowItem | null) => void;
  clearBuyNow: () => void;
  isBuyNowMode: boolean;
}

const BuyNowContext = createContext<BuyNowContextType | undefined>(undefined);

export const useBuyNow = () => {
  const context = useContext(BuyNowContext);
  if (!context) {
    throw new Error('useBuyNow must be used within a BuyNowProvider');
  }
  return context;
};

export const BuyNowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null);

  useEffect(() => {
    // Load from sessionStorage (clears when browser tab closes)
    const savedItem = sessionStorage.getItem('buyNowItem');
    if (savedItem) {
      try {
        setBuyNowItem(JSON.parse(savedItem));
      } catch (e) {
        console.error('Error loading buy now item:', e);
      }
    }
  }, []);

  const handleSetBuyNowItem = (item: BuyNowItem | null) => {
    setBuyNowItem(item);
    if (item) {
      sessionStorage.setItem('buyNowItem', JSON.stringify(item));
    } else {
      sessionStorage.removeItem('buyNowItem');
    }
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
    sessionStorage.removeItem('buyNowItem');
  };

  return (
    <BuyNowContext.Provider
      value={{
        buyNowItem: buyNowItem,
        setBuyNowItem: handleSetBuyNowItem,
        clearBuyNow: clearBuyNow,
        isBuyNowMode: !!buyNowItem,
      }}
    >
      {children}
    </BuyNowContext.Provider>
  );
};