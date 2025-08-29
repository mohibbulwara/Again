'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import BottomNavbar from '@/components/layout/bottom-navbar';
import { useFcmToken } from '@/hooks/use-fcm-token';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useFcmToken();
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow pb-20 md:pb-0">{children}</main>
        <Footer />
      </div>
      <Toaster />
      <BottomNavbar />
    </>
  );
}