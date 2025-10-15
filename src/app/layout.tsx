import type { Metadata } from 'next';
// import SessionProvider from '@/components/SessionProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import SessionProvider from '../../components/SessionProvider';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Your App Name',
  description: 'Your app description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SessionProvider>{children}</SessionProvider>
        </CartProvider>

      </body>
    </html>
  );
}