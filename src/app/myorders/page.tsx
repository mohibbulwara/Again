
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import type { Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CancelOrderButton } from '@/components/cancel-order-button';

export default function OrdersPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'buyer') {
      router.push('/login');
      return;
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('buyerId', '==', user.id)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      orders.sort((a, b) => {
        const timeA = a.createdAt ? (a.createdAt as any).toMillis() : 0;
        const timeB = b.createdAt ? (b.createdAt as any).toMillis() : 0;
        return timeB - timeA;
      });
      setUserOrders(orders);
    });

    return () => unsubscribe();
  }, [user, isAuthenticated, loading, router]);

  const handleCancelOrder = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const dishId = order.items[0].id;
      router.push(`/dish/${dishId}`);
    } else {
      toast({
        title: 'Error',
        description: 'Could not find the dish associated with this order.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !user || user.role !== 'buyer') {
    return <div className="container py-12 text-center">Loading or redirecting...</div>;
  }

  const getStatusVariant = (status: Order['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Preparing': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">My Orders</h1>
        <p className="text-muted-foreground">View your order history below.</p>
      </div>

      <div className="space-y-6">
        {userOrders.length > 0 ? (
          userOrders.map(order => (
            <Card key={order.id} className={order.status === 'Cancelled' ? 'bg-muted/30' : ''}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id?.substring(0, 6)}</CardTitle>
                  <CardDescription>
                    Placed on {format((order.createdAt as any).toDate(), 'MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(order.status)} className="capitalize">
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-4">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                          />
                          <div>
                            <Link href={`/dish/${item.id}`} passHref>
                              <p className="font-semibold hover:underline">{item.name}</p>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} x ৳{item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">৳{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No items found for this order.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
                <div className="text-right">
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">৳{order.total.toFixed(2)}</p>
                </div>
                {(order.status === 'Pending' || order.status === 'Preparing') && (
                  <CancelOrderButton onConfirm={() => handleCancelOrder(order)} />
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">You have no orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
