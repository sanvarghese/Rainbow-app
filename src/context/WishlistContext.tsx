"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

interface WishlistItem {
    productId: string | {
        _id: string;
        name?: string;
        productImages?: string[];
        price?: number;
        offerPrice?: number;
    };
    _id?: string;
    addedAt?: string;
}

interface WishlistState {
    items: WishlistItem[];
    loading: boolean;
    error: string | null;
}

type WishlistAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
    | { type: 'ADD_ITEM'; payload: string }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'CLEAR_ERROR' };

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null,
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_WISHLIST':
            return { ...state, items: action.payload, loading: false, error: null };
        case 'ADD_ITEM':
            return {
                ...state,
                items: [...state.items, { productId: action.payload }],
            };
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => {
                    const id = typeof item.productId === 'object'
                        ? item.productId._id?.toString()
                        : item.productId?.toString();
                    return id !== action.payload;
                }),
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

interface WishlistContextType {
    wishlist: WishlistState;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, dispatch] = useReducer(wishlistReducer, initialState);

    const fetchWishlist = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const res = await fetch('/api/wishlist');
            if (!res.ok) throw new Error('Failed to fetch wishlist');

            const data = await res.json();
            dispatch({ type: 'SET_WISHLIST', payload: data.items || [] });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    }, []);

    const addToWishlist = async (productId: string) => {
        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add to wishlist');
            }

            const data = await res.json();

            if (data.isInWishlist) {
                dispatch({ type: 'ADD_ITEM', payload: productId });
            } else {
                dispatch({ type: 'REMOVE_ITEM', payload: productId });
            }
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            await fetch('/api/wishlist', {
                method: 'POST', // We are using toggle in POST
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });
            dispatch({ type: 'REMOVE_ITEM', payload: productId });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    //   const isInWishlist = (productId: string): boolean => {
    //     return wishlist.items.some(item => item.productId === productId);
    //   };

    // Update the isInWishlist function to handle ObjectId comparison properly:
    const isInWishlist = (productId: string): boolean => {
        return wishlist.items.some(item => {
            // Handle populated object (item.productId is an object with _id)
            if (typeof item.productId === 'object' && item.productId !== null) {
                return item.productId._id?.toString() === productId;
            }
            // Handle plain string
            return item.productId?.toString() === productId;
        });
    };

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const value: WishlistContextType = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        fetchWishlist,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};