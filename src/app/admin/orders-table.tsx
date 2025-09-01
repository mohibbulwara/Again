
'use client';

import { useState, useEffect } from 'react';
import type { Order, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Package, CheckCircle, XCircle, Clock, AlertTriangle, FileDown, Trash2, MoreVertical } from 'lucide-react';
import { exportOrdersToPDF } from '@/lib/pdf-generator';
import { getUserById } from '@/lib/services/user-service';
import { deleteOrder } from '@/lib/actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"

const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Preparing': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

const OrderStatusIcon = ({ status }: { status: Order['status'] }) => {
    switch (status) {
        case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'Preparing': return <Package className="h-4 w-4 text-blue-500" />;
        case 'Delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'Cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
    }
};

const HIGH_VALUE_THRESHOLD = 10000;

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [page, setPage] = useState(1);
    const [sellerNames, setSellerNames] = useState<{ [key: string]: string }>({});
    const [loadingSellers, setLoadingSellers] = useState(true);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<Order['status'] | 'All'>('All');
    const [contactSellerInfo, setContactSellerInfo] = useState<{ sellerId: string; open: boolean }>({ sellerId: '', open: false });
    const [sellerDetails, setSellerDetails] = useState<User | null>(null);

    const itemsPerPage = 10;

    useEffect(() => {
        const fetchSellerNames = async () => {
            const uniqueSellerIds = Array.from(new Set(initialOrders.flatMap(order => order.sellerIds)));
            const names: { [key: string]: string } = {};
            for (const sellerId of uniqueSellerIds) {
                const seller = await getUserById(sellerId);
                if (seller) {
                    names[sellerId] = seller.shopName || seller.name;
                } else {
                    console.warn(`Seller with ID ${sellerId} not found for order(s).`);
                    names[sellerId] = 'Unknown Seller (ID: ' + sellerId.substring(0, 6) + '...)';
                }
            }
            setSellerNames(names);
            setLoadingSellers(false);
        };

        fetchSellerNames();
    }, [initialOrders]);

    useEffect(() => {
        const fetchSellerDetails = async () => {
            if (contactSellerInfo.sellerId && contactSellerInfo.open) {
                const seller = await getUserById(contactSellerInfo.sellerId);
                setSellerDetails(seller);
            } else {
                setSellerDetails(null);
            }
        };

        fetchSellerDetails();
    }, [contactSellerInfo]);

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handleExport = () => {
        exportOrdersToPDF(paginatedOrders, sellerNames, filterStatus === 'All' ? 'All Orders' : `${filterStatus} Orders`);
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!orderId) return;
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        setDeletingOrderId(orderId);
        try {
            const result = await deleteOrder(orderId);
            if (result.success) {
                setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                alert('Order deleted successfully!');
            } else {
                alert(`Failed to delete order: ${result.error}`);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('An error occurred while deleting the order.');
        } finally {
            setDeletingOrderId(null);
        }
    };

    const handleContactSeller = (sellerId: string) => {
        setContactSellerInfo({ sellerId, open: true });
    };

    const closeContactSeller = () => {
        setContactSellerInfo({ sellerId: '', open: false });
    };

    return (
         <Card>
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Order Management</CardTitle>
                        <CardDescription>A list of all orders on the platform.</CardDescription>
                    </div>
                    <Button onClick={handleExport} variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
                <div className="flex space-x-2 mt-4">
                    <Button 
                        variant={filterStatus === 'All' ? 'default' : 'outline'} 
                        onClick={() => setFilterStatus('All')}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button 
                        variant={filterStatus === 'Pending' ? 'default' : 'outline'} 
                        onClick={() => setFilterStatus('Pending')}
                        size="sm"
                    >
                        Pending
                    </Button>
                    <Button 
                        variant={filterStatus === 'Preparing' ? 'default' : 'outline'} 
                        onClick={() => setFilterStatus('Preparing')}
                        size="sm"
                    >
                        Preparing
                    </Button>
                    <Button 
                        variant={filterStatus === 'Delivered' ? 'default' : 'outline'} 
                        onClick={() => setFilterStatus('Delivered')}
                        size="sm"
                    >
                        Delivered
                    </Button>
                    <Button 
                        variant={filterStatus === 'Cancelled' ? 'destructive' : 'outline'} 
                        onClick={() => setFilterStatus('Cancelled')}
                        size="sm"
                    >
                        Cancelled
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Buyer ID</TableHead>
                            <TableHead>Seller ID(s)</TableHead>
                            <TableHead>Seller Name(s)</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                            <TableHead>Contact</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingSellers ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">Loading sellers...</TableCell>
                            </TableRow>
                        ) : paginatedOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">No orders found for selected filter.</TableCell>
                            </TableRow>
                        ) : (
                            paginatedOrders.map(order => {
                                const isHighValue = order.total >= HIGH_VALUE_THRESHOLD;
                                const sellersInfo = order.sellerIds.map(sellerId => ({
                                    id: sellerId,
                                    name: sellerNames[sellerId] || 'N/A'
                                }));

                                return (
                                    <TableRow key={order.id} className={isHighValue ? 'bg-destructive/10' : ''}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                            {isHighValue && (
                                                <span title="High-Value Order">
                                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                                </span>
                                            )}
                                                <span className="font-medium">#{order.id?.substring(0, 6)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.createdAt ? format(new Date(order.createdAt as string), 'PPpp') : 'N/A'}</TableCell>
                                        <TableCell className="font-mono text-xs">{order.buyerId}</TableCell>
                                        <TableCell>
                                            {sellersInfo.map(s => <div key={s.id} className="font-mono text-xs">{s.id}</div>)}
                                        </TableCell>
                                        <TableCell>
                                            {sellersInfo.map(s => <div key={s.id}>{s.name}</div>)}
                                        </TableCell>
                                        <TableCell>৳{order.total.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)} className="capitalize flex items-center gap-1 w-fit">
                                                <OrderStatusIcon status={order.status} />
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => order.id && handleDeleteOrder(order.id)}
                                                disabled={deletingOrderId === order.id}
                                            >
                                                {deletingOrderId === order.id ? 'Deleting...' : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleContactSeller(order.sellerIds[0])}>
                                                        Contact Seller
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                 </Table>
                 <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
                    </div>
                </div>
            </CardContent>
            <AlertDialog open={contactSellerInfo.open} onOpenChange={closeContactSeller}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Contact Seller</AlertDialogTitle>
                        <AlertDialogDescription>
                            {sellerDetails ? (
                                <div>
                                    <div>Phone: {sellerDetails.phone || 'Not provided'}</div>
                                    <div>Email: {sellerDetails.email}</div>
                                </div>
                            ) : (
                                <div>Loading seller information...</div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeContactSeller}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
