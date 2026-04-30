// app/api/admin/weekend-offers/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/dbConnect';
// import WeekendOffer from '@/models/WeekendOffer';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '../../../../lib/mongodb';
import { verifyAdminToken } from '../../../../lib/adminAuth';
import WeekendOffer from '../../../../models/WeekendOffer';

export async function GET() {
    await connectDB();
  const offers = await WeekendOffer.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  return NextResponse.json({ success: true, offers });
}

export async function POST(req: NextRequest) {

  const admin = await verifyAdminToken(req);
      if (!admin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
  

    await connectDB();
  const body = await req.json();

  const offer = await WeekendOffer.create(body);
  return NextResponse.json({ success: true, offer });
}