import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';
import Company from '../../../models/Company';
import { auth } from '../../../../auth';

// Get user's cart
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId', 'name productImages price offerPrice')
      .populate('items.companyId', 'name companyLogo');

    if (!cart) {
      return NextResponse.json({
        items: [],
        totalAmount: 0,
        totalItems: 0,
        totalSavings: 0,
      });
    }

    return NextResponse.json({
      items: cart.items,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      totalSavings: cart.totalSavings,
    });
  } catch (error: any) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// Add item to cart
// Add item to cart
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch product
    const product = await Product.findById(productId).populate('companyId', 'name companyLogo');

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // ✅ FIXED: Use 'status' instead of 'isApproved'
    if (product.status !== 'approved') {
      console.log('Product not approved:', { id: productId, status: product.status });
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 });
    }

    // Stock check (handles both normal products and variants)
    const hasStock = product.hasVariants
      ? product.variants?.some((v: any) => v.quantity > 0)
      : product.quantity > 0;

    if (!hasStock) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      cart = new Cart({ userId: session.user.id, items: [] });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    // Determine price & image (support for future variants)
    let itemPrice = product.price;
    let itemOfferPrice = product.offerPrice;
    let itemName = product.name;
    let itemImage = product.productImages?.[0] || '';

    // TODO: Later when frontend supports variant selection, pass variantId and use that variant's price/offerPrice

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        productId: product._id,
        quantity,
        price: itemPrice,
        offerPrice: itemOfferPrice,
        name: itemName,
        productImage: itemImage,
        companyId: product.companyId?._id || product.companyId,
      };
      cart.items.push(newItem);
    }

    await cart.save();

    // Populate before sending response
    await cart.populate('items.productId', 'name productImages price offerPrice');
    await cart.populate('items.companyId', 'name companyLogo');

    return NextResponse.json({
      message: 'Item added to cart successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        totalSavings: cart.totalSavings,
      },
    });
  } catch (error: any) {
    console.error('=== CART POST ERROR ===', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to add item to cart: ' + error.message },
      { status: 500 }
    );
  }
}

// Update cart item quantity
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity } = await req.json();
    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.productId', 'name productImages price offerPrice');
    await cart.populate('items.companyId', 'name companyLogo');

    return NextResponse.json({
      message: 'Cart updated',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        totalSavings: cart.totalSavings,
      },
    });
  } catch (error: any) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// Remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId);
    await cart.save();
    await cart.populate('items.productId', 'name productImages price offerPrice');
    await cart.populate('items.companyId', 'name companyLogo');

    return NextResponse.json({
      message: 'Item removed from cart',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        totalSavings: cart.totalSavings,
      },
    });
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}