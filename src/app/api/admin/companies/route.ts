import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '../../../../lib/mongodb';
import { verifyAdminToken } from '../../../../lib/adminAuth';
import Company from '../../../../models/Company';

// POST - Admin create or update company
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
    const companyId = formData.get('companyId') as string | null;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const address = formData.get('address') as string;
    const description = formData.get('description') as string;
    const gstNumber = formData.get('gstNumber') as string;
    const facebookLink = formData.get('facebookLink') as string;
    const instagramLink = formData.get('instagramLink') as string;
    
    const existingCompanyLogo = formData.get('existingCompanyLogo') as string | null;
    const existingBadges = formData.get('existingBadges') as string | null;
    const existingBanner = formData.get('existingBanner') as string | null;

    // Validate required fields
    if (!name || !email || !phoneNumber || !address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Process company logo
    let companyLogoUrl = existingCompanyLogo || '';
    const companyLogoFile = formData.get('companyLogo') as File | null;
    
    if (companyLogoFile && companyLogoFile.size > 0) {
      const bytes = await companyLogoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'companies', 'logos');
      await mkdir(uploadsDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = companyLogoFile.name.split('.').pop();
      const filename = `logo-${uniqueSuffix}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      companyLogoUrl = `/uploads/companies/logos/${filename}`;
    }

    // Process badges
    let badgesUrl = existingBadges || '';
    const badgesFile = formData.get('badges') as File | null;
    
    if (badgesFile && badgesFile.size > 0) {
      const bytes = await badgesFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'companies', 'badges');
      await mkdir(uploadsDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = badgesFile.name.split('.').pop();
      const filename = `badge-${uniqueSuffix}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      badgesUrl = `/uploads/companies/badges/${filename}`;
    }

    // Process banner
    let bannerUrl = existingBanner || '';
    const bannerFile = formData.get('banner') as File | null;
    
    if (bannerFile && bannerFile.size > 0) {
      const bytes = await bannerFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'companies', 'banners');
      await mkdir(uploadsDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = bannerFile.name.split('.').pop();
      const filename = `banner-${uniqueSuffix}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      bannerUrl = `/uploads/companies/banners/${filename}`;
    }

    const companyData = {
      name,
      email,
      phoneNumber,
      address,
      description: description || '',
      gstNumber: gstNumber || '',
      facebookLink: facebookLink || '',
      instagramLink: instagramLink || '',
      ...(companyLogoUrl && { companyLogo: companyLogoUrl }),
      ...(badgesUrl && { badges: badgesUrl }),
      ...(bannerUrl && { banner: bannerUrl }),
      userId: admin.id,
    };

    let company;
    let message;

    if (companyId) {
      company = await Company.findByIdAndUpdate(
        companyId,
        companyData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email');

      if (!company) {
        return NextResponse.json(
          { success: false, error: 'Company not found' },
          { status: 404 }
        );
      }

      message = 'Company updated successfully';
    } else {
      company = await Company.create(companyData);
      company = await Company.findById(company._id)
        .populate('userId', 'name email');

      message = 'Company created successfully';
    }

    return NextResponse.json({
      success: true,
      message,
      company,
    });

  } catch (error: any) {
    console.error('Company operation error:', error);
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

// GET - Fetch companies with filter
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    let query: any = {};

    if (statusParam === 'approved') query = { status: 'approved' };
    else if (statusParam === 'rejected') query = { status: 'rejected' };
    else if (statusParam === 'removed') query = { status: 'removed' };
    else if (statusParam === 'pending') query = { status: 'pending' };
    else if (statusParam === 'all') query = {};
    else query = { status: 'pending' }; // default

    const companies = await Company.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, companies });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}