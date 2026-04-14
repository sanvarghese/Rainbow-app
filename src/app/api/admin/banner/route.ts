// app/api/banners/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Banner from '../../../../../models/Banner';

export async function GET() {
  try {
    await connectDB();
    
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('title image link');   // Only fetch needed fields

    return NextResponse.json({ 
      success: true, 
      banners 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch banners' 
    }, { status: 500 });
  }
}