import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import Order from "../../../../models/Order";
import { auth } from "../../../../../auth";

type Params = Promise<{ orderId: string }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { orderId } = await params;     // ← Fixed

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find order by orderId (not _id) and ensure it belongs to the user
    const order = await Order.findOne({
      orderId: orderId,          // ← Use the awaited orderId
      userId: user._id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}