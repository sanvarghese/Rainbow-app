import mongoose, { Schema, models, Document } from 'mongoose';
import './Company'; 

export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  productImage?: string;
  badges?: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;
  quantity: number;
  price: number;
  offerPrice: number;
  category: string;
  subCategory: string;
  foodType?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    productImage: {
      type: String,
    },
    badges: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    descriptionShort: {
      type: String,
      required: [true, 'Short description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
    },
    descriptionLong: {
      type: String,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    offerPrice:{
       type: Number,
      required: [true, 'Offer price is required'],
      min: [0, 'Offer price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['food', 'powder', 'paste', 'accessories'],
    },
    subCategory: {
      type: String,
      required: [true, 'Subcategory is required'],
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg', null],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;