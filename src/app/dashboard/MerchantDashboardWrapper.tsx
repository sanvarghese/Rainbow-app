'use client';

import { useRouter } from 'next/navigation';
import MerchantDashboardView from '../components/MerchantDashboardView/MerchantDashboardView';

interface MerchantDashboardWrapperProps {
  isComplete: boolean;
}

export default function MerchantDashboardWrapper({ isComplete }: MerchantDashboardWrapperProps) {
  const router = useRouter();

  const handleBackToPreview = () => {
    // This won't be used in standalone mode but needed for the component
    router.push('/dashboard');
  };

  return (
    <MerchantDashboardView 
      onBackToPreview={handleBackToPreview} 
      isStandalone={true} 
    />
  );
}