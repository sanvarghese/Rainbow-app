// lib/orderStatusManager.ts
// import Order from '@/models/Order';
import mongoose from 'mongoose';
import Order from '../models/Order';

interface StatusUpdateParams {
  orderId: string;
  newStatus: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  updatedBy: 'customer' | 'merchant' | 'system';
  updatedById?: mongoose.Types.ObjectId;
  note?: string;
  session?: mongoose.ClientSession;
}

export async function updateOrderStatusWithLog(params: StatusUpdateParams) {
  const { orderId, newStatus, updatedBy, updatedById, note, session } = params;

  const updateData: any = {
    status: newStatus,
    $push: {
      statusLogs: {
        status: newStatus,
        timestamp: new Date(),
        updatedBy,
        updatedById,
        note: note || `Order marked as ${newStatus}`,
      }
    }
  };

  const order = await Order.findByIdAndUpdate(
    orderId,
    updateData,
    { new: true, session }
  );

  return order;
}

export function getStatusDuration(statusLogs: any[], fromStatus: string, toStatus: string): number | null {
  const fromLog = statusLogs.find(log => log.status === fromStatus);
  const toLog = statusLogs.find(log => log.status === toStatus);
  
  if (fromLog && toLog) {
    return toLog.timestamp - fromLog.timestamp;
  }
  return null;
}

export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}