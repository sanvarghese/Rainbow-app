// models/Order.ts
import mongoose, { Schema, models, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  subtitle: string;
  quantity: number;
  price: number;
  offerPrice: number;
  image: string;
  variantDisplayValue?: string; 
  variantId?: string; 

}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  address: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: IOrderItem[];
  paymentMethod: string;
  orderSummary: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryDate: Date; // Added delivery date field
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
    },
    address: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        subtitle: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        offerPrice: { type: Number, required: true },
        image: { type: String, required: true },
        variantDisplayValue: { type: String }, // Add this field
        variantId: { type: String }, // Optional: store variant ID
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
    },
    orderSummary: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    deliveryDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 14); // Default 14 days from now
        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Generate order ID before saving
OrderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD${year}${month}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Order = models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;