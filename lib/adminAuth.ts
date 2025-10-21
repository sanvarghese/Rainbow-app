import { NextRequest } from 'next/server';
import { auth } from '../auth';

export async function verifyAdminToken(req?: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return null;
    }

    if (session.user.role !== 'admin') {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Admin token verification error:', error);
    return null;
  }
}

// Helper to check if user is admin (for client components)
export async function isAdmin() {
  try {
    const session = await auth();
    return session?.user?.role === 'admin';
  } catch (error) {
    return false;
  }
}