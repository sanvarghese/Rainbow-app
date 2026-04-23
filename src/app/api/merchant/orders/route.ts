// app/api/merchant/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import Order from "../../../../../models/Order";
import connectDB from "../../../../../lib/mongodb";
import { auth } from "../../../../../auth";
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import dbConnect from '@/lib/dbConnect';
// import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Please login to continue" },
        { status: 401 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = {};
    if (status && status !== "all") {
      query = { status };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
