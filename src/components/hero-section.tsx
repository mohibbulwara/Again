
'use client';

import { useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto grid grid-cols-1 items-center py-20 md:py-32 text-center">
        <div className="relative">
          <div className="rounded-2xl p-8 md:p-12 mx-4 md:mx-8 border border-border shadow-lg bg-card">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground pb-4 leading-tight">
              {t('heroTitle')}
            </h1>
            
            <p className="mx-auto mt-6 max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                asChild
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 transition-colors duration-200"
              >
                <Link href="/dishes" className="flex items-center gap-2">
                  Explore Dishes
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg font-semibold border-primary/50 hover:bg-primary/10 transition-colors duration-200"
              >
                <Link href="/sellers">
                  Meet Our Chefs
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Expert Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Dishes Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
