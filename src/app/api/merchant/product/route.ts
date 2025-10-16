import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import connectDB from '../../../../../lib/mongodb';
import Company from '../../../../../models/Company';
import mongoose from 'mongoose';

// Clear cached model to ensure we use the latest schema
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

import Product from '../../../../../models/Product';

async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const formData = await req.formData();
  const fields: any = {};
  const files: any = {
    productImages: [] // Initialize as array for multiple images
  };

  // Get all entries as array to properly handle multiple files with same key
  const entries = Array.from(formData.entries());
  
  for (const [key, value] of entries) {
    if (value instanceof File) {
      const bytes = await value.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileData = {
        data: buffer.toString('base64'),
        mimetype: value.type,
        name: value.name,
      };
      
      // Handle multiple product images
      if (key === 'productImages') {
        files.productImages.push(fileData);
      } else {
        files[key] = fileData;
      }
    } else {
      fields[key] = value;
    }
  }

  console.log('Parsed product images count:', files.productImages.length);
  console.log('Product images array:', files.productImages.map((f: any) => f.name));

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

    // Debug: Check if productImages field exists in schema
    console.log('Product schema paths:', Object.keys(Product.schema.paths));
    console.log('Has productImages field:', 'productImages' in Product.schema.paths);

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

    console.log('Form fields received:', fields);
    console.log('Files received - productImages count:', files.productImages?.length || 0);
    console.log('Product images details:', files.productImages?.map((img: any) => ({ 
      name: img.name, 
      type: img.mimetype,
      size: img.data?.length 
    })));
    console.log('Product ID:', fields.productId);

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

    // Validate price
    const price = Number(fields.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: 'Price must be a positive number'
        },
        { status: 400 }
      );
    }

    // Validate offer price
    const offerPrice = Number(fields.offerPrice);
    if (isNaN(offerPrice) || offerPrice < 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: 'Offer price must be a positive number'
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
      price: price,
      offerPrice: offerPrice,
      category: fields.category,
      subCategory: fields.subCategory,
      foodType: fields.foodType || null,
    };

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

      console.log('Current product images in DB:', product.productImages?.length || 0);

      // Handle product images for update
      let existingImages: string[] = [];
      
      // Parse existing images from form data if provided
      if (fields.existingImages) {
        try {
          existingImages = JSON.parse(fields.existingImages);
          console.log('Existing images from form:', existingImages.length);
        } catch (e) {
          console.error('Error parsing existing images:', e);
        }
      }

      // Add new images if uploaded
      const newImages = files.productImages?.map((file: any) => {
        const imageData = `data:${file.mimetype};base64,${file.data}`;
        console.log('Converting new image:', file.name, 'Size:', file.data.length);
        return imageData;
      }) || [];

      console.log('New images count:', newImages.length);
      console.log('New images preview:', newImages.map(img => img.substring(0, 50) + '...'));

      // Combine existing and new images
      const allImages = [...existingImages, ...newImages];
      console.log('Total images after merge:', allImages.length);

      // Validate minimum 2 images
      if (allImages.length < 2) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: `At least 2 product images are required. Current: ${allImages.length}`
          },
          { status: 400 }
        );
      }

      // Validate maximum 5 images
      if (allImages.length > 5) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: 'Maximum 5 product images allowed'
          },
          { status: 400 }
        );
      }

      productData.productImages = allImages;
      console.log('Final product images to save:', allImages.length);

      // Update other fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null) {
          product[key] = productData[key];
        }
      });

      // Handle badges separately
      if (files.badges) {
        product.badges = `data:${files.badges.mimetype};base64,${files.badges.data}`;
        console.log('Badge updated');
      }

      await product.save();
      console.log('Product saved successfully with images:', product.productImages?.length);

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
      
      // Validate product images for new product
      if (!files.productImages || files.productImages.length < 2) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: 'At least 2 product images are required'
          },
          { status: 400 }
        );
      }

      if (files.productImages.length > 5) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: 'Maximum 5 product images allowed'
          },
          { status: 400 }
        );
      }

      // Convert images to base64 data URIs
      productData.productImages = files.productImages.map((file: any) => 
        `data:${file.mimetype};base64,${file.data}`
      );

      // Add badges if provided
      if (files.badges) {
        productData.badges = `data:${files.badges.mimetype};base64,${files.badges.data}`;
      }

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