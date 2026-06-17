import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { verifyAdminToken } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';

const VALID_STATUSES = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const admin = await verifyAdminToken();

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { orderId } = await params;

        // const { orderId } = params;
        const body = await req.json();
        const { status, note } = body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status value' },
                { status: 400 }
            );
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        order.status = status;
        order.statusLogs.push({
            status,
            timestamp: new Date(),
            note: note || `Status updated to ${status} by admin`,
            updatedBy: 'system', // or 'merchant' if you want a distinct admin-attributed value — see note below
            //   updatedById: session.user.id,
        });

        await order.save();

        return NextResponse.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update order status' },
            { status: 500 }
        );
    }
}