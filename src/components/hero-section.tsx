
'use client';

import { useLanguage } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { useScrollAnimation, useParallax } from '@/hooks/use-scroll-animation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const { t } = useLanguage();
  const { ref: heroRef, isVisible } = useScrollAnimation();
  const { ref: parallaxRef, offset } = useParallax(0.3);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen bg-background overflow-hidden flex items-center justify-center"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${offset * 0.5}px)` }}
        />
        <div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${offset * -0.3}px)` }}
        />
        
        {/* Floating Icons */}
        <motion.div
          className="absolute top-1/3 left-1/6 text-primary/30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles size={32} />
        </motion.div>
        
        <motion.div
          className="absolute top-2/3 right-1/6 text-pink-500/30"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Star size={28} />
        </motion.div>
      </div>

      <div className="container mx-auto grid grid-cols-1 items-center py-20 md:py-32 text-center relative z-10">
        <motion.div
          className={`relative transition-all duration-1000 ${isVisible ? 'animate-on-scroll in-view' : 'animate-on-scroll'}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Glass Card Effect */}
          <div className="glass-effect rounded-3xl p-8 md:p-12 mx-4 md:mx-8 backdrop-blur-xl border border-white/20 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-animation text-transparent bg-clip-text pb-4 leading-tight">
                {t('heroTitle')}
              </h1>
            </motion.div>
            
            <motion.p
              className="mx-auto mt-6 max-w-[600px] text-muted-foreground md:text-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('heroSubtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                asChild
                size="lg"
                className="modern-button px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-pink-500 hover:from-pink-500 hover:to-primary transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                className="modern-button px-8 py-6 text-lg font-semibold glass-effect border-primary/50 hover:bg-primary/10 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/sellers">
                  Meet Our Chefs
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
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
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
}
