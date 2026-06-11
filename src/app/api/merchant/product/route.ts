import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import connectDB from "../../../../lib/mongodb";
import Company from "../../../../models/Company";
import Category from "../../../../models/Category";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../../lib/cloudinary";

if (mongoose.models.Product) delete mongoose.models.Product;
import Product from "../../../../models/Product";

// ─── parseForm ────────────────────────────────────────────────────────────────
// Collects:
//   files.productImages[]           – main product images
//   files.variantImages[key][]      – keyed as "variantImage_<vi>_<imgIdx>"  → array per variant
//   files.optionImages[key][]       – keyed as "optionImage_<vi>_<oi>_<imgIdx>" → array per option
//   files.badges                    – badge file
async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const formData = await req.formData();
  const fields: any = {};
  const files: any = {
    productImages: [],
    variantImages: {},  // { "0": [FileData, FileData], "1": [FileData], ... }
    optionImages: {},   // { "0_0": [FileData], "0_1": [FileData, FileData], ... }
  };

  for (const [key, value] of Array.from(formData.entries())) {
    if (value instanceof File) {
      const bytes = await value.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileData = { data: buffer, mimetype: value.type, name: value.name };

      if (key === "productImages") {
        files.productImages.push(fileData);
      } else if (key.startsWith("variantImage_")) {
        // key = variantImage_<variantIndex>_<imageIndex>
        const parts = key.replace("variantImage_", "").split("_");
        const vIdx = parts[0]; // variant index
        if (!files.variantImages[vIdx]) files.variantImages[vIdx] = [];
        files.variantImages[vIdx].push(fileData);
      } else if (key.startsWith("optionImage_")) {
        // key = optionImage_<variantIndex>_<optionIndex>_<imageIndex>
        const parts = key.replace("optionImage_", "").split("_");
        const oKey = `${parts[0]}_${parts[1]}`; // "variantIdx_optionIdx"
        if (!files.optionImages[oKey]) files.optionImages[oKey] = [];
        files.optionImages[oKey].push(fileData);
      } else if (key === "badges") {
        files.badges = fileData;
      } else {
        files[key] = fileData;
      }
    } else {
      fields[key] = value;
    }
  }

  return { fields, files };
}

// ─── Category validation (unchanged) ─────────────────────────────────────────
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

// ─── Cloudinary helper ────────────────────────────────────────────────────────
async function uploadImage(buffer: Buffer, folder: string) {
  const result = await uploadToCloudinary(buffer, folder) as {
    secure_url: string;
    public_id: string;
  };
  return { url: result.secure_url, publicId: result.public_id };
}

