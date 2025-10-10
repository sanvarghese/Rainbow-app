'use client';

import { useRouter } from 'next/navigation';
import MerchantDashboardView from '../components/MerchantDashboardView/MerchantDashboardView';

export default function MerchantPreviewPage() {
  const router = useRouter();

  const handleBackToPreview = () => {
    router.push('/dashboard');
  };

  return <MerchantDashboardView onBackToPreview={handleBackToPreview} isStandalone={false} />;
}