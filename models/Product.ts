import mongoose, { Schema, models, Document } from 'mongoose';
import './Company'; 

// Variant interface
export interface IVariant {
  variantType: 'weight' | 'volume' | 'size' | 'piece' | 'pack' | 'custom';
  variantUnit?: string; // For custom types (e.g., "meters", "boxes")
  variantValue: string; // e.g., "1", "500", "XL"
  displayValue: string; // e.g., "1 KG", "500 ML", "XL Size"
  quantity: number;
  price: number;
  offerPrice: number;
}

export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  productImages: string[];
  badges?: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;
  
  // Default values (kept for backward compatibility and non-variant products)
  quantity: number;
  price: number;
  offerPrice: number;
  
  // New variant fields
  hasVariants: boolean;
  variants?: IVariant[];
  
  category: string;
  subCategory: string;
  foodType?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  variantType: {
    type: String,
    required: true,
    enum: ['weight', 'volume', 'size', 'piece', 'pack', 'custom'],
  },
  variantUnit: {
    type: String,
    // Custom unit label (e.g., "meters", "boxes") - only used when variantType is 'custom'
  },
  variantValue: {
    type: String,
    required: true,
  },
  displayValue: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  offerPrice: {
    type: Number,
    required: true,
    min: [0, 'Offer price cannot be negative'],
  },
}, { _id: true });

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
    productImages: {
      type: [String],
      required: [true, 'At least 2 product images are required'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length >= 2;
        },
        message: 'At least 2 product images are required'
      }
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
    // Default fields for products without variants
    quantity: {
      type: Number,
      required: function(this: IProduct) {
        return !this.hasVariants;
      },
      min: [0, 'Quantity cannot be negative'],
    },
    price: {
      type: Number,
      required: function(this: IProduct) {
        return !this.hasVariants;
      },
      min: [0, 'Price cannot be negative'],
    },
    offerPrice: {
      type: Number,
      required: function(this: IProduct) {
        return !this.hasVariants;
      },
      min: [0, 'Offer price cannot be negative'],
    },
    // Variant fields
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: {
      type: [VariantSchema],
      validate: {
        validator: function(this: IProduct, v: IVariant[]) {
          if (this.hasVariants) {
            return v && v.length > 0;
          }
          return true;
        },
        message: 'At least one variant is required when hasVariants is true'
      }
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

// Clear any existing model to avoid caching issues
if (models.Product) {
  delete models.Product;
}

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;