// ─── POST (create / update) ───────────────────────────────────────────────────
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

    // ── Basic field validation ─────────────────────────────────────────────
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

    // ── Variant validation ─────────────────────────────────────────────────
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
        if (v.variantType === "color" && !v.colorHex)    return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Color value is required` }, { status: 400 });

        // If variant has no child options, it must have its own price/qty
        if (!v.options || v.options.length === 0) {
          if (typeof v.quantity !== "number" || v.quantity < 0) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Valid quantity is required` }, { status: 400 });
          if (typeof v.price !== "number" || v.price < 0)       return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Valid price is required` }, { status: 400 });
          if (typeof v.offerPrice !== "number" || v.offerPrice < 0) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1}: Valid offer price is required` }, { status: 400 });
        }

        // Validate child options
        if (v.options && v.options.length > 0) {
          for (let j = 0; j < v.options.length; j++) {
            const opt = v.options[j];
            if (!opt.optionType)  return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1} Option ${j + 1}: Type is required` }, { status: 400 });
            if (!opt.optionLabel) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1} Option ${j + 1}: Label is required` }, { status: 400 });
            if (opt.optionType === "color" && !opt.colorHex) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1} Option ${j + 1}: Color value is required` }, { status: 400 });
            if (typeof opt.quantity !== "number" || opt.quantity < 0) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1} Option ${j + 1}: Valid quantity is required` }, { status: 400 });
            if (typeof opt.price !== "number" || opt.price < 0)       return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1} Option ${j + 1}: Valid price is required` }, { status: 400 });
            if (typeof opt.offerPrice !== "number" || opt.offerPrice < 0) return NextResponse.json({ error: "Validation failed", details: `Variant ${i + 1} Option ${j + 1}: Valid offer price is required` }, { status: 400 });
          }
        }
      }
    } else {
      if (!fields.quantity || !fields.price || !fields.offerPrice) {
        return NextResponse.json({ error: "Validation failed", details: "Quantity, price and offer price are required" }, { status: 400 });
      }
      if (isNaN(Number(fields.quantity)) || Number(fields.quantity) < 0) return NextResponse.json({ error: "Validation failed", details: "Quantity must be a positive number" }, { status: 400 });
      if (isNaN(Number(fields.price)) || Number(fields.price) < 0)       return NextResponse.json({ error: "Validation failed", details: "Price must be a positive number" }, { status: 400 });
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

    // ── Process variants with images ───────────────────────────────────────
    if (hasVariants) {
      const rawVariants: any[] = JSON.parse(fields.variants);

      const processedVariants = await Promise.all(
        rawVariants.map(async (v: any, i: number) => {
          // v.images = existing Cloudinary images kept from the edit form (array of { url, publicId })
          // files.variantImages[i] = new files uploaded for this variant (array)
          const existingVariantImages: { url: string; publicId: string }[] = v.images ?? [];
          const newVariantImageFiles: any[] = files.variantImages[String(i)] ?? [];

          const newVariantImages = await Promise.all(
            newVariantImageFiles.map((f: any) => uploadImage(f.data, "variant-images"))
          );

          const variantImages = [...existingVariantImages, ...newVariantImages];

          // Process child options
          const processedOptions = await Promise.all(
            (v.options || []).map(async (opt: any, j: number) => {
              const existingOptionImages: { url: string; publicId: string }[] = opt.images ?? [];
              const oKey = `${i}_${j}`;
              const newOptionImageFiles: any[] = files.optionImages[oKey] ?? [];

              const newOptionImages = await Promise.all(
                newOptionImageFiles.map((f: any) => uploadImage(f.data, "option-images"))
              );

              const optionImages = [...existingOptionImages, ...newOptionImages];

              return {
                optionType:  opt.optionType,
                optionLabel: opt.optionLabel,
                colorHex:    opt.colorHex || undefined,
                images:      optionImages,
                quantity:    Number(opt.quantity ?? 0),
                price:       Number(opt.price ?? 0),
                offerPrice:  Number(opt.offerPrice ?? 0),
              };
            }),
          );

          return {
            variantType:  v.variantType,
            variantUnit:  v.variantUnit || undefined,
            variantValue: v.variantValue,
            displayValue: v.displayValue,
            colorHex:     v.colorHex || undefined,
            images:       variantImages,
            quantity:     Number(v.quantity ?? 0),
            price:        Number(v.price ?? 0),
            offerPrice:   Number(v.offerPrice ?? 0),
            options:      processedOptions,
          };
        }),
      );

      productData.variants = processedVariants;
      productData.quantity = 0;
      productData.price = 0;
      productData.offerPrice = 0;
    } else {
      productData.quantity = Number(fields.quantity);
      productData.price = Number(fields.price);
      productData.offerPrice = Number(fields.offerPrice);
      productData.variants = [];
    }

    // ── IMAGE HANDLING (product images + badge) ────────────────────────────
    if (isUpdate) {
      const product = await Product.findOne({ _id: fields.productId, userId: session.user.id });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      let existingImages: { url: string; publicId: string }[] = [];
      if (fields.existingImages) {
        try { existingImages = JSON.parse(fields.existingImages); } catch { existingImages = []; }
      }

      const existingPublicIds = existingImages.map((img) => img.publicId);
      const removedImages = (product.productImages as any[]).filter(
        (img: any) => img.publicId && !existingPublicIds.includes(img.publicId),
      );
      await Promise.all(removedImages.map((img: any) => deleteFromCloudinary(img.publicId)));

      // ── Delete removed variant/option images from Cloudinary ──────────
      const oldVariants: any[] = (product.variants as any[]) || [];
      const newVariants: any[] = productData.variants || [];

      // Collect all publicIds that still exist in the new variant set
      const keptVariantPublicIds = new Set<string>();
      newVariants.forEach((v: any) => {
        (v.images || []).forEach((img: any) => { if (img.publicId) keptVariantPublicIds.add(img.publicId); });
        (v.options || []).forEach((opt: any) => {
          (opt.images || []).forEach((img: any) => { if (img.publicId) keptVariantPublicIds.add(img.publicId); });
        });
      });

      // Delete anything from old variants that's no longer kept
      const variantImageDeletions: Promise<any>[] = [];
      oldVariants.forEach((v: any) => {
        (v.images || []).forEach((img: any) => {
          if (img.publicId && !keptVariantPublicIds.has(img.publicId))
            variantImageDeletions.push(deleteFromCloudinary(img.publicId));
        });
        (v.options || []).forEach((opt: any) => {
          (opt.images || []).forEach((img: any) => {
            if (img.publicId && !keptVariantPublicIds.has(img.publicId))
              variantImageDeletions.push(deleteFromCloudinary(img.publicId));
          });
        });
      });
      await Promise.all(variantImageDeletions);
      // ─────────────────────────────────────────────────────────────────

      const newImages = await Promise.all(
        (files.productImages || []).map((file: any) => uploadImage(file.data, "products")),
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

      productData.productImages = allImages;

      if (files.badges) {
        const badge = await uploadImage(files.badges.data, "badges");
        productData.badges = badge.url;
      }

      product.set(productData);
      await product.save();

      return NextResponse.json({ success: true, message: "Product updated successfully", product });
    } else {
      if (!files.productImages || files.productImages.length < 2) {
        return NextResponse.json(
          { error: "Validation failed", details: "At least 2 product images are required" },
          { status: 400 },
        );
      }
      if (files.productImages.length > 5) {
        return NextResponse.json({ error: "Validation failed", details: "Maximum 5 product images allowed" }, { status: 400 });
      }

      const uploadedImages = await Promise.all(
        files.productImages.map((file: any) => uploadImage(file.data, "products")),
      );

      productData.productImages = uploadedImages;

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

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find({ userId: session.user.id, status: { $ne: "removed" }}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ error: "Server error", details: "Failed to fetch products" }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = new URL(req.url).searchParams.get("id");
    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    await connectDB();

    const product = await Product.findOne({ _id: productId, userId: session.user.id });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Delete all product images
    const imageDeletions = (product.productImages as any[])
      .filter((img: any) => img.publicId)
      .map((img: any) => deleteFromCloudinary(img.publicId));

    // Delete all variant/option images
    const variantImageDeletions: Promise<any>[] = [];
    ((product.variants as any[]) || []).forEach((v: any) => {
      (v.images || []).forEach((img: any) => {
        if (img.publicId) variantImageDeletions.push(deleteFromCloudinary(img.publicId));
      });
      (v.options || []).forEach((opt: any) => {
        (opt.images || []).forEach((img: any) => {
          if (img.publicId) variantImageDeletions.push(deleteFromCloudinary(img.publicId));
        });
      });
    });

    await Promise.all([...imageDeletions, ...variantImageDeletions]);
    await Product.deleteOne({ _id: productId });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error", details: "Failed to delete product" }, { status: 500 });
  } 
}