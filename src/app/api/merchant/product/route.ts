import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import connectDB from '../../../../../lib/mongodb';
import Company from '../../../../../models/Company';
import Product from '../../../../../models/Product';

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

    // Debug logging
    console.log('Form fields received:', fields);
    console.log('Product ID:', fields.productId);

    // Check if this is an update (productId present)
    const isUpdate = !!fields.productId;

    // Validate required fields
    const requiredFields = ['name', 'descriptionShort', 'quantity', 'price', 'offerPrice', 'category', 'subCategory'];
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
      name: fields.name,
      descriptionShort: fields.descriptionShort,
      descriptionLong: fields.descriptionLong || '',
      quantity: quantity,
      category: fields.category,
      subCategory: fields.subCategory,
      foodType: fields.foodType || null,
    };

    // Add images only if new files are uploaded
    if (files.productImage) {
      productData.productImage = `data:${files.productImage.mimetype};base64,${files.productImage.data}`;
    }
    if (files.badges) {
      productData.badges = `data:${files.badges.mimetype};base64,${files.badges.data}`;
    }

    if (isUpdate) {
      // UPDATE existing product
      const product = await Product.findOne({ 
        _id: fields.productId, 
        userId: session.user.id 
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // Update fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null) {
          product[key] = productData[key];
        }
      });

      await product.save();

      return NextResponse.json(
        {
          success: true,
          message: 'Product updated successfully',
          product,
        },
        { status: 200 }
      );
    } else {
      // CREATE new product
      productData.userId = session.user.id;
      productData.companyId = company._id;

      const product = await Product.create(productData);

      return NextResponse.json(
        {
          success: true,
          message: 'Product created successfully',
          product,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Product operation error:', error);
    
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
        details: error.message || 'Something went wrong'
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find product and verify ownership
    const product = await Product.findOne({
      _id: productId,
      userId: session.user.id
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // TODO: Check if product is in any active orders
    // const hasActiveOrders = await Order.findOne({ productId: productId, status: { $in: ['pending', 'processing'] } });
    // if (hasActiveOrders) {
    //   return NextResponse.json({
    //     error: 'Cannot delete product',
    //     details: 'This product is part of active orders'
    //   }, { status: 400 });
    // }

    await Product.deleteOne({ _id: productId });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: 'Failed to delete product'
      },
      { status: 500 }
    );
  }
}