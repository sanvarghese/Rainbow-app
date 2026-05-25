import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import Company from "../../../../models/Company";
import Product from "../../../../models/Product";
import { auth } from "../../../../../auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ isFullyOnboarded: false });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email }).select("role _id");

        if (!user || user.role?.toLowerCase() !== "merchant") {
            return NextResponse.json({ isFullyOnboarded: false });
        }

        const company = await Company.findOne({ userId: user._id });

        if (!company) {
            return NextResponse.json({ isFullyOnboarded: false });
        }

        const productCount = await Product.countDocuments({
            userId: user._id,
            companyId: company._id,
        });

        return NextResponse.json({
            isFullyOnboarded: productCount > 0,
        });

    } catch (error) {
        console.error("Onboarding status error:", error);
        return NextResponse.json({ isFullyOnboarded: false }, { status: 500 });
    }
}