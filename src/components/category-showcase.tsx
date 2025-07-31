
'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Pizza,
  UtensilsCrossed,
  Flame,
  LayoutGrid,
  Utensils,
  Soup,
  Salad,
  CakeSlice,
  CupSoda,
  CookingPot,
  Wheat,
  Voicemail,
  Fish,
  Vegan,
  Sandwich,
  Coffee,
  IceCream,
  Popcorn
} from 'lucide-react';
import type { ComponentType } from 'react';

interface Category {
  name: string;
  hint: string; 
}

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory: (category: string | null) => void;
  selectedCategory?: string | null;
}

const iconMap: { [key: string]: ComponentType<{ className?: string }> } = {
  Burger: Utensils,
  Pizza: Pizza,
  Biryani: UtensilsCrossed,
  Kebab: Flame,
  'Set Menu': LayoutGrid,
  Pasta: Utensils,
  Soup: Soup,
  Salad: Salad,
  Dessert: CakeSlice,
  Drinks: CupSoda,
  Curry: CookingPot,
  Rice: Wheat,
  Noodles: Voicemail,
  Seafood: Fish,
  Vegetarian: Vegan,
  Sandwich: Sandwich,
  Breakfast: Coffee,
  Appetizers: Popcorn,
  Coffee: Coffee,
  'Ice Cream': IceCream,
};

export default function CategoryShowcase({ categories, onSelectCategory, selectedCategory }: CategoryShowcaseProps) {
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleCategoryClick = (e: React.MouseEvent, categoryName: string) => {
    e.preventDefault(); // Prevent navigation
    onSelectCategory(categoryName);
    
    // Smooth scroll to the dishes section
    setTimeout(() => {
      const dishesSection = document.getElementById('dishes-section');
      if (dishesSection) {
        dishesSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100); // Small delay to ensure state update
  }

  return (
    <section 
      className="bg-secondary/30 py-16 md:py-24"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-extrabold md:text-5xl text-shadow-lg text-foreground pb-2">
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
          {categories.map((category, index) => {
             const Icon = iconMap[category.name] || Utensils;
             const isSelected = selectedCategory === category.name;
             return (
             <motion.div
              key={category.name}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <a
                href={`/dishes?category=${encodeURIComponent(category.name)}`}
                onClick={(e) => handleCategoryClick(e, category.name)}
                className="group block h-full"
              >
                <Card className={`h-full overflow-hidden text-center transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:-translate-y-1 ${
                  isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
                }`}>
                    <div className={`p-6 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/10 ${
                      isSelected ? 'bg-primary/10' : 'bg-muted/40'
                    }`}>
                        <Icon className={`h-12 w-12 transition-all duration-300 group-hover:text-primary group-hover:scale-110 ${
                          isSelected ? 'text-primary scale-110' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <div className="p-4 bg-card">
                        <h3 className={`font-headline text-xl font-bold transition-colors duration-300 group-hover:text-primary ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>{category.name}</h3>
                    </div>
                </Card>
              </a>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
