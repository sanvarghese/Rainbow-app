// import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import HomePage from './HomePage';
import { auth } from '../../auth';

export default async function Page() {
  const session = await auth();

  // If user is not logged in, redirect to login
  if (!session?.user) {
    redirect('/auth/login');
  }

  // If user is a Merchant, redirect to dashboard
  if (session.user.role === 'Merchant') {
    redirect('/dashboard');
  }

  // Normal users can access home page
  return <HomePage />;
}