import mongoose, { Schema, models, Document } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number; // Original price
  offerPrice: number; // Discounted price (actual selling price)
  name: string;
  productImage?: string;
  companyId: mongoose.Types.ObjectId;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
  totalSavings: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  offerPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  name: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
});

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    totalSavings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
CartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  // Total amount based on offerPrice (actual price to pay)
  this.totalAmount = this.items.reduce(
    (total, item) => total + (item.offerPrice * item.quantity), 
    0
  );
  
  // Calculate total savings (difference between original price and offer price)
  this.totalSavings = this.items.reduce(
    (total, item) => total + ((item.price - item.offerPrice) * item.quantity), 
    0
  );
  
  next();
});

const Cart = models.Cart || mongoose.model<ICart>('Cart', CartSchema);
export default Cart;