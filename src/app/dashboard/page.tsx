
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
import { MoreHorizontal, DollarSign, ShoppingCart, BarChart, PlusCircle, CheckCircle, Package, XCircle, Clock, Star, Zap, Trash2, Edit, MessageSquare, Eye, User as UserIcon, Phone, Mail, MapPin, Filter, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';


type EnrichedOrder = Order & { buyer?: User | null };

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sellerDishes, setSellerDishes] = useState<Dish[]>([]);
  const [sellerOrders, setSellerOrders] = useState<EnrichedOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'delivered' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'seller') {
      router.push('/login');
      return;
    }

    if(user.isSuspended) {
        // Handled by the component's return statement, but good practice
        return;
    }

    // Fetch Dishes
    const dishesQuery = query(collection(db, 'dishes'), where('sellerId', '==', user.id));
    const unsubscribeDishes = onSnapshot(dishesQuery, (snapshot) => {
      const dishesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dish[];
 console.log('Fetched dishesData:', dishesData); // Log fetched dishes
      setSellerDishes(dishesData);
    });

    // Fetch Orders related to this seller
    const ordersQuery = query(collection(db, 'orders'), where('sellerIds', 'array-contains', user.id));
     const unsubscribeOrders = onSnapshot(ordersQuery, async (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
       // Filter items to only show those belonging to the current seller for display
      const relevantOrders = ordersData.map(order => ({
        ...order,
        items: order.items.filter(item => item.sellerId === user.id)
      })).filter(order => order.items.length > 0);
      
      // Enrich orders with buyer information
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

  // Filter orders based on status and search
  const filteredOrders = sellerOrders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status.toLowerCase() === orderFilter;
    const matchesSearch = searchTerm === '' ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Filter dishes based on search
  const filteredDishes = sellerDishes.filter(dish =>
    searchTerm === '' || dish.name.toLowerCase().includes(searchTerm.toLowerCase())

  );
  
  const salesData = deliveredOrders.reduce((acc, order) => {
    let orderDate: Date;
    if (order.createdAt instanceof Date) {
 orderDate = order.createdAt;
    } else if (order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt) {
      // Handle Firestore Timestamp
 orderDate = (order.createdAt as any).toDate();
    } else if (typeof order.createdAt === 'string') {
      // Attempt to parse as a string
 const parsedDate = new Date(order.createdAt);
 if (!isNaN(parsedDate.getTime())) {
 orderDate = parsedDate;
      } else {
 console.warn(`Skipping order ${order.id} due to unparsable createdAt string: ${order.createdAt}`);
 return acc;
      }
    } else {
 console.warn(`Skipping order ${order.id} due to invalid createdAt format:`, order.createdAt);
      return acc;
    }
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
    
    setIsUpdating(orderId);
    const orderRef = doc(db, 'orders', orderId);
    const sellerRef = doc(db, 'users', user.id);

    try {
        await runTransaction(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            let sellerDoc = null;

            // Read seller doc only if we potentially need it (for Delivered status)
            if (status === 'Delivered') {
                 sellerDoc = await transaction.get(sellerRef);
            }

            if (!orderDoc.exists() || orderDoc.data().status === status) {
                return;
            }

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
                const currentDeliveredCount = sellerDoc?.data()?.deliveredOrderCount || 0;

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
        
        toast({
          title: 'Success!',
          description: `Order #${orderId.substring(0, 6)} status updated to ${status}.`,
          duration: 3000
        });

    } catch (error) {
        console.error("Error updating status:", error);
        toast({
          title: 'Error',
          description: 'Failed to update order status. Please try again.',
          variant: 'destructive'
        });
    } finally {
        setIsUpdating(null);
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
      if (result.error) {
        throw new Error(result.error);
      }
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
                    <p className="mb-4">You have successfully completed 100 orders. To continue selling on our platform, a monthly fee of 500 taka is required. Please contact admin to make the payment and re-activate your account.</p>
                     <Button asChild variant="outline">
                        <Link href="/contact">Contact Admin</Link>
                     </Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  const OrderStatusIcon = ({ status }: { status: Order['status'] }) => {
    switch (status) {
        case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'Preparing': return <Package className="h-4 w-4 text-blue-500" />;
        case 'Delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'Cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-6">
       {/* Header Section */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary">
                    Seller Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, {user?.name}! Manage your business here.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/dashboard/edit-product">
                        <Edit className="mr-2 h-4 w-4"/>
                        <span className="hidden sm:inline">Manage</span> Products
                    </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/dashboard/add-product">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add New Dish
                    </Link>
                </Button>
            </div>
       </div>
       
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="dishes" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Dishes</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                        {sellerDishes.length}
                    </Badge>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Orders</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                        {sellerOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length}
                    </Badge>
                </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
                {/* Pro Seller Status */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700/30">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                          <Star className="h-6 w-6 fill-current"/> You are a Pro Seller!
                      </CardTitle>
                        <CardDescription className="text-green-700 dark:text-green-400">
                          You have access to all features, including unlimited dish uploads and detailed analytics.
                        </CardDescription>
                  </CardHeader>
                </Card>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">৳{totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                From {deliveredOrders.length} delivered orders
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalOrders}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {sellerOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length} active orders
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">৳{averageOrderValue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Per completed order
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Dishes</CardTitle>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                                <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {sellerDishes.filter(d => d.isAvailable !== false).length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Out of {sellerDishes.length} total dishes
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Sales Overview
                        </CardTitle>
                        <CardDescription>Your sales performance over the last few months</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {salesData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <RechartsBarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                                </RechartsBarChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No sales data available yet</p>
                                    <p className="text-sm">Complete some orders to see your sales chart</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="dishes" className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    My Dishes
                                </CardTitle>
                                <CardDescription>
                                    Manage your dishes here. You have added {sellerDishes.length} dish(s).
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Input
                                    placeholder="Search dishes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-64"
                                />
                                <Button asChild variant="outline" className="w-full sm:w-auto">
                                    <Link href="/dashboard/add-product">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Dish
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredDishes.length > 0 ? (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">Image</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Views</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead className="w-[70px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredDishes.map(dish => {
                                                const isAvailable = dish.isAvailable ?? true;
                                                const isDiscount = dish.originalPrice !== undefined && dish.originalPrice > dish.price;
                                                const discountPercentage = isDiscount
                                                    ? Math.round(((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100)
                                                    : 0;
                                                return (
                                                    <TableRow key={dish.id}>
                                                        <TableCell>
                                                            <Image
                                                                alt={dish.name}
                                                                className="aspect-square rounded-md object-cover"
                                                                height="64"
                                                                src={dish.images[0]}
                                                                width="64"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div>
                                                                <p className="font-semibold">{dish.name}</p>
                                                                <p className="text-sm text-muted-foreground">{dish.category}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Switch
                                                                    id={`stock-${dish.id}`}
                                                                    checked={isAvailable}
                                                                    onCheckedChange={(checked) => handleAvailabilityChange(dish.id, checked)}
                                                                />
                                                                <Label htmlFor={`stock-${dish.id}`} className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {isAvailable ? 'Available' : 'Out of Stock'}
                                                                </Label>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                                <span>{dish.viewCount || 0}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">৳{dish.price.toFixed(2)}</span>
                                                                {isDiscount && (
                                                                    <Badge variant="destructive" className="text-xs font-bold">{discountPercentage}% OFF</Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/dashboard/edit-product/${dish.id}`} className="flex items-center gap-2">
                                                                            <Edit className="h-4 w-4" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" className="w-full justify-start p-2 h-auto font-normal text-destructive hover:text-destructive flex items-center gap-2">
                                                                                <Trash2 className="h-4 w-4" />
                                                                                Delete
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Delete Dish</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Are you sure you want to delete "{dish.name}"? This action cannot be undone.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction onClick={() => handleDelete(dish.id)} className="bg-destructive hover:bg-destructive/90">
                                                                                    Delete
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {filteredDishes.map(dish => {
                                        const isAvailable = dish.isAvailable ?? true;
                                        const isDiscount = dish.originalPrice !== undefined && dish.originalPrice > dish.price;
                                        const discountPercentage = isDiscount
                                            ? Math.round(((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100)
                                            : 0;
                                        return (
                                            <Card key={dish.id} className="p-4">
                                                <div className="flex gap-4">
                                                    <Image
                                                        alt={dish.name}
                                                        className="aspect-square rounded-md object-cover flex-shrink-0"
                                                        height="80"
                                                        src={dish.images[0]}
                                                        width="80"
                                                    />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-semibold">{dish.name}</h3>
                                                                <p className="text-sm text-muted-foreground">{dish.category}</p>
                                                                <div className="flex items-center gap-2 text-lg">
                                                                    <span className="font-semibold">৳{dish.price.toFixed(2)}</span>
                                                                    {isDiscount && (
                                                                        <Badge variant="destructive" className="text-xs font-bold">{discountPercentage}% OFF</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/dashboard/edit-product/${dish.id}`} className="flex items-center gap-2">
                                                                            <Edit className="h-4 w-4" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" className="w-full justify-start p-2 h-auto font-normal text-destructive hover:text-destructive flex items-center gap-2">
                                                                                <Trash2 className="h-4 w-4" />
                                                                                Delete
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Delete Dish</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Are you sure you want to delete "{dish.name}"? This action cannot be undone.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction onClick={() => handleDelete(dish.id)} className="bg-destructive hover:bg-destructive/90">
                                                                                    Delete
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    id={`mobile-stock-${dish.id}`}
                                                                    checked={isAvailable}
                                                                    onCheckedChange={(checked) => handleAvailabilityChange(dish.id, checked)}
                                                                />
                                                                <Label htmlFor={`mobile-stock-${dish.id}`} className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {isAvailable ? 'Available' : 'Out of Stock'}
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <Eye className="h-4 w-4" />
                                                                {dish.viewCount || 0} views
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                {searchTerm ? (
                                    <div className="space-y-4">
                                        <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                        <div>
                                            <p className="text-lg font-medium">No dishes found</p>
                                            <p className="text-muted-foreground">Try adjusting your search term</p>
                                        </div>
                                        <Button variant="outline" onClick={() => setSearchTerm('')}>
                                            Clear Search
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                        <div>
                                            <p className="text-lg font-medium">No dishes yet</p>
                                            <p className="text-muted-foreground">Start by adding your first dish to your menu</p>
                                        </div>
                                        <Button asChild>
                                            <Link href="/dashboard/add-product">
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Add Your First Dish
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="orders" className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Orders Management
                                </CardTitle>
                                <CardDescription>
                                    Manage your incoming orders here. {filteredOrders.length} of {sellerOrders.length} orders shown.
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Input
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-48"
                                />
                                <Select value={orderFilter} onValueChange={(value: any) => setOrderFilter(value)}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Orders</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredOrders.length > 0 ? (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Buyer</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead className="w-[70px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.map(order => {
                                                const isActionable = order.status !== 'Delivered' && order.status !== 'Cancelled';
                                                const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                                                return (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-medium">#{order.id?.substring(0,6)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={order.buyer?.avatar} />
                                                                    <AvatarFallback>{order.buyer?.name?.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{order.buyer?.name || 'N/A'}</p>
                                                                    <p className="text-xs text-muted-foreground">{order.buyer?.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                {order.items.map(item => (
                                                                    <div key={item.id} className="text-sm">
                                                                        {item.name} × {item.quantity}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={getStatusVariant(order.status)} className="capitalize flex items-center gap-1 w-fit">
                                                                <OrderStatusIcon status={order.status} />
                                                                {order.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-semibold">৳{orderTotal.toFixed(2)}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Dialog>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" disabled={isUpdating === order.id}>
                                                                            {isUpdating === order.id ? (
                                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent>
                                                                        <DialogTrigger asChild>
                                                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                                                                        </DialogTrigger>
                                                                        {isActionable && (
                                                                            <>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Preparing', order.buyerId)}>
                                                                                    <Package className="mr-2 h-4 w-4" />
                                                                                    Mark as Preparing
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Delivered', order.buyerId)}>
                                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                                    Mark as Delivered
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Cancelled', order.buyerId)} className="text-destructive">
                                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                                    Cancel Order
                                                                                </DropdownMenuItem>
                                                                            </>
                                                                        )}
                                                                        {order.buyer?.email && (
                                                                            <>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem asChild>
                                                                                    <a href={`mailto:${order.buyer.email}`} className="flex items-center gap-2">
                                                                                        <MessageSquare className="h-4 w-4"/>
                                                                                        Message Buyer
                                                                                    </a>
                                                                                </DropdownMenuItem>
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Order Details #{order.id?.substring(0, 6)}</DialogTitle>
                                                                        <DialogDescription>Full contact and shipping information for this order.</DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4 py-4">
                                                                        <div>
                                                                            <h4 className="font-semibold text-lg mb-3">Buyer Information</h4>
                                                                            <div className="flex items-center gap-4 mb-4">
                                                                                <Avatar>
                                                                                    <AvatarImage src={order.buyer?.avatar} />
                                                                                    <AvatarFallback>{order.buyer?.name?.charAt(0)}</AvatarFallback>
                                                                                </Avatar>
                                                                                <div>
                                                                                    <p className="font-medium">{order.buyer?.name}</p>
                                                                                    <p className="text-sm text-muted-foreground">{order.buyer?.email}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2 rounded-md border p-4 bg-muted/50">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                                                    <span>{order.contact}</span>
                                                                                </div>
                                                                                <div className="flex items-start gap-2">
                                                                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                                                                    <span>{order.address}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-semibold text-lg mb-3">Order Items</h4>
                                                                            <div className="space-y-2">
                                                                                {order.items.map(item => (
                                                                                    <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                                        <span>{item.name} × {item.quantity}</span>
                                                                                        <span className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</span>
                                                                                    </div>
                                                                                ))}
                                                                                <div className="flex justify-between items-center p-2 bg-primary/10 rounded font-semibold">
                                                                                    <span>Total</span>
                                                                                    <span>৳{orderTotal.toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {filteredOrders.map(order => {
                                        const isActionable = order.status !== 'Delivered' && order.status !== 'Cancelled';
                                        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                                        return (
                                            <Card key={order.id} className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">#{order.id?.substring(0,6)}</p>
                                                            <p className="text-sm text-muted-foreground">{order.buyer?.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={getStatusVariant(order.status)} className="capitalize flex items-center gap-1">
                                                                <OrderStatusIcon status={order.status} />
                                                                {order.status}
                                                            </Badge>
                                                            <Dialog>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" disabled={isUpdating === order.id}>
                                                                            {isUpdating === order.id ? (
                                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent>
                                                                        <DialogTrigger asChild>
                                                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                                                                        </DialogTrigger>
                                                                        {isActionable && (
                                                                            <>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Preparing', order.buyerId)}>
                                                                                    <Package className="mr-2 h-4 w-4" />
                                                                                    Mark as Preparing
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Delivered', order.buyerId)}>
                                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                                    Mark as Delivered
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Cancelled', order.buyerId)} className="text-destructive">
                                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                                    Cancel Order
                                                                                </DropdownMenuItem>
                                                                            </>
                                                                        )}
                                                                        {order.buyer?.email && (
                                                                            <>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem asChild>
                                                                                    <a href={`mailto:${order.buyer.email}`} className="flex items-center gap-2">
                                                                                        <MessageSquare className="h-4 w-4"/>
                                                                                        Message Buyer
                                                                                    </a>
                                                                                </DropdownMenuItem>
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Order Details #{order.id?.substring(0, 6)}</DialogTitle>
                                                                        <DialogDescription>Full contact and shipping information for this order.</DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4 py-4">
                                                                        <div>
                                                                            <h4 className="font-semibold text-lg mb-3">Buyer Information</h4>
                                                                            <div className="flex items-center gap-4 mb-4">
                                                                                <Avatar>
                                                                                    <AvatarImage src={order.buyer?.avatar} />
                                                                                    <AvatarFallback>{order.buyer?.name?.charAt(0)}</AvatarFallback>
                                                                                </Avatar>
                                                                                <div>
                                                                                    <p className="font-medium">{order.buyer?.name}</p>
                                                                                    <p className="text-sm text-muted-foreground">{order.buyer?.email}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2 rounded-md border p-4 bg-muted/50">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                                                    <span>{order.contact}</span>
                                                                                </div>
                                                                                <div className="flex items-start gap-2">
                                                                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                                                                    <span>{order.address}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-semibold text-lg mb-3">Order Items</h4>
                                                                            <div className="space-y-2">
                                                                                {order.items.map(item => (
                                                                                    <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                                        <span>{item.name} × {item.quantity}</span>
                                                                                        <span className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</span>
                                                                                    </div>
                                                                                ))}
                                                                                <div className="flex justify-between items-center p-2 bg-primary/10 rounded font-semibold">
                                                                                    <span>Total</span>
                                                                                    <span>৳{orderTotal.toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {order.items.map(item => (
                                                            <div key={item.id} className="text-sm text-muted-foreground">
                                                                {item.name} × {item.quantity}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t">
                                                        <span className="font-semibold">Total: ৳{orderTotal.toFixed(2)}</span>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <UserIcon className="h-3 w-3" />
                                                            {order.buyer?.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                {searchTerm || orderFilter !== 'all' ? (
                                    <div className="space-y-4">
                                        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                        <div>
                                            <p className="text-lg font-medium">No orders found</p>
                                            <p className="text-muted-foreground">Try adjusting your search or filter</p>
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            <Button variant="outline" onClick={() => setSearchTerm('')}>
                                                Clear Search
                                            </Button>
                                            <Button variant="outline" onClick={() => setOrderFilter('all')}>
                                                Clear Filter
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                        <div>
                                            <p className="text-lg font-medium">No orders yet</p>
                                            <p className="text-muted-foreground">Orders will appear here when customers place them</p>
                                        </div>
                                        <Button asChild variant="outline">
                                            <Link href="/dashboard/add-product">
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Add More Dishes
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}