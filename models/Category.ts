// models/Category.ts
import mongoose, { Schema, models, Document } from 'mongoose';

export interface ISubCategory {
  name: string;
  image?: string;
}

export interface ICategory extends Document {
  name: string;
  image?: string;
  hasSubCategories: boolean;
  subCategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
    },
    image: {
      type: String,
    },
    hasSubCategories: {
      type: Boolean,
      default: false,
    },
    subCategories: [SubCategorySchema],
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;