// app/api/merchant/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../lib/mongodb";
import { auth } from "../../../../../../auth";
import Order from "../../../../../../models/Order";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Please login to continue" },
        { status: 401 },
      );
    }

    await connectDB();

    const { id } = params;
    const body = await req.json();
    const { status, deliveryDate } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (deliveryDate) updateData.deliveryDate = new Date(deliveryDate);

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
