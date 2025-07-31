
'use client';

import { Suspense, useState, useEffect } from 'react';
import CategoryShowcase from '@/components/category-showcase';
import FeaturedSellers from '@/components/featured-sellers';
import HeroSection from '@/components/hero-section';
import SubscriptionSection from '@/components/subscription-section';
import Testimonials from '@/components/testimonials';
import { getDishes } from '@/lib/services/dish-service';
import { getAllSellers } from '@/lib/services/user-service';
import { categories } from '@/lib/data';
import AllDishes from '@/components/all-dishes';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dish, User } from '@/types';
import CategorySellers from '@/components/category-sellers';
import ModernLoading, { DishCardSkeleton } from '@/components/modern-loading';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';


const AllDishesSkeleton = () => (
    <div className="container mx-auto py-16 md:py-24">
        <div className="text-center mb-12">
            <div className="flex flex-col items-center space-y-4">
                <ModernLoading variant="spinner" size="lg" text="Loading delicious dishes..." />
                <div className="space-y-2">
                    <Skeleton className="h-12 w-3/4 mx-auto shimmer" />
                    <Skeleton className="h-6 w-1/2 mx-auto shimmer" />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block md:col-span-1 space-y-8">
                <Skeleton className="h-24 w-full rounded-xl shimmer" />
                <Skeleton className="h-32 w-full rounded-xl shimmer" />
                <Skeleton className="h-64 w-full rounded-xl shimmer" />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <DishCardSkeleton key={i} />
                ))}
            </div>
        </div>
    </div>
);


export default function HomePage() {
  const [allDishesData, setAllDishesData] = useState<Dish[]>([]);
  const [allSellers, setAllSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { ref: pageRef, isVisible: pageVisible } = useScrollAnimation();

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [dishes, sellers] = await Promise.all([
        getDishes(),
        getAllSellers()
      ]);
      setAllDishesData(dishes);
      setAllSellers(sellers);
      setLoading(false);
    }
    fetchData();
  }, []);
  
  const featuredSellers = allSellers
    .sort((a, b) => {
      if (a.planType === 'pro' && b.planType !== 'pro') return -1;
      if (a.planType !== 'pro' && b.planType === 'pro') return 1;
      return (b.productUploadCount || 0) - (a.productUploadCount || 0);
    })
    .slice(0, 3);
  
  return (
    <div ref={pageRef} className={`flex flex-col transition-all duration-1000 ${pageVisible ? 'animate-on-scroll in-view' : 'animate-on-scroll'}`}>
      <HeroSection />
      
      <Suspense fallback={<AllDishesSkeleton />}>
        <div className="animate-on-scroll">
          <AllDishes
            dishes={allDishesData}
            selectedCategory={selectedCategory}
          />
        </div>
      </Suspense>
      
      <div className="animate-on-scroll">
        <CategoryShowcase
          categories={categories}
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
      </div>
      
      <div className="animate-on-scroll">
        <CategorySellers
           key={selectedCategory} // Force re-render on category change
           category={selectedCategory}
           allSellers={allSellers}
           allDishes={allDishesData}
         />
      </div>
      
      <div className="animate-on-scroll">
        <FeaturedSellers sellers={featuredSellers} />
      </div>
      
      <div className="animate-on-scroll">
        <Testimonials />
      </div>
      
      <div className="animate-on-scroll">
        <SubscriptionSection />
      </div>
    </div>
  );
}
