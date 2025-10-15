"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
// import { useCart } from '../../../contexts/CartContext';

const CartIcon: React.FC = () => {
  const { cart } = useCart();

  return (
    <Link href="/cart" className="position-relative text-decoration-none">
      <div className="d-flex align-items-center text-dark">
        <i className="bi bi-cart3 fs-5"></i>
        {cart.totalItems > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {cart.totalItems}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;