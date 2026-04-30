// app/api/admin/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../../lib/adminAuth";
import connectDB from "../../../../../lib/mongodb";
import Company from "../../../../../models/Company";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET - Get single company
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

    const company = await Company.findById(params.id).populate(
      "userId",
      "name email",
    );

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT - Update company
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

    const formData = await req.formData();

    const updateData: any = {
      name: formData.get("name"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
      address: formData.get("address"),
      description: formData.get("description") || "",
      gstNumber: formData.get("gstNumber") || "",
      facebookLink: formData.get("facebookLink") || "",
      instagramLink: formData.get("instagramLink") || "",
      website: formData.get("website") || "",
    };

    // Handle file uploads
    const uploadDir = path.join(process.cwd(), "public/uploads/companies");
    await mkdir(uploadDir, { recursive: true });

    // Company Logo
    const companyLogo = formData.get("companyLogo") as File;
    if (companyLogo && companyLogo.size > 0) {
      const bytes = await companyLogo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${companyLogo.name}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      updateData.companyLogo = `/uploads/companies/${filename}`;
    } else {
      const existingLogo = formData.get("existingCompanyLogo");
      if (existingLogo) updateData.companyLogo = existingLogo;
    }

    // Badges
    const badges = formData.get("badges") as File;
    if (badges && badges.size > 0) {
      const bytes = await badges.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${badges.name}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      updateData.badges = `/uploads/companies/${filename}`;
    } else {
      const existingBadges = formData.get("existingBadges");
      if (existingBadges) updateData.badges = existingBadges;
    }

    // Banner
    const banner = formData.get("banner") as File;
    if (banner && banner.size > 0) {
      const bytes = await banner.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${banner.name}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      updateData.banner = `/uploads/companies/${filename}`;
    } else {
      const existingBanner = formData.get("existingBanner");
      if (existingBanner) updateData.banner = existingBanner;
    }

    const company = await Company.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email");

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
      company,
    });
  } catch (error: any) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE - Soft delete company
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

    const company = await Company.findById(params.id);

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 },
      );
    }

    // Soft delete - update status to 'removed' or just delete
    await Company.deleteOne({ _id: params.id });

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
