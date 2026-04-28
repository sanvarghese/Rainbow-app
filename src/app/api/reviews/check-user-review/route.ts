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
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    
    // Find delivered order containing this product
    const deliveredOrder = await Order.findOne({
      userId: session.user.id,
      status: 'delivered',
      'items.productId': productId
    }).sort({ createdAt: -1 }); // Get most recent order
    
    if (!deliveredOrder) {
      return NextResponse.json({ 
        success: true, 
        canReview: false,
        message: 'You can only review products you have purchased and received.'
      });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      userId: session.user.id,
      productId: productId
    });
    
    if (existingReview) {
      return NextResponse.json({ 
        success: true, 
        canReview: false,
        hasReview: true,
        existingReview: existingReview,
        orderId: deliveredOrder._id,
        message: 'You have already reviewed this product.'
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      canReview: true,
      orderId: deliveredOrder._id,
      message: 'You can write a review for this product.'
    });
    
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check review eligibility' },
      { status: 500 }
    );
  }
}