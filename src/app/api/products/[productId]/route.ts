import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    console.log('Fetching product with ID:', id);

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch product with company details
    const product = await Product.findById(id)
      .populate('companyId', 'name companyLogo description')
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // IMPORTANT: Check status instead of isApproved
    if (product.status !== 'approved') {
      return NextResponse.json(
        { error: 'Product is not approved or not available' },
        { status: 404 }
      );
    }

    // Quantity validation (non-variant + variant products)
    let isAvailable = false;
    let availableQuantity = 0;

    if (!product.hasVariants) {
      // Non-variant product
      availableQuantity = product.quantity || 0;
      isAvailable = availableQuantity > 0;
    } else {
      // Variant product - check if at least one variant has quantity > 0
      if (product.variants && product.variants.length > 0) {
        const totalStock = product.variants.reduce((sum: number, v: any) => 
          sum + (v.quantity || 0), 0);
        availableQuantity = totalStock;
        isAvailable = totalStock > 0;
      }
    }

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 404 }
      );
    }

    // Calculate discount (for non-variant products)
    let discount = 0;
    if (!product.hasVariants) {
      discount = product.price > product.offerPrice
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
        : 0;
    } else {
      // For variant products - find best discount
      if (product.variants && product.variants.length > 0) {
        discount = Math.max(...product.variants.map((v: any) => {
          const p = v.price || 0;
          const op = v.offerPrice || p;
          return p > 0 && p > op ? Math.round(((p - op) / p) * 100) : 0;
        }));
      }
    }

    // Prepare response for frontend (make it compatible with your Product interface)
    const productWithDiscount = {
      ...product,
      discount,
      company: product.companyId || { name: 'Unknown Brand' },
      // For backward compatibility with your frontend
      quantity: availableQuantity,   // Total available quantity
      price: product.price || (product.variants?.[0]?.price || 0),
      offerPrice: product.offerPrice || (product.variants?.[0]?.offerPrice || 0),
    };

    console.log('Product successfully fetched and returned');

    return NextResponse.json({
      success: true,
      product: productWithDiscount,
    });

  } catch (error: any) {
    console.error('Get single product error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}