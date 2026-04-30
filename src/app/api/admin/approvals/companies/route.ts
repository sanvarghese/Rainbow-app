import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/adminAuth';
import connectDB from '../../../../../lib/mongodb';
import Company from '../../../../../models/Company';

// POST - Approve / Reject / Revoke
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    let query: any = { status: 'pending' };

    if (statusParam === 'approved') {
      query = { status: 'approved' };
    } else if (statusParam === 'rejected') {
      query = { status: 'rejected' };
    } else if (statusParam === 'all') {
      query = {};
    }

    const companies = await Company.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, companies });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Approve / Reject / Revoke
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { companyId, status } = await req.json();

    if (!companyId || !['approved', 'rejected'].includes(status as string)) {
      return NextResponse.json(
        { success: false, error: 'companyId and valid status (approved/rejected) are required' },
        { status: 400 }
      );
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Company ${status} successfully`,
      company,
    });
  } catch (error: any) {
    console.error('Company approval error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}