import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/adminAuth';
import Product from '../../../../../models/Product';
import connectDB from '../../../../../lib/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET - Fetch all products (admin view)
export async function GET() {
  try {
   const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const products = await Product.find({})
      .populate('companyId', 'name email companyLogo')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Admin create or update product
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await req.formData();
    
    // Extract form fields
    const productId = formData.get('productId') as string | null;
    const name = formData.get('name') as string;
    const descriptionShort = formData.get('descriptionShort') as string;
    const descriptionLong = formData.get('descriptionLong') as string;
    const quantity = formData.get('quantity') as string;
    const price = formData.get('price') as string;
    const offerPrice = formData.get('offerPrice') as string;
    const category = formData.get('category') as string;
    const subCategory = formData.get('subCategory') as string;
    const foodType = formData.get('foodType') as string | null;
    const existingImagesStr = formData.get('existingImages') as string | null;

    // Validate required fields
    if (!name || !descriptionShort || !quantity || !price || !offerPrice || !category || !subCategory) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate short description length
    if (descriptionShort.length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Short description must be at least 50 characters',
          details: `Current length: ${descriptionShort.length}` 
        },
        { status: 400 }
      );
    }

    // Process existing images (for updates)
    let existingImages: string[] = [];
    if (existingImagesStr) {
      try {
        existingImages = JSON.parse(existingImagesStr);
      } catch (e) {
        console.error('Error parsing existing images:', e);
      }
    }

    // Process new product images
    const productImages = formData.getAll('productImages') as File[];
    const newImageUrls: string[] = [];

    console.log('Processing product images:', productImages.length);

    if (productImages.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (e) {
        console.error('Error creating directory:', e);
      }

      // Process each image
      for (const file of productImages) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
          const ext = file.name.split('.').pop();
          const filename = `product-${uniqueSuffix}.${ext}`;
          const filepath = path.join(uploadsDir, filename);

          // Save file
          await writeFile(filepath, buffer);
          
          // Store relative URL
          newImageUrls.push(`/uploads/products/${filename}`);
          console.log('Saved image:', filename);
        }
      }
    }

    // Combine existing and new images
    const allProductImages = [...existingImages, ...newImageUrls];

    // Validate minimum 2 images
    if (allProductImages.length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: `At least 2 product images are required. Current count: ${allProductImages.length}`,
          details: 'Please upload more images'
        },
        { status: 400 }
      );
    }

    // Validate maximum 5 images
    if (allProductImages.length > 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Maximum 5 product images allowed',
          details: `Current count: ${allProductImages.length}`
        },
        { status: 400 }
      );
    }

    // Process badge image (optional)
    let badgeUrl = '';
    const badgeFile = formData.get('badges') as File | null;
    
    if (badgeFile && badgeFile.size > 0) {
      const bytes = await badgeFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'badges');
      await mkdir(uploadsDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = badgeFile.name.split('.').pop();
      const filename = `badge-${uniqueSuffix}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      badgeUrl = `/uploads/badges/${filename}`;
    }

    // Prepare product data
    const productData = {
      name,
      descriptionShort,
      descriptionLong: descriptionLong || '',
      quantity: Number(quantity),
      price: Number(price),
      offerPrice: Number(offerPrice),
      category,
      subCategory,
      foodType: foodType || null,
      productImages: allProductImages,
      ...(badgeUrl && { badges: badgeUrl }),
      // Note: You may want to add companyId and userId from admin session
      // companyId: admin.companyId,
      // userId: admin.userId,
    };

    let product;
    let message;

    if (productId) {
      // UPDATE existing product
      product = await Product.findByIdAndUpdate(
        productId,
        productData,
        { new: true, runValidators: true }
      ).populate('companyId', 'name email companyLogo');

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      message = 'Product updated successfully';
    } else {
      // CREATE new product
      product = await Product.create(productData);
      
      // Populate after creation
      product = await Product.findById(product._id)
        .populate('companyId', 'name email companyLogo');

      message = 'Product created successfully';
    }

    return NextResponse.json({
      success: true,
      message,
      product,
    });

  } catch (error: any) {
    console.error('Product operation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Configure to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// DELETE - Admin delete any product
export async function DELETE(req: NextRequest) {
  try {
       const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Admin can delete any product (no userId check)
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
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
        success: false,
        error: 'Server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

