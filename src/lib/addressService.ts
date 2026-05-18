// lib/addressService.ts
import DeliveryAddress, { IDeliveryAddress } from '@/models/DeliveryAddress';
import mongoose from 'mongoose';
import connectDB from './mongodb';

export interface AddressInput {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  addressType?: 'home' | 'work' | 'other';
}

export interface AddressUpdateInput extends Partial<AddressInput> {}

class AddressService {
  
  // Get all addresses for a user
  async getUserAddresses(userId: string | mongoose.Types.ObjectId) {
    await connectDB();
    const addresses = await DeliveryAddress.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });
    return addresses;
  }

  // Get address by ID
  async getAddressById(id: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid address ID');
    }
    const address = await DeliveryAddress.findById(id);
    if (!address) {
      throw new Error('Address not found');
    }
    return address;
  }

  // Create new address
  async createAddress(userId: string | mongoose.Types.ObjectId, addressData: AddressInput) {
    await connectDB();
    
    // If this address is set as default, unset other default addresses for this user
    if (addressData.isDefault) {
      await DeliveryAddress.updateMany(
        { userId },
        { isDefault: false }
      );
    }
    
    // If no default exists and this is the first address, make it default
    const addressCount = await DeliveryAddress.countDocuments({ userId });
    if (addressCount === 0) {
      addressData.isDefault = true;
    }
    
    const address = await DeliveryAddress.create({
      userId,
      ...addressData,
      country: addressData.country || 'India',
      addressType: addressData.addressType || 'home',
      isDefault: addressData.isDefault || addressCount === 0,
    });
    
    return address;
  }

  // Update address
  async updateAddress(id: string, updateData: AddressUpdateInput) {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid address ID');
    }
    
    const address = await DeliveryAddress.findById(id);
    if (!address) {
      throw new Error('Address not found');
    }
    
    // If setting as default, unset other default addresses for this user
    if (updateData.isDefault) {
      await DeliveryAddress.updateMany(
        { userId: address.userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }
    
    // Update the address
    const updatedAddress = await DeliveryAddress.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return updatedAddress;
  }

  // Delete address
  async deleteAddress(id: string) {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid address ID');
    }
    
    const address = await DeliveryAddress.findById(id);
    if (!address) {
      throw new Error('Address not found');
    }
    
    const wasDefault = address.isDefault;
    
    // Delete the address
    await DeliveryAddress.findByIdAndDelete(id);
    
    // If the deleted address was default, set another address as default
    if (wasDefault) {
      const anotherAddress = await DeliveryAddress.findOne({ userId: address.userId });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }
    
    return { success: true, message: 'Address deleted successfully' };
  }

  // Set address as default
  async setDefaultAddress(id: string) {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid address ID');
    }
    
    const address = await DeliveryAddress.findById(id);
    if (!address) {
      throw new Error('Address not found');
    }
    
    // Unset all other default addresses for this user
    await DeliveryAddress.updateMany(
      { userId: address.userId },
      { isDefault: false }
    );
    
    // Set this address as default
    address.isDefault = true;
    await address.save();
    
    return address;
  }

  // Get default address for a user
  async getDefaultAddress(userId: string | mongoose.Types.ObjectId) {
    await connectDB();
    const address = await DeliveryAddress.findOne({ userId, isDefault: true });
    return address;
  }
}

export const addressService = new AddressService();