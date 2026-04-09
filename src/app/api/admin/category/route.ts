import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../../lib/adminAuth";
import Category from "../../../../../models/Category";
import connectDB from "../../../../../lib/mongodb";

// GET - Fetch all categories (optionally filter by status)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    if (status && ["pending", "approved", "removed"].includes(status)) {
      query.status = status;
    }

    const categories = await Category.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    await connectDB();
    const body = await req.json();

    const {
      name,
      image,
      hasSubCategories,
      subCategories = [],
      status = "pending",
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 },
      );
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
        { status: 400 },
      );
    }

    const category = await Category.create({
      name,
      image: image || undefined,
      hasSubCategories: hasSubCategories || false,
      subCategories: hasSubCategories ? subCategories : [],
      status: status || "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    await connectDB();
    const body = await req.json();

    const {
      id,
      name,
      image,
      hasSubCategories,
      subCategories = [],
      status,
    } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: "Category ID and name are required" },
        { status: 400 },
      );
    }

    const updateData: any = {
      name,
      image: image || undefined,
      hasSubCategories: hasSubCategories || false,
      subCategories: hasSubCategories ? subCategories : [],
    };

    // Only update status if provided
    if (status && ["pending", "approved", "removed"].includes(status)) {
      updateData.status = status;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE - Soft delete (update status to 'removed')
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const hardDelete = searchParams.get("hardDelete") === "true"; // Optional hard delete

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    if (hardDelete) {
      // Hard delete - remove from database
      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        message: "Category permanently deleted successfully",
      });
    } else {
      // Soft delete - update status to 'removed'
      const category = await Category.findByIdAndUpdate(
        id,
        { status: "removed" },
        { new: true },
      );

      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Category moved to trash successfully",
        category,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
