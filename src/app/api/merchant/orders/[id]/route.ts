// app/api/merchant/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../../lib/mongodb';
import { auth } from '../../../../../../auth';
import Order from '../../../../../models/Order';
import { updateOrderStatusWithLog } from '../../../../../lib/orderStatusManager';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

   if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Please login to continue" },
        { status: 401 },
      );
    }

    await connectDB();
    
    const { id } = params;
    const body = await req.json();
    const { status, deliveryDate, note } = body;
    
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    
    try {
      const updateData: any = {};
      if (deliveryDate) updateData.deliveryDate = new Date(deliveryDate);
      
      // If status is being updated, add to logs
      if (status) {
        const order = await Order.findById(id).session(dbSession);
        
        if (!order) {
          await dbSession.abortTransaction();
          dbSession.endSession();
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        // Validate status transition
        const validTransitions: Record<string, string[]> = {
          'pending': ['confirmed', 'cancelled'],
          'confirmed': ['processing', 'cancelled'],
          'processing': ['shipped', 'cancelled'],
          'shipped': ['delivered', 'cancelled'],
          'delivered': [],
          'cancelled': []
        };
        
        if (!validTransitions[order.status].includes(status)) {
          await dbSession.abortTransaction();
          dbSession.endSession();
          return NextResponse.json({ 
            error: `Invalid status transition from ${order.status} to ${status}` 
          }, { status: 400 });
        }
        
        // Update status with log
        const updatedOrder = await updateOrderStatusWithLog({
          orderId: id,
          newStatus: status,
          updatedBy: 'merchant',
          updatedById: session.user.id as any,
          note: note || `Order status changed to ${status}`,
          session: dbSession
        });
        
        updateData.status = status;
      }
      
      // Update delivery date if provided
      if (deliveryDate) {
        await Order.findByIdAndUpdate(id, updateData, { session: dbSession });
      } else if (status) {
        // Only status was updated, but we already updated via the function above
        // So we just need to get the final order
      } else {
        await Order.findByIdAndUpdate(id, updateData, { session: dbSession });
      }
      
      await dbSession.commitTransaction();
      dbSession.endSession();
      
      const finalOrder = await Order.findById(id)
        .populate('userId', 'name email');
      
      return NextResponse.json({ order: finalOrder });
      
    } catch (error) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}