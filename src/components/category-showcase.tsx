
'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { categoryData } from '@/lib/category-data';
import { Grid as GridIcon } from 'lucide-react';

interface CategoryShowcaseProps {
  onSelectCategory: (category: string | null) => void;
  selectedCategory?: string | null;
}

export default function CategoryShowcase({ onSelectCategory, selectedCategory }: CategoryShowcaseProps) {
  const handleCategoryClick = (e: React.MouseEvent, categoryName: string) => {
    e.preventDefault();
    onSelectCategory(categoryName);
    
    setTimeout(() => {
      const dishesSection = document.getElementById('dishes-section');
      if (dishesSection) {
        dishesSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }

  return (
    <section className="bg-secondary/30 py-8 md:py-12">
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-extrabold md:text-5xl bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text pb-2 inline-block">
               <GridIcon className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block mr-4 mb-2" />
              Shop By Category
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Click on a category to explore delicious options from our best kitchens.</p>
            {selectedCategory && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground mr-2">Showing: </span>
                <span className="text-sm font-medium text-primary">{selectedCategory}</span>
                <button
                  onClick={() => onSelectCategory(null)}
                  className="ml-2 text-xs text-muted-foreground hover:text-primary underline"
                >
                  Clear filter
                </button>
              </div>
            )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {categoryData.map((category) => {
             const isSelected = selectedCategory === category.name;
             return (
             <div key={category.name}>
              <a
                href={`/dishes?category=${encodeURIComponent(category.name)}`}
                onClick={(e) => handleCategoryClick(e, category.name)}
                className="group block h-full"
              >
                <Card className={`h-full overflow-hidden text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                  isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border'
                }`}>
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                    </div>
                    <div className="p-4 bg-card">
                        <h3 className={`font-headline text-xl font-bold transition-colors duration-200 ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>{category.name}</h3>
                    </div>
                </Card>
              </a>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}
