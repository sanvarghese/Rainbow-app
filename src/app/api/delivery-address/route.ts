// app/api/delivery-address/route.ts
import { NextResponse } from 'next/server';

// Mock data - replace with your actual database logic
let mockAddresses = [
  {
    _id: '1',
    fullName: 'John Doe',
    phoneNumber: '9876543210',
    addressLine1: '123 Main Street',
    addressLine2: 'Near Central Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    isDefault: true,
    addressType: 'home',
  },
];

export async function GET() {
  try {
    // In production, fetch from database
    return NextResponse.json({ 
      success: true, 
      addresses: mockAddresses 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newAddress = {
      _id: Date.now().toString(),
      ...body,
      isDefault: body.isDefault || false,
    };
    
    // In production, save to database
    mockAddresses.push(newAddress);
    
    // If this is default, unset others
    if (newAddress.isDefault) {
      mockAddresses = mockAddresses.map(addr => ({
        ...addr,
        isDefault: addr._id === newAddress._id,
      }));
    }
    
    return NextResponse.json({ 
      success: true, 
      address: newAddress 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add address' },
      { status: 500 }
    );
  }
}