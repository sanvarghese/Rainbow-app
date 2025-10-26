import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
// import { getServerSession } from 'next-auth';
// import connectDB from '@/lib/mongodb'; // Adjust path as needed
// import User from '@/models/User'; // Adjust path as needed

// GET - Fetch user profile
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email }).select('-password -resetToken -resetTokenExpiry');

        console.log(user, 'userrr.!')

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                mobile: user.mobile,
                gender: user.gender,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, email, mobile, gender } = body;

        console.log(body, 'req from body..!')

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return NextResponse.json(
                    { success: false, message: 'Email already in use' },
                    { status: 400 }
                );
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (mobile !== undefined) user.mobile = mobile;
        if (gender !== undefined) user.gender = gender;


        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role,
                mobile: user.mobile,
                gender: user.gender
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    } 6
}