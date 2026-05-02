import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '8');
    
    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }
    
    const products = await Product.find({
      status: 'approved',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subCategory: { $regex: query, $options: 'i' } },
        { descriptionShort: { $regex: query, $options: 'i' } },
      ]
    })
    .limit(50) // fetch more to extract unique categories
    .select('name category subCategory productImages offerPrice price hasVariants quantity variants')
    .populate('companyId', 'name')
    .lean();
    
    // Filter in-stock
    const inStockProducts = products.filter((product: any) => {
      if (!product.hasVariants) {
        return (product.quantity || 0) > 0;
      } else {
        return product.variants?.some((v: any) => (v.quantity || 0) > 0);
      }
    });

    // Extract unique matching categories and subCategories
    const categorySet = new Map<string, { name: string; type: 'category' | 'subCategory' }>();

    inStockProducts.forEach((product: any) => {
      // Check if category matches the query
      if (product.category && product.category.toLowerCase().includes(query.toLowerCase())) {
        const key = `cat_${product.category}`;
        if (!categorySet.has(key)) {
          categorySet.set(key, { name: product.category, type: 'category' });
        }
      }
      // Check if subCategory matches the query
      if (product.subCategory && product.subCategory.toLowerCase().includes(query.toLowerCase())) {
        const key = `sub_${product.subCategory}`;
        if (!categorySet.has(key)) {
          categorySet.set(key, { name: product.subCategory, type: 'subCategory' });
        }
      }
    });

    // Build category suggestions (show at top)
    const categorySuggestions = Array.from(categorySet.values()).map((cat) => ({
      id: `category_${cat.name}`,
      name: cat.name,
      type: cat.type,           // 'category' or 'subCategory'
      category: cat.name,
      subCategory: '',
      companyName: '',
      image: '',                // no image for category suggestions
      price: null,
    }));

    // Build product suggestions
    const productSuggestions = inStockProducts
      .slice(0, limit)
      .map((product: any) => ({
        id: product._id.toString(),
        name: product.name,
        type: 'product',
        category: product.category,
        subCategory: product.subCategory || '',
        companyName: product.companyId?.name || 'Unknown Brand',
        image: product.productImages?.[0] || '/placeholder-product.png',
        price: product.offerPrice || product.price || 0,
      }));

    // Category suggestions first, then products, total capped at limit
    const suggestions = [
      ...categorySuggestions,
      ...productSuggestions,
    ].slice(0, limit + categorySuggestions.length);
    
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