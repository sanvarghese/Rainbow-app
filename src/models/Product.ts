import mongoose, { Schema, models, Document } from "mongoose";
import "./Company";

// Product Image Interface
export interface IProductImage {
  url: string;
  publicId: string;
}

// Variant Interface
export interface IVariant {
  variantType: "weight" | "volume" | "size" | "piece" | "pack" | "custom";
  variantUnit?: string;
  variantValue: string;
  displayValue: string;
  quantity: number;
  price: number;
  offerPrice: number;
}

export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  productImages: IProductImage[]; // Changed to array of objects
  badges?: string;
  name: string;
  descriptionShort: string;
  descriptionLong?: string;

  quantity: number;
  price: number;
  offerPrice: number;

  hasVariants: boolean;
  variants?: IVariant[];

  category: string;
  subCategory: string;
  childSubCategory?: string;
  foodType?: string;
  status: "pending" | "approved" | "rejected" | "removed";
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>(
  {
    variantType: {
      type: String,
      required: true,
      enum: ["weight", "volume", "size", "piece", "pack", "custom"],
    },
    variantUnit: { type: String },
    variantValue: { type: String, required: true },
    displayValue: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const ProductSchema = new Schema<IProduct>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },

    productImages: {
      type: [{ url: String, publicId: String }],
      validate: {
        validator: (v: any[]) => v && v.length >= 2 && v.length <= 5,
        message: "At least 2 and maximum 5 product images are required",
      },
    },

    badges: { type: String },

    name: { type: String, required: true, trim: true },
    descriptionShort: {
      type: String,
      required: true,
      minlength: [50, "Short description must be at least 50 characters"],
    },
    descriptionLong: { type: String, default: "" },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    offerPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    hasVariants: { type: Boolean, default: false },
    variants: {
      type: [VariantSchema],
      default: [],
    },

    category: { type: String, required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    childSubCategory: { type: String, trim: true, default: null },
    foodType: { type: String, enum: ["veg", "non-veg", null], default: null },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "removed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Indexes
ProductSchema.index({ userId: 1, status: 1 });
ProductSchema.index({ companyId: 1 });
ProductSchema.index({ category: 1, subCategory: 1 });
ProductSchema.index({ createdAt: -1 });

if (models.Product) {
  delete models.Product;
}

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
