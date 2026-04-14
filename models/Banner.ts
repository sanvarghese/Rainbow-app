// models/Banner.ts
import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true
  },
  image: {
    type: String, // This will store the file path
    required: true
  },
  imagePublicId: {
    type: String, // For cloud storage reference (if using cloudinary)
    required: false
  },
  link: {
    type: String,
    required: false,
    default: '/shop'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);