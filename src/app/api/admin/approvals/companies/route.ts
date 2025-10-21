import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../../lib/adminAuth';
import connectDB from '../../../../../../lib/mongodb';
import Company from '../../../../../../models/Company';

// GET - Fetch all companies for approval
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
        const companies = await Company.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            companies,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Approve or reject company
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
        const { companyId, isApproved } = await req.json();

        if (!companyId || typeof isApproved !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Company ID and approval status are required' },
                { status: 400 }
            );
        }

        const company = await Company.findByIdAndUpdate(
            companyId,
            { isApproved },
            { new: true }
        ).populate('userId', 'name email');

        if (!company) {
            return NextResponse.json(
                { success: false, error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Company ${isApproved ? 'approved' : 'rejected'} successfully`,
            company,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

