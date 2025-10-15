import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import connectDB from '../../../../lib/mongodb';
import Cart from '../../../../models/Cart';
import Product from '../../../../models/Product';
import Company from '../../../../models/Company';
import { auth } from '../../../../auth';

// Get user's cart
// Get user's cart
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId', 'name productImage price offerPrice')
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
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// Add item to cart
// Add item to cart
export async function POST(req: NextRequest) {
  try {
    console.log('=== CART POST REQUEST START ===');
    await connectDB();
    console.log('Database connected');
    
    const session = await auth();
    console.log('Session:', session);
    
    if (!session?.user?.email) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    
    const { productId, quantity = 1 } = body;

    if (!productId) {
      console.log('Product ID is required');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('Looking for product:', productId);
    
    // Get product details
    const product = await Product.findById(productId)
      .populate('companyId', 'name companyLogo');
    
    if (!product) {
      console.log('Product not found:', productId);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Product found:', {
      id: product._id,
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      isApproved: product.isApproved
    });

    if (!product.isApproved) {
      console.log('Product not approved:', productId);
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: session.user.id });
    console.log('Existing cart:', cart ? 'found' : 'not found');

    if (!cart) {
      cart = new Cart({
        userId: session.user.id,
        items: [],
      });
      console.log('Created new cart');
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    console.log('Existing item index:', existingItemIndex);

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
      console.log('Updated existing item quantity:', cart.items[existingItemIndex].quantity);
    } else {
      // Add new item with both prices
      const newItem = {
        productId: product._id,
        quantity,
        price: product.price, // Original price
        offerPrice: product.offerPrice, // Discounted price (actual price)
        name: product.name,
        productImage: product.productImage,
        companyId: product.companyId._id,
      };
      console.log('Adding new item:', newItem);
      cart.items.push(newItem);
    }

    await cart.save();
    console.log('Cart saved successfully');

    await cart.populate('items.productId', 'name productImage price offerPrice');
    await cart.populate('items.companyId', 'name companyLogo');

    console.log('Cart populated:', {
      itemsCount: cart.items.length,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      totalSavings: cart.totalSavings
    });

    return NextResponse.json({
      message: 'Item added to cart',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        totalSavings: cart.totalSavings,
      },
    });
  } catch (error: any) {
    console.error('=== CART POST ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'CastError') {
      console.error('CastError details:', error);
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    if (error.name === 'ValidationError') {
      console.error('ValidationError details:', error.errors);
      return NextResponse.json(
        { error: `Validation failed: ${JSON.stringify(error.errors)}` },
        { status: 400 }
      );
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.productId', 'name productImage price offerPrice');
    await cart.populate('items.companyId', 'name companyLogo');

    return NextResponse.json({
      message: 'Cart updated',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
      },
    });
  } catch (error: any) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// Remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId', 'name productImage price offerPrice');
    await cart.populate('items.companyId', 'name companyLogo');

    return NextResponse.json({
      message: 'Item removed from cart',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
      },
    });
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}