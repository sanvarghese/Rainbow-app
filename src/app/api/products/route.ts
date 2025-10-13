import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import Company from '../../../../models/Company';

export async function GET(req: NextRequest) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const categories = searchParams.getAll('category');
    const minDiscount = searchParams.get('minDiscount');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Build query
    const query: any = { isApproved: true };

    // Category filter
    if (categories.length > 0) {
      query.category = { $in: categories };
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { descriptionShort: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sort: any = {};
    switch (sortBy) {
      case 'priceAsc':
        sort = { offerPrice: 1 };
        break;
      case 'priceDesc':
        sort = { offerPrice: -1 };
        break;
      case 'nameAsc':
        sort = { name: 1 };
        break;
      case 'nameDesc':
        sort = { name: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'discount':
        sort = { createdAt: -1 }; // Will handle discount sorting later
        break;
      default:
        sort = { createdAt: -1 };
    }

    console.log('Query:', query);
    console.log('Sort:', sort);

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    console.log(`Total products found: ${total}`);

    // Fetch products with company info
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('companyId', 'name companyLogo')
      .lean();

    console.log(`Products fetched: ${products.length}`);

    // Calculate discount percentage for each product
    let productsWithDiscount = products.map((product: any) => {
      const price = product.price || 0;
      const offerPrice = product.offerPrice || price;
      const discount = price > 0 && price > offerPrice
        ? Math.round(((price - offerPrice) / price) * 100)
        : 0;
      
      return {
        ...product,
        price,
        offerPrice,
        discount,
        company: product.companyId || { name: 'Unknown Company' },
      };
    });

    // Apply discount filter if specified
    if (minDiscount) {
      const minDiscountValue = parseInt(minDiscount);
      productsWithDiscount = productsWithDiscount.filter(product => 
        product.discount >= minDiscountValue
      );
    }

    // Sort by discount if requested
    if (sortBy === 'discount') {
      productsWithDiscount.sort((a, b) => b.discount - a.discount);
    }

    // Recalculate total after filtering
    const filteredTotal = minDiscount ? productsWithDiscount.length : total;

    console.log('Returning products:', productsWithDiscount.length);

    return NextResponse.json({
      success: true,
      products: productsWithDiscount,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
        hasMore: page < Math.ceil(filteredTotal / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: error.message || 'Failed to fetch products'
      },
      { status: 500 }
    );
  }
}