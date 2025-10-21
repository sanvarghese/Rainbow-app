// app/api/admin/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Company from '../../../../../models/Company';
import { verifyAdminToken } from '../../../../../lib/adminAuth';
// import connectDB from '@/lib/mongodb';
// import Company from '@/models/Company';
// import { verifyAdminToken } from '@/lib/adminAuth';

// GET - Fetch all companies
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    console.log(admin,"admin from verify admin token.!!")
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const companies = await Company.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      companies,
    });
  } catch (error: any) {
    console.error('Fetch companies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies', details: error.message },
      { status: 500 }
    );
  }
}