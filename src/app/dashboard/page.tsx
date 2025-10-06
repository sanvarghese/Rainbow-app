// import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@mui/material';
import { auth, signOut } from '../../../auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mt-5">
      <h1>Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
      
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/auth/login' });
        }}
      >
        <Button type="submit" variant="contained" color="secondary">
          Sign Out
        </Button>
      </form>
    </div>
  );
}