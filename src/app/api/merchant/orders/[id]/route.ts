// app/api/merchant/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "../../../../../../lib/mongodb";
import { auth } from "../../../../../../auth";
import Order from "../../../../../../models/Order";
import Product from "../../../../../../models/Product";

export async function PATCH(
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
    const body = await req.json();
    const { status, deliveryDate } = body;

    // Start a session for transaction (to ensure data consistency)
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (deliveryDate) updateData.deliveryDate = new Date(deliveryDate);

      // If confirming the order, update product quantities
      if (status === "confirmed") {
        const order = await Order.findById(id).session(dbSession);

        if (!order) {
          await dbSession.abortTransaction();
          dbSession.endSession();
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 },
          );
        }

        // Process each item in the order
        for (const item of order.items) {
          const product = await Product.findById(item.productId).session(
            dbSession,
          );

          if (!product) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return NextResponse.json(
              {
                error: `Product ${item.name} not found`,
              },
              { status: 404 },
            );
          }

          // Check if product has variants
          if (product.hasVariants && product.variants) {
            // Find the specific variant that matches the ordered item
            // You need to identify which variant was ordered
            // This requires storing variant info in the order item
            const variant = product.variants.find(
              (v) => v.displayValue === item.variantDisplayValue, // You'll need to add this to order item
            );

            if (!variant) {
              await dbSession.abortTransaction();
              dbSession.endSession();
              return NextResponse.json(
                {
                  error: `Variant for product ${item.name} not found`,
                },
                { status: 404 },
              );
            }

            // Check if enough stock
            if (variant.quantity < item.quantity) {
              await dbSession.abortTransaction();
              dbSession.endSession();
              return NextResponse.json(
                {
                  error: `Insufficient stock for ${item.name} - ${variant.displayValue}. Available: ${variant.quantity}`,
                },
                { status: 400 },
              );
            }

            // Deduct quantity
            variant.quantity -= item.quantity;
            await product.save({ session: dbSession });
          } else {
            // Regular product without variants
            if (product.quantity < item.quantity) {
              await dbSession.abortTransaction();
              dbSession.endSession();
              return NextResponse.json(
                {
                  error: `Insufficient stock for ${item.name}. Available: ${product.quantity}`,
                },
                { status: 400 },
              );
            }

            // Deduct quantity
            product.quantity -= item.quantity;
            await product.save({ session: dbSession });
          }
        }
      }

      // Update order status
      const order = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        session: dbSession,
      });

      if (!order) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Commit the transaction
      await dbSession.commitTransaction();
      dbSession.endSession();

      return NextResponse.json({ order });
    } catch (error) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
