import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import connectDB from "../../../../lib/mongodb";
import Banner from "../../../../models/Banner";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;   // ← Important
  try {
    await connectDB();
    const body = await request.json();

    // If updating image, delete old image file
    if (body.image && body.deleteOldImage) {
      const existingBanner = await Banner.findById(id);
      if (existingBanner && existingBanner.image) {
        try {
          const oldImagePath = path.join(
            process.cwd(),
            "public",
            existingBanner.image,
          );
          await unlink(oldImagePath);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
      delete body.deleteOldImage;
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true },
    );

    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update banner" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  
  try {
    await connectDB();

    // Get banner to delete image file
    const banner = await Banner.findById(id);
    if (banner && banner.image) {
      try {
        const imagePath = path.join(process.cwd(), "public", banner.image);
        await unlink(imagePath);
      } catch (error) {
        console.error("Error deleting image file:", error);
      }
    }

    await Banner.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete banner" },
      { status: 500 },
    );
  }
}
