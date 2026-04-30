import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Wishlist from '../../../models/Wishlist';
import { auth } from '../../../../auth';

// GET - Fetch user's wishlist
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await Wishlist.findOne({ userId: session.user.id })
      .populate('items.productId', 'name productImages price offerPrice');

    return NextResponse.json({
      items: wishlist?.items || [],
    });
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add to wishlist
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ userId: session.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: session.user.id, items: [] });
    }

    const existingIndex = wishlist.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingIndex === -1) {
      wishlist.items.push({ productId });
    } else {
      // Already in wishlist → remove it (toggle behavior)
      wishlist.items.splice(existingIndex, 1);
    }

    await wishlist.save();

    return NextResponse.json({
      message: existingIndex === -1 ? 'Added to wishlist' : 'Removed from wishlist',
      isInWishlist: existingIndex === -1,
      itemsCount: wishlist.items.length,
    });
  } catch (error: any) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

// DELETE - Remove from wishlist (optional, for future use)
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const wishlist = await Wishlist.findOne({ userId: session.user.id });
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    wishlist.items = wishlist.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    await wishlist.save();

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}