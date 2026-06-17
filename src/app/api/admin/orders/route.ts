import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import Order from '@/models/Order';
import '@/models/User'; // ensure User schema is registered for populate
import { verifyAdminToken } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const admin = await verifyAdminToken();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }



    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status'); // pending | confirmed | processing | shipped | delivered | cancelled
    const paymentStatus = searchParams.get('paymentStatus'); // pending | paid | failed
    const search = searchParams.get('search'); // orderId or customer name
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const query: Record<string, any> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'address.fullName': { $regex: search, $options: 'i' } },
        { 'address.phoneNumber': { $regex: search, $options: 'i' } },
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [orders, totalCount, statusCounts] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    statusCounts.forEach((s: any) => {
      counts[s._id] = s.count;
    });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
      statusCounts: counts,
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}