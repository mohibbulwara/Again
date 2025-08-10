
'use client';

import { useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const { t } = useLanguage();

  const desktopImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754780415/ss_aj7w6f.png';
  const mobileImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754781321/2_ikufug.png';

  return (
    <section className="relative w-full min-h-[85vh] flex items-start md:items-center justify-center md:justify-end overflow-hidden">
      {/* Background image for desktop (hidden on mobile) */}
      <div
        className="absolute inset-0 z-0 hidden md:block bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${desktopImageUrl}')` }}
      ></div>

      {/* Background image for mobile (hidden on desktop) */}
      <div
        className="absolute inset-0 z-0 md:hidden bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${mobileImageUrl}')`,
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Dark overlay for desktop only */}
      <div className="absolute inset-0 bg-black/30 z-0 hidden md:block"></div>

      <div className="container mx-auto flex items-start md:items-center justify-center md:justify-end h-full relative z-10 p-4">
        {/* Container for the content */}
        <div className="md:bg-black/30 md:border md:border-white/10 rounded-2xl p-4 md:p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <p className="text-xs md:text-lg text-white font-semibold" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>Ready to explore?</p>
            
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Button
                asChild
                size="sm"
                className="flex-1 px-4 py-2 text-xs md:px-8 md:py-6 md:text-lg font-semibold bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
              >
                <Link href="/dishes" className="flex items-center justify-center gap-2">
                  Explore Dishes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="sm"
                // Hidden on screens smaller than md, flex-1 on md and above
                className="max-md:hidden md:flex-1 px-4 py-2 text-xs md:px-8 md:py-6 md:text-lg font-semibold border-white/50 text-white hover:bg-white/10 transition-transform hover:scale-105"
              >
                <Link href="/sellers">
                  Meet Our Chefs
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/20 w-full">
              <div className="text-center">
                <div className="text-sm md:text-3xl font-bold text-primary">500+</div>
                <div className="text-xs text-white/80">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-sm md:text-3xl font-bold text-primary">50+</div>
                <div className="text-xs text-white/80">Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-sm md:text-3xl font-bold text-primary">1000+</div>
                <div className="text-xs text-white/80">Dishes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
