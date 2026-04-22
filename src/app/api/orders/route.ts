// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import DeliveryAddress from "../../../../models/DeliveryAddress";
import Order from "../../../../models/Order";
import Cart from "../../../../models/Cart";
import { auth } from "../../../../auth";


export async function POST(req: NextRequest) {
  try {

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { addressId, paymentMethod, items, orderSummary } = await req.json();

    // Get user ID from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate address
    const address = await DeliveryAddress.findOne({
      _id: addressId,
      userId: user._id,
    });
    if (!address) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // Create order
    const order = await Order.create({
      userId: user._id,
      address: {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        subtitle: item.subtitle,
        quantity: item.quantity,
        price: item.price,
        offerPrice: item.offerPrice,
        image: item.image,
      })),
      paymentMethod,
      orderSummary,
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: user._id },
      { items: [], totalAmount: 0, totalItems: 0, totalSavings: 0 },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    
   const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
