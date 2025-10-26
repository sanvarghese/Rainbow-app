import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../../auth';
import connectDB from '../../../../../../../lib/mongodb';
import User from '../../../../../../../models/User';
import DeliveryAddress from '../../../../../../../models/DeliveryAddress';


// PATCH - Set address as default
export async function PATCH(
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

    // Unset all other defaults
    await DeliveryAddress.updateMany(
      { userId: user._id },
      { isDefault: false }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    return NextResponse.json({
      success: true,
      message: 'Default address updated successfully',
      address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}