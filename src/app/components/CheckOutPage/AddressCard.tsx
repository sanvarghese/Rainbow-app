// components/checkout/AddressCard.tsx
"use client";

import React from 'react';

interface AddressCardProps {
  address: any;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return '🏠';
      case 'work': return '💼';
      default: return '📍';
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 hover:border-green-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getAddressTypeIcon(address.addressType)}</span>
            <h3 className="font-semibold">{address.fullName}</h3>
            {address.isDefault && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                Default
              </span>
            )}
          </div>
          
          <div className="text-gray-600 text-sm space-y-1">
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city}, {address.state} - {address.postalCode}
            </p>
            <p>{address.country}</p>
            <p className="text-gray-500">Phone: {address.phoneNumber}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-blue-600 hover:text-blue-700 p-1"
          >
            ✎
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-500 hover:text-red-700 p-1"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;