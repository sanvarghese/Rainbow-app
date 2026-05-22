import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import connectDB from "../../../../lib/mongodb";
import Company from "../../../../models/Company";
import Category from "../../../../models/Category"; // Import Category model
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../../lib/cloudinary";

// Clear cached model to ensure we use the latest schema
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

import Product from "../../../../models/Product";

async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const formData = await req.formData();
  const fields: any = {};
  const files: any = { productImages: [] };

  for (const [key, value] of Array.from(formData.entries())) {
    if (value instanceof File) {
      const bytes = await value.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileData = { data: buffer, mimetype: value.type, name: value.name };

      if (key === "productImages") {
        files.productImages.push(fileData);
      } else {
        files[key] = fileData;
      }
    } else {
      fields[key] = value;
    }
  }

  return { fields, files };
}


// Helper function to validate category hierarchy
async function validateCategoryHierarchy(
  categoryName: string,
  subCategoryName: string,
  childSubCategoryName?: string,
): Promise<{ valid: boolean; error?: string }> {
  const category = await Category.findOne({ name: categoryName });
  if (!category) return { valid: false, error: `Category "${categoryName}" does not exist` };

  if (!subCategoryName) {
    return category.hasSubCategories
      ? { valid: false, error: `Category "${categoryName}" requires a subcategory` }
      : { valid: true };
  }

  const subCategory = category.subCategories.find((sub: any) => sub.name === subCategoryName);
  if (!subCategory) {
    return { valid: false, error: `Subcategory "${subCategoryName}" does not exist in category "${categoryName}"` };
  }

  if (childSubCategoryName) {
    if (!subCategory.hasChildSubCategories) {
      return { valid: false, error: `Subcategory "${subCategoryName}" does not have child subcategories` };
    }
    const childSubCategory = subCategory.childSubCategories.find(
      (child: any) => child.name === childSubCategoryName,
    );
    if (!childSubCategory) {
      return { valid: false, error: `Child subcategory "${childSubCategoryName}" does not exist in subcategory "${subCategoryName}"` };
    }
  } else if (subCategory.hasChildSubCategories) {
    return { valid: false, error: `Subcategory "${subCategoryName}" requires a child subcategory` };
  }

  return { valid: true };
}

