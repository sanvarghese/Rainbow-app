import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import connectDB from '../../../../../lib/mongodb';
import Company from '../../../../../models/Company';
import Product from '../../../../../models/Product';
// import { auth } from '@/auth';
// import connectDB from '@/lib/mongodb';
// import Product from '@/models/Product';
// import Company from '@/models/Company';

async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const formData = await req.formData();
  const fields: any = {};
  const files: any = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const bytes = await value.arrayBuffer();
      const buffer = Buffer.from(bytes);
      files[key] = {
        data: buffer.toString('base64'),
        mimetype: value.type,
        name: value.name,
      };
    } else {
      fields[key] = value;
    }
  }

  return { fields, files };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please login to continue' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if company exists
    const company = await Company.findOne({ userId: session.user.id });
    if (!company) {
      return NextResponse.json(
        { 
          error: 'Company required',
          details: 'Please create your company profile before adding products'
        },
        { status: 400 }
      );
    }

    const { fields, files } = await parseForm(req);

    // Validate required fields
    const requiredFields = ['name', 'descriptionShort', 'quantity', 'category', 'subCategory'];
    const missingFields = requiredFields.filter(field => !fields[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate description length
    if (fields.descriptionShort.length < 50) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: 'Short description must be at least 50 characters'
        },
        { status: 400 }
      );
    }

    // Validate quantity
    const quantity = Number(fields.quantity);
    if (isNaN(quantity) || quantity < 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: 'Quantity must be a positive number'
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['food', 'powder', 'paste', 'accessories'];
    if (!validCategories.includes(fields.category)) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: 'Invalid category selected'
        },
        { status: 400 }
      );
    }

    // Validate food type for food/powder categories
    if ((fields.category === 'food' || fields.category === 'powder') && !fields.foodType) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: 'Food type is required for food and powder categories'
        },
        { status: 400 }
      );
    }

    const productData: any = {
      userId: session.user.id,
      companyId: company._id,
      name: fields.name,
      descriptionShort: fields.descriptionShort,
      descriptionLong: fields.descriptionLong || '',
      quantity: quantity,
      category: fields.category,
      subCategory: fields.subCategory,
      foodType: fields.foodType || null,
    };

    // Add images
    if (files.productImage) {
      productData.productImage = `data:${files.productImage.mimetype};base64,${files.productImage.data}`;
    }
    if (files.badges) {
      productData.badges = `data:${files.badges.mimetype};base64,${files.badges.data}`;
    }

    const product = await Product.create(productData);

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Product creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errorMessages.join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Server error',
        details: error.message || 'Something went wrong while creating product'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const products = await Product.find({ userId: session.user.id });

    return NextResponse.json({ 
      success: true,
      products 
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: 'Failed to fetch products'
      },
      { status: 500 }
    );
  }
}