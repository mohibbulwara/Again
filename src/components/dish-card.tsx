
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Dish } from '@/types';
import { useCart } from '@/lib/hooks';
import { useLanguage } from '@/lib/hooks';

import { ShoppingCart, Clock, BadgeAlert } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface DishCardProps {
  dish: Dish;
}

export default function DishCard({ dish }: DishCardProps) { 
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const createSlug = (name, id) => {
    const formattedName = name.toLowerCase().replace(/\s+/g, '-');
    return `${formattedName}-${id}`;
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Convert dish to product format for cart
    const product = {
      ...dish,
      image: dish.images?.[0] || 'https://placehold.co/600x400.png'
    };
    addToCart(product);

  };

  const isAvailable = dish.isAvailable ?? true;
  const isDiscount = dish.originalPrice && dish.originalPrice > dish.price;
  const discountPercentage = isDiscount ? Math.round(((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100) : 0;
  const mainImage = dish.images?.[0] || 'https://placehold.co/600x400.png';
  const slug = createSlug(dish.name, dish.id);

  return (
    <Card
      className="group relative overflow-hidden rounded-xl border-border/20 transition-all duration-300 h-full flex flex-col card-hover hover:border-primary/50 hover:shadow-xl"
    >
      <Link href={`/dish/${slug}`} className="block">
        <div className="overflow-hidden aspect-[4/3] relative">
          <Image
            src={mainImage}
            alt={dish.name}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
            data-ai-hint={`${dish.category}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/40" />
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          
           {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg glass-effect px-4 py-2 rounded-lg">Out of Stock</span>
            </div>
          )}
          {isDiscount && (
            <Badge variant="destructive" className="absolute top-3 right-3 text-sm font-bold shadow-lg pulse-glow animate-bounce">
 {discountPercentage}% OFF
            </Badge>)}
        </div>
      </Link>
      <div className="p-5 space-y-4 flex flex-col flex-grow bg-gradient-to-b from-transparent to-background/50">
        <div className="flex-grow">
           {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
 {dish.tags.map((tag: string, index: number) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs glass-effect hover:bg-primary/20 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="font-headline text-lg font-bold leading-tight text-foreground mb-2">
            <Link
              href={`/dish/${slug}`}
              className="hover:text-primary transition-all duration-300 bg-gradient-to-r from-foreground to-foreground hover:from-primary hover:to-pink-500 bg-clip-text hover:text-transparent"
            >
              {dish.name}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 h-[40px] leading-relaxed">
            {dish.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
             <Clock className="h-3 w-3" />
             <span className="font-medium">{dish.deliveryTime}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/20">
          <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 text-transparent bg-clip-text">
                ৳{dish.price.toFixed(2)}
              </div>
              {isDiscount && (
                <div className="text-sm text-muted-foreground line-through opacity-75">
                  ৳{dish.originalPrice!.toFixed(2)}
                </div>
              )}
          </div>
           <Button
              onClick={handleAddToCart}
              size="sm"
              disabled={!isAvailable}
              className="modern-button transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
 {isAvailable ? <>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="ml-2 text-xs font-medium">{t('addToCart')}</span>
 </> : <>
                  <BadgeAlert className="h-4 w-4" />
                  <span className="ml-2 text-xs font-medium">Unavailable</span>
 </>}
 </Button>
        </div>
      </div>
    </Card>
  );
}
