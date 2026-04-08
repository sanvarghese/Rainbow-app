import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import connectDB from '../../../../../lib/mongodb';
import Company from '../../../../../models/Company';
import Category from '../../../../../models/Category'; // Import Category model
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
    productImages: []
  };

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
      
      if (key === 'productImages') {
        files.productImages.push(fileData);
      } else {
        files[key] = fileData;
      }
    } else {
      fields[key] = value;
    }
  }

  return { fields, files };
}

// Helper function to validate category hierarchy
async function validateCategoryHierarchy(categoryName: string, subCategoryName: string, childSubCategoryName?: string): Promise<{ valid: boolean; error?: string }> {
  // Find the category in the database
  const category = await Category.findOne({ name: categoryName });
  
  if (!category) {
    return { valid: false, error: `Category "${categoryName}" does not exist` };
  }

  // If no subcategory is required and none provided
  if (!subCategoryName) {
    if (category.hasSubCategories) {
      return { valid: false, error: `Category "${categoryName}" requires a subcategory` };
    }
    return { valid: true };
  }

  // Find the subcategory
  const subCategory = category.subCategories.find((sub: any) => sub.name === subCategoryName);
  
  if (!subCategory) {
    return { valid: false, error: `Subcategory "${subCategoryName}" does not exist in category "${categoryName}"` };
  }

  // If child subcategory is provided or required
  if (childSubCategoryName) {
    if (!subCategory.hasChildSubCategories) {
      return { valid: false, error: `Subcategory "${subCategoryName}" does not have child subcategories` };
    }
    
    const childSubCategory = subCategory.childSubCategories.find((child: any) => child.name === childSubCategoryName);
    
    if (!childSubCategory) {
      return { valid: false, error: `Child subcategory "${childSubCategoryName}" does not exist in subcategory "${subCategoryName}"` };
    }
  } else if (subCategory.hasChildSubCategories) {
    return { valid: false, error: `Subcategory "${subCategoryName}" requires a child subcategory` };
  }

  return { valid: true };
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
    console.log('Has variants:', fields.hasVariants);
    console.log('Variants data:', fields.variants);
    console.log('Category:', fields.category);
    console.log('SubCategory:', fields.subCategory);
    console.log('ChildSubCategory:', fields.childSubCategory);

    const isUpdate = !!fields.productId;

    // Validate required fields
    const requiredFields = ['name', 'descriptionShort', 'category', 'subCategory'];
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

    // Validate category hierarchy dynamically
    const categoryValidation = await validateCategoryHierarchy(
      fields.category,
      fields.subCategory,
      fields.childSubCategory
    );

    if (!categoryValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: categoryValidation.error
        },
        { status: 400 }
      );
    }

    // Parse hasVariants
    const hasVariants = fields.hasVariants === 'true';

    // Validate based on hasVariants
    if (hasVariants) {
      // Validate variants
      if (!fields.variants) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: 'Variants data is required when hasVariants is enabled'
          },
          { status: 400 }
        );
      }

      let variants;
      try {
        variants = JSON.parse(fields.variants);
      } catch (e) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: 'Invalid variants data format'
          },
          { status: 400 }
        );
      }

      if (!Array.isArray(variants) || variants.length === 0) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: 'At least one variant is required'
          },
          { status: 400 }
        );
      }

      // Validate each variant
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.variantType) {
          return NextResponse.json(
            { error: 'Validation failed', details: `Variant ${i + 1}: Type is required` },
            { status: 400 }
          );
        }
        if (!v.variantValue) {
          return NextResponse.json(
            { error: 'Validation failed', details: `Variant ${i + 1}: Value is required` },
            { status: 400 }
          );
        }
        if (!v.displayValue) {
          return NextResponse.json(
            { error: 'Validation failed', details: `Variant ${i + 1}: Display value is required` },
            { status: 400 }
          );
        }
        if (v.variantType === 'custom' && !v.variantUnit) {
          return NextResponse.json(
            { error: 'Validation failed', details: `Variant ${i + 1}: Custom unit is required` },
            { status: 400 }
          );
        }
        if (typeof v.quantity !== 'number' || v.quantity < 0) {
          return NextResponse.json(
            { error: 'Validation failed', details: `Variant ${i + 1}: Valid quantity is required` },
            { status: 400 }
          );
        }
        if (typeof v.price !== 'number' || v.price < 0) {
          return NextResponse.json(
            { error: 'Validation failed', details: `Variant ${i + 1}: Valid price is required` },
            { status: 400 }
          );
        }
        if (typeof v.offerPrice !== 'number' || v.offerPrice < 0) {
          return NextResponse.json(
            { error: 'Validation failed', details: `Variant ${i + 1}: Valid offer price is required` },
            { status: 400 }
          );
        }
      }
    } else {
      // Validate standard fields when not using variants
      if (!fields.quantity) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Quantity is required' },
          { status: 400 }
        );
      }
      if (!fields.price) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Price is required' },
          { status: 400 }
        );
      }
      if (!fields.offerPrice) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Offer price is required' },
          { status: 400 }
        );
      }

      const quantity = Number(fields.quantity);
      const price = Number(fields.price);
      const offerPrice = Number(fields.offerPrice);

      if (isNaN(quantity) || quantity < 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Quantity must be a positive number' },
          { status: 400 }
        );
      }
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Price must be a positive number' },
          { status: 400 }
        );
      }
      if (isNaN(offerPrice) || offerPrice < 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Offer price must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Note: The hardcoded category validation has been REMOVED
    // Categories are now validated dynamically through validateCategoryHierarchy

    // Validate food type for food/powder categories
    // You can determine food/powder categories based on your category names
    const categoryDoc = await Category.findOne({ name: fields.category });
    const isFoodOrPowderCategory = ['food', 'powder'].includes(fields.category.toLowerCase());
    
    if (isFoodOrPowderCategory && !fields.foodType) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Food type is required for food and powder categories' },
        { status: 400 }
      );
    }

    const productData: any = {
      name: fields.name,
      descriptionShort: fields.descriptionShort,
      descriptionLong: fields.descriptionLong || '',
      category: fields.category,
      subCategory: fields.subCategory,
      foodType: fields.foodType || null,
      hasVariants: hasVariants,
    };

    // Add child subcategory if provided
    if (fields.childSubCategory) {
      productData.childSubCategory = fields.childSubCategory;
    }

    // Add variant or standard data
    if (hasVariants) {
      productData.variants = JSON.parse(fields.variants);
      // Set default values for required fields (they won't be used)
      productData.quantity = 0;
      productData.price = 0;
      productData.offerPrice = 0;
    } else {
      productData.quantity = Number(fields.quantity);
      productData.price = Number(fields.price);
      productData.offerPrice = Number(fields.offerPrice);
      productData.variants = [];
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

      // Handle product images
      let existingImages: string[] = [];
      
      if (fields.existingImages) {
        try {
          existingImages = JSON.parse(fields.existingImages);
        } catch (e) {
          console.error('Error parsing existing images:', e);
        }
      }

      const newImages = files.productImages?.map((file: any) => 
        `data:${file.mimetype};base64,${file.data}`
      ) || [];

      const allImages = [...existingImages, ...newImages];

      if (allImages.length < 2) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: `At least 2 product images are required. Current: ${allImages.length}`
          },
          { status: 400 }
        );
      }

      if (allImages.length > 5) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Maximum 5 product images allowed' },
          { status: 400 }
        );
      }

      productData.productImages = allImages;

      // Update fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null) {
          product[key] = productData[key];
        }
      });

      // Handle badges
      if (files.badges) {
        product.badges = `data:${files.badges.mimetype};base64,${files.badges.data}`;
      }

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
      
      if (!files.productImages || files.productImages.length < 2) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'At least 2 product images are required' },
          { status: 400 }
        );
      }

      if (files.productImages.length > 5) {
        return NextResponse.json(
          { error: 'Validation failed', details: 'Maximum 5 product images allowed' },
          { status: 400 }
        );
      }

      productData.productImages = files.productImages.map((file: any) => 
        `data:${file.mimetype};base64,${file.data}`
      );

      if (files.badges) {
        productData.badges = `data:${files.badges.mimetype};base64,${files.badges.data}`;
      }

      productData.userId = session.user.id;
      productData.companyId = company._id;
      productData.status = 'pending'; // Products start as pending for admin approval

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
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error', details: error.message || 'Something went wrong' },
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

    const products = await Product.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true,
      products 
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: 'Server error', details: 'Failed to fetch products' },
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
      { error: 'Server error', details: 'Failed to delete product' },
      { status: 500 }
    );
  }
}