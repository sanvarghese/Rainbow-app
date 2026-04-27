// models/Review.ts
import mongoose, { Schema, models, Document } from 'mongoose';

export interface IReviewImage {
  url: string;
  publicId: string;
}

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  review: string;
  name: string;
  images: IReviewImage[];
  verified: boolean;
  helpful: number;
  helpfulUsers: mongoose.Types.ObjectId[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewImageSchema = new Schema<IReviewImage>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
});

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    review: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [ReviewImageSchema],
      default: [],
      validate: {
        validator: function(v: IReviewImage[]) {
          return v.length <= 5;
        },
        message: 'Maximum 5 images allowed',
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ userId: 1, productId: 1 });
ReviewSchema.index({ createdAt: -1 });

// Check if user has already reviewed this product from this order
ReviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

const Review = models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;