import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../../lib/adminAuth";
import connectDB from "../../../../../lib/mongodb";

import Product from "../../../../../models/Product";

// GET - Fetch all products for approval
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query: any = {};

    if (status === "pending" || !status) {
      // Default behavior: Show only pending (inactive) products
      query = { status: "pending" };
    } else if (status === "approved") {
      query = { status: "approved" };
    } else if (status === "rejected") {
      query = { status: "rejected" };
    } 
    // You can add "removed" later if needed

    const products = await Product.find(query)
      .populate("companyId", "name email companyLogo")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Approve or reject a single product
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await req.json(); // ← This is the correct way
    const { productId, isApproved } = body; // ← Match what frontend sends

    if (!productId || typeof isApproved !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "productId and isApproved (boolean) are required",
        },
        { status: 400 },
      );
    }

    const newStatus = isApproved ? "approved" : "rejected";

    const product = await Product.findByIdAndUpdate(
      productId,
      { status: newStatus },
      { new: true },
    )
      .populate("companyId", "name email companyLogo")
      .populate("userId", "name email");

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product ${isApproved ? "approved" : "rejected"} successfully`,
      product,
    });
  } catch (error: any) {
    console.error("Product approval error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}


// PATCH - Bulk approve/reject multiple products
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await req.json();
    const { productIds, action } = body;

    if (
      !productIds ||
      !Array.isArray(productIds) ||
      productIds.length === 0 ||
      !action
    ) {
      return NextResponse.json(
        { success: false, error: "Product IDs array and action are required" },
        { status: 400 },
      );
    }

    let newStatus: "approved" | "rejected";
    let actionMessage: string;

    if (action === "approve") {
      newStatus = "approved";
      actionMessage = "approved";
    } else if (action === "reject") {
      newStatus = "rejected";
      actionMessage = "rejected";
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 },
      );
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { status: newStatus },
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} products ${actionMessage} successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error("Bulk approval error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
