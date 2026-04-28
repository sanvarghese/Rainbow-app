import { NextRequest, NextResponse } from "next/server";
import Review from "../../../../../../models/Review";
import connectDB from "../../../../../../lib/mongodb";
import { auth } from "../../../../../../auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { productId } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get all approved reviews for this product
    const reviews = await Review.find({
      productId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({
      productId,
      status: "approved",
    });

    // Calculate average rating
    const ratingAggregation = await Review.aggregate([
      { $match: { productId, status: "approved" } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    const averageRating =
      ratingAggregation.length > 0
        ? Math.round(ratingAggregation[0].averageRating * 10) / 10
        : 0;

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { productId, status: "approved" } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingDistribution.forEach((item) => {
      distribution[item._id as keyof typeof distribution] = item.count;
    });

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews,
      averageRating,
      ratingDistribution: distribution,
      page,
      totalPages: Math.ceil(totalReviews / limit),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
