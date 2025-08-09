
'use client';

import { useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

export default function HeroSection() {
  const { t } = useLanguage();

  const desktopImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754780415/ss_aj7w6f.png';
  const mobileImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754781321/2_ikufug.png';

  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
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

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="container mx-auto grid grid-cols-1 items-center py-8 md:py-12 text-center relative z-10">
        <div className="relative">
          <div className="rounded-lg p-4 mx-auto max-w-4xl">
            <h1 className="font-headline text-3xl font-extrabold md:text-5xl bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text pb-2 inline-block">
              <UtensilsCrossed className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block mr-4 mb-2" />
              Aharian: Taste That Lingers, Memories That Last.
            </h1>
            
            <p className="mx-auto mt-4 max-w-[500px] text-white/80 md:text-lg leading-relaxed">
              Discover authentic local flavors, crafted with passion and delivered to your door. Your next favorite meal awaits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button
                asChild
                size="lg"
                className="px-6 py-5 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors duration-200"
              >
                <Link href="/dishes" className="flex items-center gap-2">
                  Explore Dishes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-6 py-5 text-base font-semibold border-white/50 text-white hover:bg-white/10 transition-colors duration-200"
              >
                <Link href="/sellers">
                  Meet Our Chefs
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">500+</div>
                <div className="text-xs text-white/70">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">50+</div>
                <div className="text-xs text-white/70">Expert Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">1000+</div>
                <div className="text-xs text-white/70">Dishes Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
