// app/api/subcategories/route.ts
import { NextResponse } from "next/server";
import Category from "../../../../models/Category";
import connectDB from "../../../../lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    // Fetch all approved categories that have subcategories
    const categories = await Category.find({
      status: "approved",
      hasSubCategories: true,
    }).select("name subCategories");

    // Extract all subcategories with their parent category info
    const subCategories = [];

    for (const category of categories) {
      for (const subCategory of category.subCategories) {
        subCategories.push({
          _id: subCategory._id,
          name: subCategory.name,
          image: subCategory.image || null,
          parentCategory: category.name,
          hasChildSubCategories: subCategory.hasChildSubCategories || false,
          childSubCategories: subCategory.childSubCategories || [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subcategories" },
      { status: 500 },
    );
  }
}
