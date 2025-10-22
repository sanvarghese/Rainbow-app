import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/adminAuth';
import Product from '../../../../../models/Product';
import connectDB from '../../../../../lib/mongodb';

// GET - Fetch all products (admin view)
export async function GET() {
  try {
   const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const products = await Product.find({})
      .populate('companyId', 'name email companyLogo')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Admin delete any product
export async function DELETE(req: NextRequest) {
  try {
       const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Admin can delete any product (no userId check)
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await Product.deleteOne({ _id: productId });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
