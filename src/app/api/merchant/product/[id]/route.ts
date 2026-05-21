// app/api/merchant/products/[id]/route.ts   (or wherever this file is)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import connectDB from '../../../../../lib/mongodb';
import Product from '../../../../../models/Product';

type Params = Promise<{ id: string }>;

export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;        

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const productId = id;               // ← Use the awaited id

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

    // Check if product is already deleted
    if (product.status === 'removed') {
      return NextResponse.json(
        { error: 'Product already deleted' },
        { status: 400 }
      );
    }

    // TODO: Check if product is in any active orders
    // For now, we'll allow deletion
    // In production, add order checking logic here:
    // const hasActiveOrders = await Order.findOne({ 
    //   productId: productId, 
    //   status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] } 
    // });
    // if (hasActiveOrders) {
    //   return NextResponse.json({
    //     error: 'Cannot delete',
    //     details: 'This product is part of active orders'
    //   }, { status: 400 });
    // }

    // Soft delete - update status to 'removed'
    product.status = 'removed';
    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      product: {
        id: product._id,
        name: product.name,
        status: product.status
      }
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