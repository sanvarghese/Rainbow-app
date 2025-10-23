import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../../lib/adminAuth';
import connectDB from '../../../../../../lib/mongodb';
import Product from '../../../../../../models/Product';

// GET single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const product = await Product.findById(params.id)
      .populate('companyId', 'name email companyLogo')
      .populate('userId', 'name email');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Admin update any product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await req.json();
    const { name, descriptionShort, descriptionLong, quantity, price, offerPrice, category, subCategory, foodType } = body;

    // Validate required fields
    if (!name || !descriptionShort || quantity === undefined || price === undefined || offerPrice === undefined || !category || !subCategory) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        name,
        descriptionShort,
        descriptionLong: descriptionLong || '',
        quantity: Number(quantity),
        price: Number(price),
        offerPrice: Number(offerPrice),
        category,
        subCategory,
        foodType: foodType || null,
      },
      { new: true }
    ).populate('companyId', 'name email companyLogo');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
   const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await Product.deleteOne({ _id: params.id });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}