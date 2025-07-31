'use client';

import { useEffect } from 'react';
import { initAllAnimations } from '@/lib/scroll-animations';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import BottomNavbar from '@/components/layout/bottom-navbar';
import ParticleBackground from '@/components/particle-background';
import FloatingActionButton from '@/components/floating-action-button';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = initAllAnimations();
    return cleanup;
  }, []);

  return (
    <>
      <ParticleBackground />
      <div className="flex min-h-screen flex-col relative z-10">
        <Header />
        <main className="flex-grow pb-20 md:pb-0">{children}</main>
        <Footer />
      </div>
      <Toaster />
      <BottomNavbar />
      <FloatingActionButton />
    </>
  );
}