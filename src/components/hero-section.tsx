
'use client';

import { useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ArrowRight, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useLanguage();

  const desktopImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754780415/ss_aj7w6f.png';
  const mobileImageUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754857554/ddddd_rc5uvc.png';

  const textShadowStyle = { textShadow: '1px 1px 4px rgba(0, 0, 0, 0.7)' };

  return (
    <>
      {/* --- DESKTOP HERO SECTION --- */}
      <section className="relative w-full min-h-[85vh] hidden md:flex items-center justify-end overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${desktopImageUrl}')` }}
        ></div>
        <div className="absolute inset-0 bg-black/30 z-0"></div>
        
        {/* Professional Login Area - TOP LEFT */}
        <div className="absolute top-6 left-6 z-20 hidden md:block">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-white/80 hover:text-primary transition-colors font-semibold">
                Login as Buyer
              </Link>
              <div className="w-px h-4 bg-white/20"></div> {/* Vertical Separator */}
              <Link href="/login" className="text-sm text-white/80 hover:text-primary transition-colors font-semibold">
                Login as Seller
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto flex items-center justify-end h-full relative z-10 p-4">
          <div className="w-full max-w-md bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col items-start text-left gap-6">
              <p className="text-lg text-white font-semibold" style={textShadowStyle}>
                Ready to explore?
              </p>
              <div className="flex flex-row gap-4 w-full">
                <Button asChild size="lg" className="flex-1 text-lg font-semibold bg-primary hover:bg-primary/90 transition-transform hover:scale-105">
                  <Link href="/dishes" className="flex items-center justify-center gap-2">
                    Explore Dishes <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1 text-lg font-semibold border-white/50 text-white hover:bg-white/10 transition-transform hover:scale-105">
                  <Link href="/sellers">Meet Our Chefs</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-6 border-t border-white/20 w-full">
                <div className="text-center"><div className="text-3xl font-bold text-primary" style={textShadowStyle}>500+</div><div className="text-sm text-white/80" style={textShadowStyle}>Customers</div></div>
                <div className="text-center"><div className="text-3xl font-bold text-primary" style={textShadowStyle}>50+</div><div className="text-sm text-white/80" style={textShadowStyle}>Expert Chefs</div></div>
                <div className="text-center"><div className="text-3xl font-bold text-primary" style={textShadowStyle}>1000+</div><div className="text-sm text-white/80" style={textShadowStyle}>Dishes Served</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PERFECT & FINAL MOBILE HERO SECTION --- */}
      <section className="relative w-full min-h-[85vh] md:hidden flex items-end justify-end bg-gray-900 overflow-hidden">
        {/* Background Image - Perfect Cropping & Full Opacity */}
        <div
          className="absolute inset-0 z-0 bg-cover"
          style={{
            backgroundImage: `url('${mobileImageUrl}')`,
            backgroundPosition: 'left center',
          }}
        ></div>
        
        {/* Content Panel */}
        <motion.div
          className="relative z-10 p-4 w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="border border-white/10 rounded-2xl p-4">
            {/* New Login Section for Mobile */}
            <div className="flex justify-center gap-4 w-full mb-4 pb-4 border-b border-white/10">
                <Link href="/login" className="text-xs text-white/80 hover:text-primary transition-colors font-semibold">
                  Login as Buyer
                </Link>
                <div className="w-px h-4 bg-white/20"></div> {/* Vertical Separator */}
                <Link href="/login" className="text-xs text-white/80 hover:text-primary transition-colors font-semibold">
                  Login as Seller
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full mb-4">
              <div className="text-center"><div className="text-xl font-bold text-primary" style={textShadowStyle}>500+</div><div className="text-[0.65rem] text-white/70" style={textShadowStyle}>Customers</div></div>
              <div className="text-center"><div className="text-xl font-bold text-primary" style={textShadowStyle}>50+</div><div className="text-[0.65rem] text-white/70" style={textShadowStyle}>Expert Chefs</div></div>
              <div className="text-center"><div className="text-xl font-bold text-primary" style={textShadowStyle}>1000+</div><div className="text-[0.65rem] text-white/70" style={textShadowStyle}>Dishes Served</div></div>
            </div>
            <div className="flex justify-center gap-6 border-t border-white/10 pt-4">
              <motion.a href="https://www.instagram.com/aharian.official/" target="_blank" whileHover={{ scale: 1.2, color: 'hsl(var(--primary))' }} className="text-white/80"><Instagram size={20} /></motion.a>
              <motion.a href="https://www.facebook.com/aharian.official/" target="_blank" whileHover={{ scale: 1.2, color: 'hsl(var(--primary))' }} className="text-white/80"><Facebook size={20} /></motion.a>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
