
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ChefHat, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart, useAuth } from '@/lib/hooks';
import { Badge } from '../ui/badge';

const baseNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/sellers', label: 'Sellers', icon: ChefHat },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Add dashboard link for sellers
  const navLinks = [...baseNavLinks];
  if (isAuthenticated && user?.role === 'seller') {
    navLinks.splice(2, 0, { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-effect backdrop-blur-xl border-t border-border/40 z-50 shadow-2xl">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/60 rounded-t-2xl" />
      
      <nav className="h-full relative z-10">
        <ul className="flex h-full items-center justify-around px-2">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative flex flex-col items-center gap-1 text-xs transition-all duration-300 hover:scale-110 p-2 rounded-xl hover:bg-primary/10"
                >
                  {link.href === '/cart' && cartCount > 0 && (
                     <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-[10px] border-2 border-background pulse-glow animate-bounce">
                        {cartCount}
                     </Badge>
                  )}
                  
                  <motion.div
                     className="relative"
                     animate={{
                       scale: isActive ? 1.2 : 1,
                       y: isActive ? -3 : 0,
                     }}
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-full blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    <motion.div
                      className={`relative z-10 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                      animate={{
                        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <link.icon className="h-6 w-6" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.span
                    className={`text-[10px] font-medium transition-all duration-200 ${
                      isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}
                    animate={{
                      y: isActive ? -1 : 0,
                      opacity: isActive ? 1 : 0.8,
                    }}
                  >
                    {link.label}
                  </motion.span>
                  
                  {/* Ripple effect on tap */}
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-xl"
                    initial={{ scale: 0, opacity: 0 }}
                    whileTap={{ scale: 1.5, opacity: 0.3 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Bottom safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
