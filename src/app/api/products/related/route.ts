import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Product from "../../../../models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");        // Current product to exclude
    const relatedTo = searchParams.get("relatedTo");        // Comma-separated product IDs from cart/wishlist
    const limit = parseInt(searchParams.get("limit") || "6");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Build query
    const query: any = {
      status: "approved",
      _id: { $ne: productId },           // Exclude current product
    };

    let products = [];

    // 1. Priority: Products related to user's Cart & Wishlist
    if (relatedTo) {
      const relatedIds = relatedTo.split(",").filter(Boolean);

      if (relatedIds.length > 0) {
        // Get categories and companies from user's cart/wishlist items
        const userProducts = await Product.find({ _id: { $in: relatedIds } })
          .select("category companyId")
          .lean();

        const categories = [...new Set(userProducts.map(p => p.category))];
        const companyIds = [...new Set(userProducts.map(p => p.companyId))];

        if (categories.length > 0 || companyIds.length > 0) {
          query.$or = [
            { category: { $in: categories } },
            { companyId: { $in: companyIds } },
          ];
        }
      }
    }

    // 2. Fetch recommended products
    products = await Product.find(query)
      .populate("companyId", "name companyLogo")
      .sort({ createdAt: -1 })           // You can change sorting logic
      .limit(limit * 2)                  // Fetch more to filter later
      .lean();

    // 3. Apply stock filter (same logic as your main products route)
    const filteredProducts = products.filter((product: any) => {
      if (!product.hasVariants) {
        return (product.quantity || 0) > 0;
      } else {
        return product.variants?.some((v: any) => (v.quantity || 0) > 0);
      }
    });

    // 4. Add discount & company field
    const finalProducts = filteredProducts.slice(0, limit).map((product: any) => {
      let price = product.price || 0;
      let offerPrice = product.offerPrice || price;
      let discount = 0;

      if (!product.hasVariants) {
        discount = price > 0 && price > offerPrice
          ? Math.round(((price - offerPrice) / price) * 100)
          : 0;
      } else if (product.variants?.length > 0) {
        const bestDiscount = Math.max(...product.variants.map((v: any) => {
          const p = v.price || 0;
          const op = v.offerPrice || p;
          return p > 0 && p > op ? Math.round(((p - op) / p) * 100) : 0;
        }));
        discount = bestDiscount;
      }

      return {
        ...product,
        price,
        offerPrice,
        discount,
        company: product.companyId || { name: "Unknown Brand" },
      };
    });

    return NextResponse.json({
      success: true,
      products: finalProducts,
      count: finalProducts.length,
    });

  } catch (error: any) {
    console.error("Related products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}