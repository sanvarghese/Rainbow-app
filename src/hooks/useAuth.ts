'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseAuthOptions {
  requiredRole?: 'Merchant' | 'Normal';
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Not authenticated
    if (!session) {
      router.push(options.redirectTo || '/auth/login');
      return;
    }

    // Check role if required
    if (options.requiredRole && session.user.role !== options.requiredRole) {
      const redirectUrl = session.user.role === 'Merchant' ? '/dashboard' : '/';
      router.push(redirectUrl);
    }
  }, [session, status, router, options.requiredRole, options.redirectTo]);

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isMerchant: session?.user?.role === 'Merchant',
  };
}