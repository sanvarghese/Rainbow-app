"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartProduct {
  _id: string;
  name: string;
  productImage?: string;
  price: number;
  offerPrice: number;
}

interface CartCompany {
  _id: string;
  name: string;
  companyLogo?: string;
}

export interface CartItem {
  _id: string;
  productId: CartProduct;
  quantity: number;
  price: number; // Original price
  offerPrice: number; // Actual price to pay (discounted price)
  name: string;
  productImage?: string;
  companyId: CartCompany;
}

interface CartState {
  items: CartItem[];
  totalAmount: number; // Total based on offerPrice
  totalItems: number;
  totalSavings: number; // Total savings from discounts
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Omit<CartState, 'loading' | 'error'> }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  totalSavings: 0,
  loading: false,
  error: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CART':
      return { 
        ...state, 
        ...action.payload,
        loading: false, 
        error: null 
      };
    
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productId._id === action.payload.productId._id
      );
      
      let updatedItems: CartItem[];
      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { 
                ...item, 
                quantity: item.quantity + action.payload.quantity,
                price: action.payload.price,
                offerPrice: action.payload.offerPrice
              }
            : item
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }
      
      const updatedTotalAmount = updatedItems.reduce(
        (total, item) => total + (item.offerPrice * item.quantity),
        0
      );
      const updatedTotalItems = updatedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const updatedTotalSavings = updatedItems.reduce(
        (total, item) => total + ((item.price - item.offerPrice) * item.quantity),
        0
      );
      
      return {
        ...state,
        items: updatedItems,
        totalAmount: updatedTotalAmount,
        totalItems: updatedTotalItems,
        totalSavings: updatedTotalSavings,
        loading: false,
      };
    
    case 'UPDATE_ITEM':
      const itemsAfterUpdate = state.items
        .map(item =>
          item.productId._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter(item => item.quantity > 0);
      
      const totalAfterUpdate = itemsAfterUpdate.reduce(
        (total, item) => total + (item.offerPrice * item.quantity),
        0
      );
      const totalItemsAfterUpdate = itemsAfterUpdate.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const totalSavingsAfterUpdate = itemsAfterUpdate.reduce(
        (total, item) => total + ((item.price - item.offerPrice) * item.quantity),
        0
      );
      
      return {
        ...state,
        items: itemsAfterUpdate,
        totalAmount: totalAfterUpdate,
        totalItems: totalItemsAfterUpdate,
        totalSavings: totalSavingsAfterUpdate,
        loading: false,
      };
    
    case 'REMOVE_ITEM':
      const itemsAfterRemove = state.items.filter(
        item => item.productId._id !== action.payload
      );
      
      const totalAfterRemove = itemsAfterRemove.reduce(
        (total, item) => total + (item.offerPrice * item.quantity),
        0
      );
      const totalItemsAfterRemove = itemsAfterRemove.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const totalSavingsAfterRemove = itemsAfterRemove.reduce(
        (total, item) => total + ((item.price - item.offerPrice) * item.quantity),
        0
      );
      
      return {
        ...state,
        items: itemsAfterRemove,
        totalAmount: totalAfterRemove,
        totalItems: totalItemsAfterRemove,
        totalSavings: totalSavingsAfterRemove,
        loading: false,
      };
    
    case 'CLEAR_CART':
      return {
        ...initialState,
        loading: false,
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      };
    
    case 'CLEAR_ERROR':
      return { 
        ...state, 
        error: null 
      };
    
    default:
      return state;
  }
};

interface CartContextType {
  cart: CartState;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  clearError: () => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      dispatch({ 
        type: 'SET_CART', 
        payload: {
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          totalItems: data.totalItems || 0,
          totalSavings: data.totalSavings || 0,
        }
      });
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to fetch cart' 
      });
    }
  };

const addToCart = async (productId: string, quantity: number = 1) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    console.log('Sending add to cart request:', { productId, quantity });
    
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || 'Unknown error' };
      }
      
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Add to cart success:', data);
    
    dispatch({ 
      type: 'SET_CART', 
      payload: {
        items: data.cart.items,
        totalAmount: data.cart.totalAmount,
        totalItems: data.cart.totalItems,
        totalSavings: data.cart.totalSavings || 0,
      }
    });
  } catch (error: any) {
    console.error('Add to cart error in context:', error);
    dispatch({ 
      type: 'SET_ERROR', 
      payload: error.message || 'Failed to add item to cart' 
    });
    throw error;
  }
};

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cart');
      }
      
      const data = await response.json();
      dispatch({ 
        type: 'SET_CART', 
        payload: {
          items: data.cart.items,
          totalAmount: data.cart.totalAmount,
          totalItems: data.cart.totalItems,
          totalSavings: data.cart.totalSavings || 0,
        }
      });
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to update cart item' 
      });
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item from cart');
      }
      
      const data = await response.json();
      dispatch({ 
        type: 'SET_CART', 
        payload: {
          items: data.cart.items,
          totalAmount: data.cart.totalAmount,
          totalItems: data.cart.totalItems,
          totalSavings: data.cart.totalSavings || 0,
        }
      });
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to remove item from cart' 
      });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Remove all items one by one
      for (const item of cart.items) {
        await removeFromCart(item.productId._id);
      }
      dispatch({ type: 'CLEAR_CART' });
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to clear cart' 
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find(item => item.productId._id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId: string): boolean => {
    return cart.items.some(item => item.productId._id === productId);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const value: CartContextType = {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    clearError,
    getItemQuantity,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};