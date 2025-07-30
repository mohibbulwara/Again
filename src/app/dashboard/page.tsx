'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import type { Dish, Order, Notification, User } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import {
  MoreHorizontal, DollarSign, ShoppingCart, BarChart, PlusCircle,
  CheckCircle, Package, XCircle, Clock, Star, Zap, Trash2, Edit,
  MessageSquare, Eye, User as UserIcon, Phone, Mail, MapPin
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, serverTimestamp, deleteDoc, runTransaction, increment } from 'firebase/firestore';
import { getUserById } from '@/lib/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateDish } from '@/lib/actions';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type EnrichedOrder = Order & { buyer?: User | null };

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sellerDishes, setSellerDishes] = useState<Dish[]>([]);
  const [sellerOrders, setSellerOrders] = useState<EnrichedOrder[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'seller') {
      router.push('/login');
      return;
    }
    if (user.isSuspended) return;

    const dishesQuery = query(collection(db, 'dishes'), where('sellerId', '==', user.id));
    const unsubscribeDishes = onSnapshot(dishesQuery, (snapshot) => {
      const dishesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dish[];
      setSellerDishes(dishesData);
    });

    const ordersQuery = query(collection(db, 'orders'), where('sellerIds', 'array-contains', user.id));
    const unsubscribeOrders = onSnapshot(ordersQuery, async (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      const relevantOrders = ordersData.map(order => ({
        ...order,
        items: order.items.filter(item => item.sellerId === user.id)
      })).filter(order => order.items.length > 0);

      const enrichedOrders = await Promise.all(
        relevantOrders.map(async (order) => {
          const buyer = await getUserById(order.buyerId);
          return { ...order, buyer };
        })
      );
      setSellerOrders(enrichedOrders);
    });

    return () => {
      unsubscribeDishes();
      unsubscribeOrders();
    };
  }, [user, isAuthenticated, loading, router]);

  const deliveredOrders = sellerOrders.filter(order => order.status === 'Delivered');

  const totalRevenue = deliveredOrders.reduce((acc, order) => {
    const sellerItemsTotal = order.items.reduce((itemAcc, item) => {
      const itemTotal = item.price * item.quantity;
      const commission = item.commissionPercentage || 5;
      return itemAcc + (itemTotal - (itemTotal * (commission / 100)));
    }, 0);
    return acc + sellerItemsTotal;
  }, 0);

  const totalOrders = sellerOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const salesData = deliveredOrders.reduce((acc, order) => {
    if (!order.createdAt) return acc;
    const orderDate = new Date(order.createdAt as string);
    const month = format(orderDate, 'MMM yyyy');
    const sellerItemsTotal = order.items.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0);
    const existingMonth = acc.find(d => d.month === month);
    if (existingMonth) {
      existingMonth.sales += sellerItemsTotal;
    } else {
      acc.push({ month, sales: sellerItemsTotal });
    }
    return acc;
  }, [] as { month: string; sales: number }[]).reverse();

  const chartConfig = {
    sales: {
      label: 'Sales (BDT)',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const handleStatusChange = async (orderId: string, status: Order['status'], buyerId: string) => {
    if (!user) return;
    const orderRef = doc(db, 'orders', orderId);
    const sellerRef = doc(db, 'users', user.id);
    try {
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists() || orderDoc.data().status === status) return;
        transaction.update(orderRef, { status });

        const buyerNotificationRef = doc(collection(db, 'notifications'));
        transaction.set(buyerNotificationRef, {
          userId: buyerId,
          orderId: orderId,
          message: `Your order #${orderId.substring(0, 6)} is now ${status}.`,
          type: 'order-status',
          createdAt: serverTimestamp(),
          isRead: false,
        });

        if (status === 'Delivered' && orderDoc.data().status !== 'Delivered') {
          const sellerDoc = await transaction.get(sellerRef);
          const currentDeliveredCount = sellerDoc.data()?.deliveredOrderCount || 0;
          transaction.update(sellerRef, { deliveredOrderCount: increment(1) });

          if (currentDeliveredCount + 1 >= 100) {
            transaction.update(sellerRef, { isSuspended: true });
            const sellerNotificationRef = doc(collection(db, 'notifications'));
            transaction.set(sellerNotificationRef, {
              userId: user.id,
              message: "Your account has been suspended after reaching 100 delivered orders. Please contact admin to re-activate.",
              type: 'account-activated',
              createdAt: serverTimestamp(),
              isRead: false,
            });
          }
        }
      });

      toast({ title: 'Order Updated', description: `Order status changed to ${status}.` });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
    }
  };

  const handleDelete = async (dishId: string) => {
    try {
      await deleteDoc(doc(db, "dishes", dishId));
      toast({ title: "Dish Deleted", description: "The dish has been removed." });
    } catch (error) {
      console.error("Error deleting dish:", error);
      toast({ title: 'Error', description: 'Failed to delete dish.', variant: 'destructive' });
    }
  };

  const handleAvailabilityChange = async (dishId: string, isAvailable: boolean) => {
    try {
      const result = await updateDish(dishId, { isAvailable });
      if (result.error) throw new Error(result.error);
      toast({ title: 'Stock Updated', description: `Dish is now ${isAvailable ? 'available' : 'unavailable'}.` });
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast({ title: 'Error', description: error.message || 'Failed to update stock status.', variant: 'destructive' });
    }
  };

  const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Preparing': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (loading || !user || user.role !== 'seller') {
    return <div className="container py-12 text-center">Loading or redirecting...</div>;
  }

  if (user.isSuspended) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-2xl mx-auto text-center border-destructive">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-destructive">Account Suspended</CardTitle>
            <CardDescription>Your account has been temporarily suspended.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You have successfully completed 100 orders. To continue selling on our platform, a monthly fee of 500 taka is required.
              Please contact admin to make the payment and re-activate your account.
            </p>
            <Button asChild variant="outline">
              <Link href="/contact">Contact Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Seller Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/add-product">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Dish
          </Link>
        </Button>
      </div>

      {/* Commented Tabs section safely using JSX-style comments */}
      {/*
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dishes">Dishes</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        ...
      </Tabs>
      */}
    </div>
  );
}
