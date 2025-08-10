
'use client';

import { useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const { t } = useLanguage();

  const desktopImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754780415/ss_aj7w6f.png';
  const mobileImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754781321/2_ikufug.png';

  const textShadowStyle = { textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' };

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-end overflow-hidden">
      {/* Background images */}
      <div
        className="absolute inset-0 z-0 hidden md:block bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${desktopImageUrl}')` }}
      ></div>
      <div
        className="absolute inset-0 z-0 md:hidden bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${mobileImageUrl}')`,
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="container mx-auto flex items-center justify-end h-full relative z-10 p-4">
        {/* Content Container */}
        <div className="w-full max-w-[220px] md:max-w-md rounded-2xl">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 md:gap-6">
            
            {/* Call to Action Block */}
            <div className="flex flex-col items-center gap-2 w-full">
              <p className="text-sm md:text-lg text-white font-semibold" style={textShadowStyle}>
                Ready to explore?
              </p>
              <div className="flex flex-col gap-2 w-full md:flex-row md:gap-4">
                <Button
                  asChild
                  size="sm"
                  className="flex-1 text-xs px-3 py-2 md:px-8 md:py-6 md:text-lg font-semibold bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                >
                  <Link href="/dishes" className="flex items-center justify-center gap-1 md:gap-2">
                    Explore Dishes
                    <ArrowRight className="w-3 h-3 md:w-5 md:h-5" />
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs px-3 py-2 md:px-8 md:py-6 md:text-lg font-semibold border-white/50 text-white hover:bg-white/10 transition-transform hover:scale-105"
                >
                  <Link href="/sellers" className="flex items-center justify-center">
                    Meet Our Chefs
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Block */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mt-2 md:mt-4 pt-3 md:pt-6 border-t border-white/20 w-full">
              <div className="text-center">
                <div className="text-base md:text-3xl font-bold text-primary" style={textShadowStyle}>500+</div>
                <div className="text-[0.6rem] md:text-sm text-white/80" style={textShadowStyle}>Customers</div>
              </div>
              <div className="text-center">
                <div className="text-base md:text-3xl font-bold text-primary" style={textShadowStyle}>50+</div>
                <div className="text-[0.6rem] md:text-sm text-white/80" style={textShadowStyle}>Expert Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-base md:text-3xl font-bold text-primary" style={textShadowStyle}>1000+</div>
                <div className="text-[0.6rem] md:text-sm text-white/80" style={textShadowStyle}>Dishes Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
