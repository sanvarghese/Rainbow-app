"use-client"
import { redirect } from 'next/navigation';

import MerchantDashboard from './MerchantDashboard';
import MerchantDashboardView from '../components/MerchantDashboardView/MerchantDashboardView';
import NormalUserDashboard from './NormalUserDashboard';
import connectDB from '../../../lib/mongodb';
import Company from '../../../models/Company';
import Product from '../../../models/Product';
import { auth } from '../../../auth';
import MerchantDashboardWrapper from './MerchantDashboardWrapper';
import AdminDashboardView from '../admin/dashboard/page';

export default async function DashboardPage() {
  const session = await auth();

  console.log(session?.user,"session user..!")


  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/auth/login');
  }

  const { role, id: userId } = session.user;


  // Normal users should not access dashboard

  // if (session.user.role !== 'Merchant') {
  //   redirect('/');
  // }

  // Check merchant setup completion status
  await connectDB();
  
  const company = await Company.findOne({ userId: session.user.id });
  const products = await Product.find({ userId: session.user.id });
  
  const hasCompany = !!company;
  const hasProducts = products.length > 0;

  
  // === ADMIN ROUTE ===

  
  // If setup is complete (has company and products), show merchant dashboard
  if (hasCompany && hasProducts) {
    return <MerchantDashboardWrapper isComplete={true} />;
  }

  
  // Otherwise, show onboarding flow
  return <MerchantDashboard />;
}