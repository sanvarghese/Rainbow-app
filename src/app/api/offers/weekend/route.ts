// app/api/weekend-offers/route.ts
import { NextResponse } from 'next/server';
import WeekendOffer from '../../../../../models/WeekendOffer';
import connectDB from '../../../../../lib/mongodb';
// import dbConnect from '@/lib/dbConnect';          
// import WeekendOffer from '@/models/WeekendOffer';

export async function GET() {
  try {
    await connectDB();

    const offers = await WeekendOffer.find({ 
      isActive: true 
    })
    .sort({ order: 1, createdAt: -1 })   
    .select('title images order')        
    .lean();                             

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length
    });

  } catch (error: any) {
    console.error('Error fetching weekend offers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weekend offers',
      message: error.message
    }, { status: 500 });
  }
}