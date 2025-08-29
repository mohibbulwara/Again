
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useCart, useLanguage } from '@/lib/hooks';
import { Badge } from '@/components/ui/badge';
import { CookingPot, ShoppingCart, User as UserIcon, Bell, Menu, LogIn, UserPlus, Search, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, writeBatch, Timestamp } from 'firebase/firestore';
import type { Notification } from '@/types';
import { ThemeSwitcher } from '../theme-switcher';
import SearchPopover from '../search-popover';


export default function Header() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [originalTitle, setOriginalTitle] = useState('Aharian - Authentic Flavors Delivered');

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/sellers', label: 'Sellers' },
    { href: '/dishes', label: 'All Dishes' },
    ...(isAuthenticated && user?.role === 'buyer' ? [{ href: '/myorders', label: 'My Orders' }] : []),
  ];

  useEffect(() => {
    // Store the original title when the component mounts
    if (typeof window !== 'undefined') {
      setOriginalTitle(document.title);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (unreadCount > 0) {
        document.title = `(${unreadCount}) ${originalTitle}`;
      } else {
        document.title = originalTitle;
      }
    }
    // Cleanup function to reset the title when the component unmounts
    return () => {
        if(typeof window !== 'undefined'){
            document.title = originalTitle;
        }
    };
  }, [unreadCount, originalTitle]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      notifs.sort((a, b) => {
          const timeA = a.createdAt ? (a.createdAt as Timestamp).toMillis() : 0;
          const timeB = b.createdAt ? (b.createdAt as Timestamp).toMillis() : 0;
          return timeB - timeA;
      });
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const batch = writeBatch(db);
    notifications.forEach(notification => {
        if (!notification.isRead) {
            const notifRef = doc(db, 'notifications', notification.id);
            batch.update(notifRef, { isRead: true });
        }
    });
    await batch.commit();
  };
  
  const getNotificationLink = (notification: Notification) => {
      if (notification.type === 'order-status' && notification.orderId) return '/myorders';
      if (notification.type === 'new-product' && notification.dishId) return `/dish/${notification.dishId}`;
      if (notification.type === 'new-order' && user?.role === 'seller') return '/dashboard';
      if (notification.type === 'account-activated' && user?.role === 'seller') return '/dashboard';
      return '#';
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glass-effect backdrop-blur-xl shadow-lg">
      <div className="container flex h-16 items-center">
        <div className="mr-auto">
          <Link href="/" className="flex items-center space-x-2 group">
            <CookingPot className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span
  className="text-lg sm:text-2xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.4)] transform transition-all duration-300 hover:scale-105 hover:-rotate-1"
  style={{ fontFamily: "'Unica One', cursive" }}
>
  Aharian
</span>





          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-2">
  {navLinks.map((link) => {
    const isActive = pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`relative rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-primary modern-button ${
          isActive ? 'text-primary glass-effect' : 'text-muted-foreground hover:bg-primary/10'
        }`}
      >
        {link.label}
      </Link>
    );
  })}

  {/* Dashboard link for sellers - only show in desktop nav */}
  {user?.role === 'seller' && (
    <Link
      href="/dashboard"
      className={`relative rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-primary modern-button ${
        pathname.startsWith('/dashboard') ? 'text-primary glass-effect' : 'text-muted-foreground hover:bg-primary/10'
      }`}
    >
      <div className="flex items-center gap-2">
        <span>Dashboard</span>
        {pathname.startsWith('/dashboard') && (
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
        )}
      </div>
    </Link>
  )}
</nav>

        
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          
          {isAuthenticated && user && (
            <Popover>
              <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full p-2 transition-all duration-300 hover:bg-accent modern-button hover:scale-110">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                           <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs border-2 border-background pulse-glow notification-badge">
                              {unreadCount}
                           </Badge>
                      )}
                      <span className="sr-only">Notifications</span>
                  </Button>
              </PopoverTrigger>
               <PopoverContent align="end" className="w-80">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Notifications</h4>
                    {unreadCount > 0 && <Button variant="link" size="sm" onClick={markAllAsRead}>Mark all as read</Button>}
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <Link key={notif.id} href={getNotificationLink(notif)} className={`block p-2 rounded-md hover:bg-accent ${!notif.isRead && 'bg-primary/10'}`}>
                          <p className="text-sm">{notif.message}</p>
                          {notif.createdAt && (
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow((notif.createdAt as Timestamp).toDate(), { addSuffix: true })}
                            </p>
                          )}
                        </Link>
                      ))
                    ) : <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>}
                  </div>
              </PopoverContent>
            </Popover>
          )}

          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full p-2 transition-all duration-300 hover:bg-accent modern-button hover:scale-110" title="Search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <SearchPopover onSearch={() => setIsSearchOpen(false)} />
            </PopoverContent>
          </Popover>

           <Button asChild variant="ghost" size="icon" className="relative rounded-full p-2 transition-all duration-300 hover:bg-accent modern-button hover:scale-110">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs border-2 border-background pulse-glow">
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">{t('cart')}</span>
            </Link>
           </Button>

          <ThemeSwitcher />

          {loading ? null : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User Menu</span>
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile" className="flex items-center gap-2"><UserIcon className="h-4 w-4"/>My Profile</Link></DropdownMenuItem>
                {user.role === 'seller' && <DropdownMenuItem asChild><Link href="/dashboard" className="flex items-center gap-2"><Building className="h-4 w-4"/>Seller Dashboard</Link></DropdownMenuItem>}
                {user.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin" className="flex items-center gap-2"><Building className="h-4 w-4"/>Admin Panel</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
               <Button asChild variant="ghost" className="hidden lg:inline-flex">
                <Link href="/login"><LogIn className="mr-2"/>{t('login')}</Link>
               </Button>
               <Button asChild className="hidden lg:inline-flex">
                <Link href="/register"><UserPlus className="mr-2"/>{t('register')}</Link>
               </Button>
               {/* Show icons only on smaller screens */}
               <Button asChild variant="ghost" size="icon" className="lg:hidden">
                  <Link href="/login" aria-label="Login"><LogIn /></Link>
               </Button>
               <Button asChild size="icon" className="lg:hidden">
                  <Link href="/register" aria-label="Register"><UserPlus /></Link>
               </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
