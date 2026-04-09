import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Product from '../../../../../models/Product';


export async function GET() {
  try {
    await connectDB();
    
    // Fetch latest approved products, sorted by creation date (newest first)
    const latestProducts = await Product.find({ status: 'approved' })
      .sort({ createdAt: -1 }) // Newest first
      .limit(10) // Limit to 8 products (matches your static array length)
      .populate('companyId', 'name') // Populate company name if needed
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      products: latestProducts 
    });
  } catch (error) {
    console.error('Error fetching latest products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}