import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import connectDB from '../../../../../lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'Merchant') {
      return NextResponse.json(
        { error: 'Only merchants can complete setup' },
        { status: 403 }
      );
    }

    await connectDB();

    // You can add any additional logic here
    // For example, update user status, send notification emails, etc.

    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully',
      redirect: '/dashboard'
    });
  } catch (error: any) {
    console.error('Complete setup error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: 'Failed to complete setup'
      },
      { status: 500 }
    );
  }
}