import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import { auth } from '../../../../../auth';
import Company from '../../../../../models/Company';
import Product from '../../../../../models/Product';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const company = await Company.findOne({ userId: session.user.id });
    const products = await Product.find({ userId: session.user.id });

    const status = {
      hasCompany: !!company,
      hasProducts: products.length > 0,
      completedSteps: {
        step1: true, // User registration complete
        step2: !!company,
        step3: products.length > 0,
      },
      nextStep: !company ? 2 : products.length === 0 ? 3 : 'complete',
      company,
      products,
    };

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}