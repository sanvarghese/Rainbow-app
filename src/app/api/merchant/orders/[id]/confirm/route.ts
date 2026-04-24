// app/api/merchant/orders/[id]/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "../../../../../../../lib/mongodb";
import { auth } from "../../../../../../../auth";
import Order from "../../../../../../../models/Order";
import Product from "../../../../../../../models/Product";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Please login to continue" },
        { status: 401 },
      );
    }

    const { id } = params;

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      const order = await Order.findById(id).session(dbSession);

      if (!order) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status !== "pending") {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json(
          {
            error: "Order can only be confirmed from pending status",
          },
          { status: 400 },
        );
      }

      // Check and deduct stock for each item
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(
          dbSession,
        );

        if (!product) {
          await dbSession.abortTransaction();
          dbSession.endSession();
          return NextResponse.json(
            {
              error: `Product "${item.name}" not found`,
            },
            { status: 404 },
          );
        }

        // Handle variant products
        if (
          item.variantDisplayValue &&
          product.hasVariants &&
          product.variants
        ) {
          const variant = product.variants.find(
            (v) => v.displayValue === item.variantDisplayValue,
          );

          if (!variant) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return NextResponse.json(
              {
                error: `Variant "${item.variantDisplayValue}" for product "${item.name}" not found`,
              },
              { status: 404 },
            );
          }

          if (variant.quantity < item.quantity) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return NextResponse.json(
              {
                error: `Insufficient stock for ${item.name} (${variant.displayValue}). Available: ${variant.quantity}, Requested: ${item.quantity}`,
              },
              { status: 400 },
            );
          }

          variant.quantity -= item.quantity;
          await product.save({ session: dbSession });
        }
        // Handle regular products
        else {
          if (product.quantity < item.quantity) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return NextResponse.json(
              {
                error: `Insufficient stock for "${item.name}". Available: ${product.quantity}, Requested: ${item.quantity}`,
              },
              { status: 400 },
            );
          }

          product.quantity -= item.quantity;
          await product.save({ session: dbSession });
        }
      }

      // Update order status to confirmed
      order.status = "confirmed";
      await order.save({ session: dbSession });

      await dbSession.commitTransaction();
      dbSession.endSession();

      // Fetch the updated order with populated fields
      const updatedOrder = await Order.findById(id).populate(
        "userId",
        "name email",
      );

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        message: "Order confirmed and stock updated successfully",
      });
    } catch (error) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error confirming order:", error);
    return NextResponse.json(
      { error: "Failed to confirm order" },
      { status: 500 },
    );
  }
}
