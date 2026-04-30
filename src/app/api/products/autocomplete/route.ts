import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Search for products matching the query (approved and in stock)
    const products = await Product.find({
      status: 'approved',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { descriptionShort: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subCategory: { $regex: query, $options: 'i' } },
        
      ]
      
    })
    .limit(limit)
    .select('name category subCategory productImages offerPrice price discount')
    .populate('companyId', 'name')
    .lean();
    
    // Filter for in-stock products
    const inStockProducts = products.filter((product: any) => {
      if (!product.hasVariants) {
        return (product.quantity || 0) > 0;
      } else {
        return product.variants?.some((v: any) => (v.quantity || 0) > 0);
      }
    });
    
    // Format suggestions
    const suggestions = inStockProducts.map((product: any) => ({
      id: product._id,
      name: product.name,
      category: product.category,
      subCategory: product.subCategory,
      companyName: product.companyId?.name || 'Unknown Brand',
      image: product.productImages?.[0] || '/placeholder-product.png',
      price: product.offerPrice || product.price,
    }));
    
    return NextResponse.json({ 
      success: true, 
      suggestions,
      total: suggestions.length 
    });
    
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}