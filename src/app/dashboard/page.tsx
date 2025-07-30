"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart as RechartsBarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { BarChart, DollarSign, ShoppingCart } from "lucide-react";
import { ChartTooltip } from "@/components/ChartTooltip";
import { chartConfig } from "@/config/chart";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [sellerDishes, setSellerDishes] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Real-time fetch for seller dishes
    const q = query(collection(db, "dishes"), where("sellerId", "==", user.uid));
    const unsubscribeDishes = onSnapshot(q, (snapshot) => {
      const dishesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSellerDishes(dishesData);
    });

    // Real-time fetch for seller orders
    const ordersQuery = query(collection(db, "orders"), where("sellerId", "==", user.uid));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    });

    return () => {
      unsubscribeDishes();
      unsubscribeOrders();
    };
  }, [user]);

  const handleAvailabilityChange = async (dishId, isAvailable) => {
    try {
      await updateDoc(doc(db, "dishes", dishId), { isAvailable });
      toast.success("Availability updated");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (dishId) => {
    try {
      await deleteDoc(doc(db, "dishes", dishId));
      toast.success("Dish deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const salesData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString("default", { month: "short" });
    const monthlySales = orders
      .filter((order) => {
        const orderDate = order.date ? order.date.toDate?.() || new Date(order.date) : new Date();
        return orderDate.getMonth() === i;
      })
      .reduce((sum, order) => sum + order.total, 0);
    return { month, sales: monthlySales };
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <Button onClick={() => router.push("/seller/add")}>Add New Dish</Button>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳ {averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      {salesData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltip config={chartConfig} />} />
                <Bar dataKey="sales" fill={chartConfig.sales.color} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Dishes Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Dishes</CardTitle>
        </CardHeader>
        <CardContent>
          {sellerDishes.length === 0 ? (
            <p className="text-muted-foreground">No dishes added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerDishes.map((dish) => (
                  <TableRow key={dish.id}>
                    <TableCell>{dish.name}</TableCell>
                    <TableCell>৳ {dish.price}</TableCell>
                    <TableCell>
                      <Switch
                        checked={dish.isAvailable}
                        onCheckedChange={(val) => handleAvailabilityChange(dish.id, val)}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/seller/edit/${dish.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(dish.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.buyerName || "Unknown"}</TableCell>
                    <TableCell>৳ {order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOrderStatusChange(order.id, "shipped")}
                      >
                        Mark Shipped
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOrderStatusChange(order.id, "delivered")}
                      >
                        Mark Delivered
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
