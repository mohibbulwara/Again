'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

interface ModernLoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function ModernLoading({ 
  variant = 'spinner', 
  size = 'md', 
  text,
  className = '' 
}: ModernLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Loader2 className={`${sizeClasses[size]} text-primary`} />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <Sparkles className={`${sizeClasses[size]} text-pink-500 opacity-50`} />
          </motion.div>
        </motion.div>
        {text && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-muted-foreground font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-3/4 shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/2 shimmer"></div>
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className={`${sizeClasses[size]} bg-gradient-to-r from-primary to-pink-500 rounded-full`}
        />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className="w-3 h-3 bg-gradient-to-r from-primary to-pink-500 rounded-full"
          />
        ))}
      </div>
    );
  }

  return null;
}

// Skeleton components for specific use cases
export function DishCardSkeleton() {
  return (
    <div className="glass-effect rounded-xl p-5 space-y-4 animate-pulse">
      <div className="aspect-[4/3] bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg shimmer"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-3/4 shimmer"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-20 shimmer"></div>
          <div className="h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-24 shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="glass-effect backdrop-blur-xl border-b border-border/40 p-4">
      <div className="container flex items-center justify-between animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded shimmer"></div>
          <div className="h-6 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-32 shimmer"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full shimmer"></div>
          <div className="w-8 h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full shimmer"></div>
          <div className="w-8 h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full shimmer"></div>
        </div>
      </div>
    </div>
  );
}