// ─── Helper: upload a buffer to Cloudinary ───────────────────────────────────
async function uploadImage(buffer: Buffer, folder: string) {
  const result = await uploadToCloudinary(buffer, folder) as {
    secure_url: string;
    public_id: string;
  };
  return { url: result.secure_url, publicId: result.public_id };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const company = await Company.findOne({ userId: session.user.id });
    if (!company) {
      return NextResponse.json(
        { error: "Company required", details: "Please create your company profile before adding products" },
        { status: 400 },
      );
    }

    const { fields, files } = await parseForm(req);
    const isUpdate = !!fields.productId;

    // ── Required field validation ──────────────────────────────────────────
    const missingFields = ["name", "descriptionShort", "category", "subCategory"].filter(
      (f) => !fields[f],
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      );
    }

    if (fields.descriptionShort.length < 50) {
      return NextResponse.json(
        { error: "Validation failed", details: "Short description must be at least 50 characters" },
        { status: 400 },
      );
    }

    const categoryValidation = await validateCategoryHierarchy(
      fields.category,
      fields.subCategory,
      fields.childSubCategory,
    );
    if (!categoryValidation.valid) {
      return NextResponse.json({ error: "Validation failed", details: categoryValidation.error }, { status: 400 });
    }

    const hasVariants = fields.hasVariants === "true";

    // ── Variant / standard field validation (unchanged) ────────────────────
    if (hasVariants) {
      if (!fields.variants) {
        return NextResponse.json(
          { error: "Validation failed", details: "Variants data is required when hasVariants is enabled" },
          { status: 400 },
        );
      }
      let variants: any[];
      try {
        variants = JSON.parse(fields.variants);
      } catch {
        return NextResponse.json({ error: "Validation failed", details: "Invalid variants data format" }, { status: 400 });
      }
      if (!Array.isArray(variants) || variants.length === 0) {
        return NextResponse.json({ error: "Validation failed", details: "At least one variant is required" }, { status: 400 });
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.variantType)  return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Type is required` }, { status: 400 });
        if (!v.variantValue) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Value is required` }, { status: 400 });
        if (!v.displayValue) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Display value is required` }, { status: 400 });
        if (v.variantType === "custom" && !v.variantUnit) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Custom unit is required` }, { status: 400 });
        if (typeof v.quantity !== "number" || v.quantity < 0) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Valid quantity is required` }, { status: 400 });
        if (typeof v.price !== "number" || v.price < 0) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Valid price is required` }, { status: 400 });
        if (typeof v.offerPrice !== "number" || v.offerPrice < 0) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Valid offer price is required` }, { status: 400 });
      }
    } else {
      if (!fields.quantity || !fields.price || !fields.offerPrice) {
        return NextResponse.json({ error: "Validation failed", details: "Quantity, price and offer price are required" }, { status: 400 });
      }
      if (isNaN(Number(fields.quantity)) || Number(fields.quantity) < 0) return NextResponse.json({ error: "Validation failed", details: "Quantity must be a positive number" }, { status: 400 });
      if (isNaN(Number(fields.price))    || Number(fields.price) < 0)    return NextResponse.json({ error: "Validation failed", details: "Price must be a positive number" }, { status: 400 });
      if (isNaN(Number(fields.offerPrice)) || Number(fields.offerPrice) < 0) return NextResponse.json({ error: "Validation failed", details: "Offer price must be a positive number" }, { status: 400 });
    }

    const isFoodOrPowderCategory = ["food", "powder"].includes(fields.category.toLowerCase());
    if (isFoodOrPowderCategory && !fields.foodType) {
      return NextResponse.json(
        { error: "Validation failed", details: "Food type is required for food and powder categories" },
        { status: 400 },
      );
    }

    // ── Build productData ──────────────────────────────────────────────────
    const productData: any = {
      name: fields.name,
      descriptionShort: fields.descriptionShort,
      descriptionLong: fields.descriptionLong || "",
      category: fields.category,
      subCategory: fields.subCategory,
      foodType: fields.foodType || null,
      hasVariants,
    };

    if (fields.childSubCategory) productData.childSubCategory = fields.childSubCategory;

    if (hasVariants) {
      productData.variants = JSON.parse(fields.variants);
      productData.quantity = 0;
      productData.price = 0;
      productData.offerPrice = 0;
    } else {
      productData.quantity = Number(fields.quantity);
      productData.price = Number(fields.price);
      productData.offerPrice = Number(fields.offerPrice);
      productData.variants = [];
    }

    // ── 🔑 IMAGE HANDLING (Cloudinary) ────────────────────────────────────
    if (isUpdate) {
      // UPDATE ─────────────────────────────────────────────────────────────
      const product = await Product.findOne({ _id: fields.productId, userId: session.user.id });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      // Parse existing images sent from the client
      // Shape: [{ url: string, publicId: string }]
      let existingImages: { url: string; publicId: string }[] = [];
      if (fields.existingImages) {
        try {
          existingImages = JSON.parse(fields.existingImages);
        } catch {
          existingImages = [];
        }
      }

      // Find removed images (images in DB but not in existingImages) and delete from Cloudinary
      const existingPublicIds = existingImages.map((img) => img.publicId);
      const removedImages = (product.productImages as any[]).filter(
        (img: any) => img.publicId && !existingPublicIds.includes(img.publicId),
      );
      await Promise.all(removedImages.map((img: any) => deleteFromCloudinary(img.publicId)));

      // Upload new images to Cloudinary
      const newImages = await Promise.all(
        (files.productImages || []).map((file: any) =>
          uploadImage(file.data, "products"),
        ),
      );

      const allImages = [...existingImages, ...newImages];

      if (allImages.length < 2) {
        return NextResponse.json(
          { error: "Validation failed", details: `At least 2 product images required. Current: ${allImages.length}` },
          { status: 400 },
        );
      }
      if (allImages.length > 5) {
        return NextResponse.json({ error: "Validation failed", details: "Maximum 5 product images allowed" }, { status: 400 });
      }

      productData.productImages = allImages; // [{ url, publicId }]

      // Upload badge if provided
      if (files.badges) {
        const badge = await uploadImage(files.badges.data, "badges");
        productData.badges = badge.url;
      }

      product.set(productData);
      await product.save();

      return NextResponse.json({ success: true, message: "Product updated successfully", product });

    } else {
      // CREATE ─────────────────────────────────────────────────────────────
      if (!files.productImages || files.productImages.length < 2) {
        return NextResponse.json(
          { error: "Validation failed", details: "At least 2 product images are required" },
          { status: 400 },
        );
      }
      if (files.productImages.length > 5) {
        return NextResponse.json({ error: "Validation failed", details: "Maximum 5 product images allowed" }, { status: 400 });
      }

      // Upload all product images to Cloudinary
      const uploadedImages = await Promise.all(
        files.productImages.map((file: any) => uploadImage(file.data, "products")),
      );

      productData.productImages = uploadedImages; // [{ url, publicId }]

      // Upload badge if provided
      if (files.badges) {
        const badge = await uploadImage(files.badges.data, "badges");
        productData.badges = badge.url;
      }

      productData.userId = session.user.id;
      productData.companyId = company._id;
      productData.status = "pending";

      const product = await Product.create(productData);

      return NextResponse.json({ success: true, message: "Product created successfully", product }, { status: 201 });
    }

  } catch (error: any) {
    console.error("Product operation error:", error);
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: "Validation failed", details: errorMessages.join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error", details: error.message || "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Server error", details: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = new URL(req.url).searchParams.get("id");
    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    await connectDB();

    const product = await Product.findOne({ _id: productId, userId: session.user.id });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Delete all product images from Cloudinary
    const imageDeletions = (product.productImages as any[])
      .filter((img: any) => img.publicId)
      .map((img: any) => deleteFromCloudinary(img.publicId));

    await Promise.all(imageDeletions);

    await Product.deleteOne({ _id: productId });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error", details: "Failed to delete product" }, { status: 500 });
  }}
