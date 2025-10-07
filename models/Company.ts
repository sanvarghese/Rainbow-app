import mongoose, { Schema, models, Document } from 'mongoose';

export interface ICompany extends Document {
  userId: mongoose.Types.ObjectId;
  companyLogo?: string;
  badges?: string;
  banner?: string;
  name: string;
  description?: string;
  address: string;
  email: string;
  phoneNumber: string;
  gstNumber?: string;
  instagramLink?: string;
  facebookLink?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyLogo: {
      type: String,
    },
    badges: {
      type: String,
    },
    banner: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
    },
    description: {
      type: String,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    gstNumber: {
      type: String,
    },
    instagramLink: {
      type: String,
    },
    facebookLink: {
      type: String,
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

const Company = models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;