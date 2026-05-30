// app/api/merchant/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../../lib/mongodb';
import { auth } from '../../../../../../auth';
import Order from '../../../../../models/Order';
import { updateOrderStatusWithLog } from '../../../../../lib/orderStatusManager';

type Params = Promise<{ id: string }>;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }   // ← Fixed
) {
  try {
    const { id } = await params;   // ← Must be awaited here

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Please login to continue" },
        { status: 401 }
      );
    }

    await connectDB();
    
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
        await updateOrderStatusWithLog({
          orderId: id,
          newStatus: status,
          updatedBy: 'merchant',
          updatedById: session.user.id as any,
          note: note || `Order status changed to ${status}`,
          session: dbSession
        });
        
        // Also update delivery date if provided
        if (deliveryDate) {
          await Order.findByIdAndUpdate(id, updateData, { session: dbSession });
        }
      } else if (deliveryDate) {
        // Update delivery date only if no status change
        await Order.findByIdAndUpdate(id, updateData, { session: dbSession });
      }
      
      await dbSession.commitTransaction();
      dbSession.endSession();
      
      const finalOrder = await Order.findById(id)
        .populate('userId', 'name email');
      
      return NextResponse.json({ 
        success: true,
        order: finalOrder 
      });
      
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