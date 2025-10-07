import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@/auth';
// import connectDB from '@/lib/mongodb';
// import Company from '@/models/Company';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '../../../../../lib/mongodb';
import Company from '../../../../../models/Company';
import { auth } from '../../../../../auth';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse form data with files
async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const formData = await req.formData();
  const fields: any = {};
  const files: any = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Convert File to base64 for storage
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fields, files } = await parseForm(req);

    // Validate required fields
    const requiredFields = ['name', 'address', 'email', 'phoneNumber'];
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fields.email)) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation)
    if (fields.phoneNumber.length < 10) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Phone number must be at least 10 digits' },
        { status: 400 }
      );
    }

    // Prepare company data
    const companyData: any = {
      userId: session.user.id,
      name: fields.name,
      description: fields.description || '',
      address: fields.address,
      email: fields.email,
      phoneNumber: fields.phoneNumber,
      gstNumber: fields.gstNumber || '',
      instagramLink: fields.instagramLink || '',
      facebookLink: fields.facebookLink || '',
    };

    // Add images as base64 (in production, upload to cloud storage)
    if (files.companyLogo) {
      companyData.companyLogo = `data:${files.companyLogo.mimetype};base64,${files.companyLogo.data}`;
    }
    if (files.badges) {
      companyData.badges = `data:${files.badges.mimetype};base64,${files.badges.data}`;
    }
    if (files.banner) {
      companyData.banner = `data:${files.banner.mimetype};base64,${files.banner.data}`;
    }

    await connectDB();

    // Check if company already exists
    const existingCompany = await Company.findOne({ userId: session.user.id });
    
    if (existingCompany) {
      // Update existing company
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== undefined && companyData[key] !== '') {
          existingCompany[key] = companyData[key];
        }
      });
      await existingCompany.save();
      
      return NextResponse.json({
        success: true,
        message: 'Company profile updated successfully',
        company: existingCompany,
      });
    }

    // Create new company
    const company = await Company.create(companyData);

    return NextResponse.json(
      {
        success: true,
        message: 'Company profile created successfully',
        company,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Company creation error:', error);
    
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
        details: error.message || 'Something went wrong while creating company profile'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const company = await Company.findOne({ userId: session.user.id });

    return NextResponse.json({ 
      success: true,
      company 
    });
  } catch (error: any) {
    console.error('Fetch company error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: 'Failed to fetch company profile'
      },
      { status: 500 }
    );
  }
}