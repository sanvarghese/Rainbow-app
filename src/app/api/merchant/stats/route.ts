import { NextRequest, NextResponse } from 'next/server';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { auth } from '../../../../../auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const userId = session.user.id;
        const merchantObjectId = new mongoose.Types.ObjectId(userId);

        // 1. Total Products (Approved)
        const totalProducts = await Product.countDocuments({
            userId: merchantObjectId,
            status: 'approved'
        });

        // 2. Get all product IDs belonging to this merchant
        const merchantProducts = await Product.find(
            { userId: merchantObjectId },
            { _id: 1 }  // only fetch _id
        ).lean();

        const merchantProductIds = merchantProducts.map(p => p._id);

        // 3. Total Orders (orders containing at least one of merchant's products)
        const totalOrders = await Order.countDocuments({
            'items.productId': { $in: merchantProductIds }
        });

        // 4. Today Sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySalesResult = await Order.aggregate([
            {
                $match: {
                    'items.productId': { $in: merchantProductIds },
                    createdAt: { $gte: today },
                    status: { $in: ['completed', 'delivered'] }
                }
            },
            // Unwind items to calculate only this merchant's product amounts
            { $unwind: '$items' },
            {
                $match: {
                    'items.productId': { $in: merchantProductIds }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: {
                            $multiply: ['$items.offerPrice', '$items.quantity']
                        }
                    }
                }
            }
        ]);

        const todaySales = todaySalesResult[0]?.totalSales || 0;

        // 5. Low Stock Items (less than 10 quantity)
        const lowStock = await Product.countDocuments({
            userId: merchantObjectId,
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