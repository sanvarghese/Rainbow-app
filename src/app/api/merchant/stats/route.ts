import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Product from '@/models/Product';
import Order from '@/models/Order'; // ← Make sure this model exists
import { auth } from '../../../../../auth';
import connectDB from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

        const userId = session.user.id;

        // 1. Total Products (Approved)
        const totalProducts = await Product.countDocuments({
            userId,
            status: 'approved'
        });

        // 2. Total Orders
        const totalOrders = await Order.countDocuments({ merchantId: userId });

        // 3. Today Sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySalesResult = await Order.aggregate([
            {
                $match: {
                    merchantId: userId,
                    createdAt: { $gte: today },
                    status: { $in: ['completed', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' }
                }
            }
        ]);

        const todaySales = todaySalesResult[0]?.totalSales || 0;

        // 4. Low Stock Items (less than 10 quantity)
        const lowStock = await Product.countDocuments({
            userId,
            status: 'approved',
            $or: [
                { hasVariants: false, quantity: { $lt: 10 } },
                { hasVariants: true, 'variants.quantity': { $lt: 10 } }
            ]
        });

        return NextResponse.json({
            totalProducts,
            totalOrders,
            todaySales,
            lowStockItems: lowStock,
            success: true
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}