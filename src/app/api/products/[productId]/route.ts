import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Product from '../../../../../models/Product';

export async function GET(
  req: NextRequest
) {
  try {
    await connectDB();

    // Extract ID from URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    console.log('Product ID from URL:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product with company details
    const product = await Product.findById(id)
      .populate('companyId', 'name companyLogo description')
      .lean();

    console.log('Found product:', product);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // FIX: Handle the isApproved check safely
    const productData = Array.isArray(product) ? product[0] : product;
    
    if (!productData.isApproved) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    // Calculate discount
    const discount = productData.price > productData.offerPrice
      ? Math.round(((productData.price - productData.offerPrice) / productData.price) * 100)
      : 0;

    const productWithDiscount = {
      ...productData,
      discount,
      company: productData.companyId,
    };

    return NextResponse.json({
      success: true,
      product: productWithDiscount,
    });
  } catch (error: any) {
    console.error('Get product error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch product: ' + error.message },
      { status: 500 }
    );
  }
}