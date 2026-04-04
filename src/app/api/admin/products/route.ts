import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/adminAuth';
import Product from '../../../../../models/Product';
import connectDB from '../../../../../lib/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET - Fetch all products (admin view)
export async function GET(req: NextRequest) {
    try {
        const admin = await verifyAdminToken(req);

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        
        // Get filter from query params
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        
        let query = {};
        if (status === 'pending') {
            query = { status: 'inactive' };
        } else if (status === 'approved') {
            query = { status: 'approved' };
        } else if (status === 'rejected') {
            query = { status: 'rejected' };
        } else {
            // By default, show pending (inactive) products for approval
            query = { status: 'inactive' };
        }
        
        const products = await Product.find(query)
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
        const admin = await verifyAdminToken(req);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const { productId, action } = await req.json(); // action: 'approve' or 'reject'

        if (!productId || !action) {
            return NextResponse.json(
                { success: false, error: 'Product ID and action are required' },
                { status: 400 }
            );
        }

        let newStatus: 'approved' | 'rejected';
        let actionMessage: string;
        
        if (action === 'approve') {
            newStatus = 'approved';
            actionMessage = 'approved';
        } else if (action === 'reject') {
            newStatus = 'rejected';
            actionMessage = 'rejected';
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid action. Use "approve" or "reject"' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            { status: newStatus },
            { new: true }
        ).populate('companyId', 'name')
         .populate('userId', 'name email');

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Product ${actionMessage} successfully`,
            product,
        });
    } catch (error: any) {
        console.error('Product approval error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
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

