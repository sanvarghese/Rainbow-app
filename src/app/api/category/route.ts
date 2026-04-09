import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Category from '../../../../models/Category';


export async function GET() {
  try {
    await connectDB();
    // Only fetch approved categories by default
    const categories = await Category.find({ status: 'approved' }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}