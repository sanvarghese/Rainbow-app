// Example: /app/api/user/addresses/route.ts (Simplified version using helper)

import { NextRequest, NextResponse } from 'next/server';
import DeliveryAddress from '../../../../../models/DeliveryAddress';
import connectDB from '../../../../../lib/mongodb';
import { auth } from '../../../../../auth';
// import { requireAuth } from '@/lib/auth';
// import connectDB from '@/lib/mongodb';
// import DeliveryAddress from '@/models/DeliveryAddress';

// GET - Fetch all addresses for logged-in user
export async function GET(req: NextRequest) {
    try {
        // This will throw error if not authenticated
        const session = await auth();

        console.log(session, 'session')

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(session, 'session.!')
        await connectDB();

        const addresses = await DeliveryAddress.find({ userId: session.user.id })
            .sort({ isDefault: -1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            addresses
        });


    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Error fetching addresses:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new address
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(session, 'session.!')


        const body = await req.json();
        const {
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault,
            addressType
        } = body;

        // Validation
        if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !postalCode || !country) {
            return NextResponse.json(
                { success: false, message: 'All required fields must be filled' },
                { status: 400 }
            );
        }

        await connectDB();

        // If this is set as default, unset all other defaults
        if (isDefault) {
            await DeliveryAddress.updateMany(
                { userId: session.user.id },
                { isDefault: false }
            );
        }

        const newAddress = new DeliveryAddress({
            userId: session.user.id,
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2: addressLine2 || '',
            city,
            state,
            postalCode,
            country,
            isDefault: isDefault || false,
            addressType: addressType || 'home'
        });

        await newAddress.save();

        return NextResponse.json({
            success: true,
            message: 'Address added successfully',
            address: newAddress
        }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Error creating address:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}