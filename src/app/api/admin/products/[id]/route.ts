import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../../../lib/adminAuth";
import connectDB from "../../../../../../lib/mongodb";
import Product from "../../../../../../models/Product";

// GET single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await verifyAdminToken(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const product = await Product.findById(params.id)
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
      product,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT - Admin update any product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await verifyAdminToken(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    // Get the raw text first to debug
    const rawBody = await req.text();
    console.log("Raw body:", rawBody); // Debug log

    // Parse the request body properly
    let body;
    try {
      // body = await req.json();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const {
      name,
      descriptionShort,
      descriptionLong,
      quantity,
      price,
      offerPrice,
      category,
      subCategory,
      foodType,
      hasVariants,
      variants,
      productImages,
      badges,
    } = body;

    // Validate required fields
    if (!name || !descriptionShort || !category || !subCategory) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData: any = {
      name,
      descriptionShort,
      descriptionLong: descriptionLong || "",
      category,
      subCategory,
      foodType: foodType || null,
      productImages: productImages || [],
      badges: badges || null,
    };

    // Handle variant vs non-variant products
    if (hasVariants) {
      updateData.hasVariants = true;
      updateData.variants = variants || [];
      // Remove non-variant fields from the document
      updateData.quantity = undefined;
      updateData.price = undefined;
      updateData.offerPrice = undefined;
    } else {
      updateData.hasVariants = false;
      updateData.quantity = Number(quantity);
      updateData.price = Number(price);
      updateData.offerPrice = Number(offerPrice);
      updateData.variants = undefined;
    }

    // Clean up undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true },
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
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE - Soft delete (change status to 'removed')
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await verifyAdminToken(req);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Soft delete - just update status to 'removed'
    product.status = "removed";
    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product moved to removed list successfully",
    });
  } catch (error: any) {
    console.error("Error removing product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
