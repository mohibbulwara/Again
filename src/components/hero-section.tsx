
'use client';

import { useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react'; // Added UtensilsCrossed icon

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[70vh] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/60 via-transparent to-transparent animate-gradient-pulse"></div>
      </div>

      <div className="container mx-auto grid grid-cols-1 items-center py-8 md:py-12 text-center relative z-10">
        <div className="relative">
          {/* Removed the box container div */}
          {/* Inner container for content with patterned background */}
          <div className="rounded-lg p-4 mx-auto max-w-4xl patterned-background">
            {/* Combined and improved headline with gradient and icon */}
            <h1 className="font-headline text-3xl font-extrabold md:text-5xl bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text pb-2 inline-block">
 <UtensilsCrossed className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block mr-4 mb-2" />
 Aharian: Where Every Bite Tells a Story.
 </h1>
            
            <p className="mx-auto mt-4 max-w-[500px] text-muted-foreground md:text-lg leading-relaxed">
 Discover authentic local flavors, crafted with passion and delivered to your door. Your next favorite meal awaits.            </p>

            {/* CTA Buttons */}
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
                className="px-6 py-5 text-base font-semibold border-primary/50 hover:bg-primary/10 transition-colors duration-200"
              >
                <Link href="/sellers">
                  Meet Our Chefs
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">50+</div>
                <div className="text-xs text-muted-foreground">Expert Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">1000+</div>
                <div className="text-xs text-muted-foreground">Dishes Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
