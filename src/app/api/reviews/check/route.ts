// app/api/reviews/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import connectDB from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import Review from "../../../../../models/Review";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    
    if (!productId || !orderId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    // Check if order exists and is delivered
    const order = await Order.findOne({
      _id: orderId,
      userId: session.user.id,
      status: 'delivered',
    });
    
    if (!order) {
      return NextResponse.json({ canReview: false, reason: 'Order not delivered' });
    }
    
    // Check if product exists in order
    const orderItem = order.items.find(item => item.productId.toString() === productId);
    if (!orderItem) {
      return NextResponse.json({ canReview: false, reason: 'Product not found in order' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({
      userId: session.user.id,
      productId,
      orderId,
    });
    
    if (existingReview) {
      return NextResponse.json({ 
        canReview: false, 
        hasReview: true,
        review: existingReview,
        reason: 'Already reviewed' 
      });
    }
    
    return NextResponse.json({ 
      canReview: true, 
      hasReview: false,
      orderItem: {
        name: orderItem.name,
        image: orderItem.image,
        variantDisplayValue: orderItem.variantDisplayValue,
      }
    });
  } catch (error) {
    console.error('Error checking review status:', error);
    return NextResponse.json(
      { error: 'Failed to check review status' },
      { status: 500 }
    );
  }
}