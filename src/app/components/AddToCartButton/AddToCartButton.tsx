"use client";

import { useCart } from '@/context/CartContext';
import React, { useState } from 'react';
// import { useCart } from '../../../contexts/CartContext';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  offerPrice: number;
  productImage?: string;
  companyId: string;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName,
  price,
  offerPrice,
  productImage,
  companyId,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(productId, 1);
      // You can show a success message or notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`btn btn-success ${className}`}
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Adding...
        </>
      ) : (
        'Add to Cart'
      )}
    </button>
  );
};

export default AddToCartButton;