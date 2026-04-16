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

    console.log('checking product listing...!')
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const categories = searchParams.getAll('category');
    const minDiscount = searchParams.get('minDiscount');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Build query - ONLY approved products
    const query: any = { 
      status: "approved"   // Changed from isApproved: true
    };

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
        sort = { createdAt: -1 }; // Will handle later
        break;
      default:
        sort = { createdAt: -1 };
    }

    console.log('Query:', query);
    console.log('Sort:', sort);

    // Get total count for pagination (before discount filter)
    const total = await Product.countDocuments(query);
    console.log(`Total approved products found: ${total}`);

    // Fetch products with company info
    let products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('companyId', 'name companyLogo')
      .lean();

    console.log(`Products fetched before quantity filter: ${products.length}`);

    // Filter products based on quantity logic (non-variant + variant products)
    let filteredProducts = products.filter((product: any) => {
      if (!product.hasVariants) {
        // Non-variant product: quantity must be greater than 0
        return (product.quantity || 0) > 0;
      } else {
        // Variant product: at least one variant must have quantity > 0
        if (!product.variants || product.variants.length === 0) return false;
        
        return product.variants.some((variant: any) => (variant.quantity || 0) > 0);
      }
    });

    console.log(`Products after quantity filter: ${filteredProducts.length}`);

    // Calculate discount and attach company
    let productsWithDiscount = filteredProducts.map((product: any) => {
      let price = product.price || 0;
      let offerPrice = product.offerPrice || price;
      let discount = 0;

      if (!product.hasVariants) {
        discount = price > 0 && price > offerPrice
          ? Math.round(((price - offerPrice) / price) * 100)
          : 0;
      } else if (product.variants && product.variants.length > 0) {
        // For variant products, you can show the best discount (optional)
        const bestDiscount = Math.max(...product.variants.map((v: any) => {
          const p = v.price || 0;
          const op = v.offerPrice || p;
          return p > 0 && p > op ? Math.round(((p - op) / p) * 100) : 0;
        }));
        discount = bestDiscount;
        // You can also take the lowest offerPrice if needed
      }

      return {
        ...product,
        price,
        offerPrice,
        discount,
        company: product.companyId || { name: 'Unknown Company' },
      };
    });

    // Apply minDiscount filter if specified
    if (minDiscount) {
      const minDiscountValue = parseInt(minDiscount);
      productsWithDiscount = productsWithDiscount.filter(
        product => product.discount >= minDiscountValue
      );
    }

    // Sort by discount if requested
    if (sortBy === 'discount') {
      productsWithDiscount.sort((a, b) => b.discount - a.discount);
    }

    // Final total after all client-side filters
    const finalTotal = productsWithDiscount.length;

    console.log('Returning products:', productsWithDiscount.length);

    return NextResponse.json({
      success: true,
      products: productsWithDiscount,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
        hasMore: page < Math.ceil(finalTotal / limit),
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