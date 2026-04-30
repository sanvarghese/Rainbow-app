// models/WeekendOffer.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWeekendOffer extends Document {
  title: string;
  images: string[];        // ← Changed to array of image URLs
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const WeekendOfferSchema = new Schema<IWeekendOffer>(
  {
    title: { type: String, required: true },
    images: [{ type: String, required: true }],   // Array of Cloudinary URLs
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.WeekendOffer || 
  mongoose.model<IWeekendOffer>('WeekendOffer', WeekendOfferSchema);