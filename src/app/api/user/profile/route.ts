import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
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

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { name, email, mobile, gender } =
            await req.json();

        await connectDB();

        const user = await User.findById(
            session.user.id
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (
            email &&
            email.toLowerCase().trim() !==
            user.email.toLowerCase()
        ) {
            const existingUser =
                await User.findOne({
                    email: email.toLowerCase().trim()
                });

            if (existingUser) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Email already in use"
                    },
                    { status: 400 }
                );
            }

            user.email =
                email.toLowerCase().trim();
        }

        if (name !== undefined)
            user.name = name;

        if (mobile !== undefined)
            user.mobile = mobile;

        if (gender !== undefined)
            user.gender = gender;

        await user.save();

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            { status: 500 }
        );
    }
}