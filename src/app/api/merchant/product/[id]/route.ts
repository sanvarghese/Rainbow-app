import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import connectDB from '../../../../../../lib/mongodb';
import Product from '../../../../../../models/Product';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const productId = params.id;

    // Find product and verify ownership
    const product = await Product.findOne({
      _id: productId,
      userId: session.user.id
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // TODO: Check if product is in any active orders
    // For now, we'll allow deletion
    // In production, add order checking logic here:
    // const hasActiveOrders = await Order.findOne({ productId: productId, status: 'active' });
    // if (hasActiveOrders) {
    //   return NextResponse.json({
    //     error: 'Cannot delete',
    //     details: 'This product is part of active orders'
    //   }, { status: 400 });
    // }

    await Product.deleteOne({ _id: productId });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: 'Failed to delete product'
      },
      { status: 500 }
    );
  }
}