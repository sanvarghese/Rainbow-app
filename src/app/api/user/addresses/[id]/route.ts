import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import connectDB from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import DeliveryAddress from '../../../../../../models/DeliveryAddress';
// import { getServerSession } from 'next-auth';
// import connectDB from '@/lib/mongodb'; // Adjust path as needed
// import User from '@/models/User'; // Adjust path as needed
// import DeliveryAddress from '@/models/DeliveryAddress'; // Adjust path as needed

// PUT - Update address
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
      addressType
    } = body;

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Await params before accessing id
    const { id } = await params;

    const address = await DeliveryAddress.findOne({
      _id: id,
      userId: user._id
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    // If this is set as default, unset all other defaults
    if (isDefault && !address.isDefault) {
      await DeliveryAddress.updateMany(
        { userId: user._id, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update fields
    address.fullName = fullName || address.fullName;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 !== undefined ? addressLine2 : address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
    address.addressType = addressType || address.addressType;

    await address.save();

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Await params before accessing id
    const { id } = await params;

    const address = await DeliveryAddress.findOneAndDelete({
      _id: id,
      userId: user._id
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    // If deleted address was default, set another address as default
    if (address.isDefault) {
      const nextAddress = await DeliveryAddress.findOne({ userId: user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}