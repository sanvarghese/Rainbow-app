import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../../../lib/authOptions'; // adjust path as needed
// import connectDB from '../../../../lib/mongodb';
// import User from '../../../../models/User';

export async function POST(req: NextRequest) {
    try {
    const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { role: 'merchant', mobile: phoneNumber },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Account upgraded to merchant successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        }, { status: 200 });

    } catch (error: any) {
        console.error('Upgrade to merchant error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}