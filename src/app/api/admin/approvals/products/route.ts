import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../../lib/adminAuth';
import connectDB from '../../../../../../lib/mongodb';
import Company from '../../../../../../models/Company';
import Product from '../../../../../../models/Product';

// GET - Fetch all products for approval
export async function GET(req: NextRequest) {
    try {
        const admin = await verifyAdminToken(req);

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const products = await Product.find({})
            .populate('companyId', 'name email companyLogo')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Approve or reject product
export async function POST(req: NextRequest) {
    try {
        const admin = await verifyAdminToken(req);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const { productId, isApproved } = await req.json();

        if (!productId || typeof isApproved !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Product ID and approval status are required' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            { isApproved },
            { new: true }
        ).populate('companyId', 'name');

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Product ${isApproved ? 'approved' : 'rejected'} successfully`,
            product,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}