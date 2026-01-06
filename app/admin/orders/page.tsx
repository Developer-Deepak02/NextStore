"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, Search, Filter, Eye, Truck, CheckCircle2, XCircle, 
  CreditCard, MapPin, Package, AlertTriangle, ShoppingBag, X 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string; 
  user_id: string;
  user?: {
    full_name: string;
    email: string;
    city: string;
    country: string;
  };
};

export default function AdminOrdersPage() {
    const supabase = createClient();
    const { formatCurrency } = useCurrency();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      toast.error("Failed to load orders");
      setLoading(false);
      return;
    }

    const userIds = ordersData.map(o => o.user_id).filter(Boolean);
    const { data: usersData } = await supabase
        .from("users")
        .select("id, full_name, email, city, country")
        .in("id", userIds);

    const combinedOrders = ordersData.map(order => ({
        ...order,
        user: usersData?.find(u => u.id === order.user_id)
    }));

    setOrders(combinedOrders as any);
    setLoading(false);
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    // 1. Update Database
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // 2. Update Local State (Optimistic UI)
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
      
      // 3. Update Modal State if open (Fixes "Dynamic" issue immediately)
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } else {
        console.error(error);
        toast.error("Failed to update status. Check console.");
    }
  };

  const confirmCancelOrder = async () => {
      if (!orderToCancel) return;
      await handleStatusUpdate(orderToCancel, 'cancelled');
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
  };

  // --- HELPER: Normalize Status ---
  // Ensures 'Pending', 'pending', and null are treated identically
  const normalizeStatus = (status: string | null | undefined) => {
      return (status || 'pending').toLowerCase();
  };

  const canTransition = (current: string, target: string) => {
      const c = normalizeStatus(current);
      if (c === 'cancelled' || c === 'delivered') return false;
      if (c === 'pending') return true;
      if (c === 'processing') return ['shipped', 'delivered', 'cancelled'].includes(target);
      if (c === 'shipped') return ['delivered', 'cancelled'].includes(target);
      return false;
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.user?.full_name?.toLowerCase().includes(search.toLowerCase());
    
    const currentStatus = normalizeStatus(o.status);
    const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(normalizeStatus(status)) {
        case 'delivered': return <Badge className="bg-emerald-500/15 text-emerald-600 border-none">Delivered</Badge>;
        case 'shipped': return <Badge className="bg-blue-500/15 text-blue-600 border-none">Shipped</Badge>;
        case 'processing': return <Badge className="bg-orange-500/15 text-orange-600 border-none">Processing</Badge>;
        case 'cancelled': return <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-none">Cancelled</Badge>;
        default: return <Badge variant="secondary" className="bg-slate-500/15 text-slate-600 border-none">Pending</Badge>;
    }
  };

  // --- DYNAMIC TIMELINE COMPONENT ---
  const TimelineItem = ({ 
    active, completed, icon: Icon, label, date, isLast 
  }: { 
    active: boolean, completed: boolean, icon: any, label: string, date?: string, isLast?: boolean 
  }) => (
    <div className="relative pl-8 pb-8">
      {!isLast && (
        <div className={cn("absolute left-[11px] top-8 h-full w-[2px]", completed ? "bg-primary" : "bg-muted")} />
      )}
      <div className={cn(
        "absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-card z-10 transition-all duration-300",
        completed ? "bg-primary text-primary-foreground" : 
        active ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className={cn("flex flex-col -mt-1 transition-opacity duration-300", !active && !completed ? "opacity-50" : "opacity-100")}>
        <span className="text-sm font-semibold">{label}</span>
        {date && <span className="text-xs text-muted-foreground mt-0.5 font-mono">{date}</span>}
      </div>
    </div>
  );

  // Helper to extract safe status for modal logic
  const modalStatus = selectedOrder ? normalizeStatus(selectedOrder.status) : 'pending';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search Order ID or Customer..." 
                    className="pl-8 bg-card border-none shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className={cn("bg-card border-none shadow-sm", statusFilter !== 'all' && "text-primary bg-primary/10")}>
                        <Filter className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-none shadow-xl">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="capitalize">
                            {s}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {statusFilter !== "all" && (
          <div className="flex items-center animate-in fade-in slide-in-from-left-2">
              <Badge variant="secondary" className="px-3 py-1 gap-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  Status: <span className="font-bold capitalize">{statusFilter}</span>
                  <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-red-500 focus:outline-none"><X className="h-3 w-3" /></button>
              </Badge>
          </div>
      )}

      <div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-xl border-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                 [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={6} className="h-16 animate-pulse bg-secondary/10 border-none" /></TableRow>)
            ) : filteredOrders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground border-none">
                        No orders found matching your filters.
                    </TableCell>
                </TableRow>
            ) : (
                filteredOrders.map((order) => {
                    const status = normalizeStatus(order.status);
                    return (
                        <TableRow key={order.id} className="hover:bg-secondary/30 border-b border-border/5">
                            <TableCell className="font-mono text-xs font-medium">{order.id.slice(0, 8)}...</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{order.user?.full_name || "Guest"}</span>
                                    <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {format(new Date(order.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="font-medium">
                                {formatCurrency(order.total_amount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="ghost" size="icon" 
                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                        onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="border-none shadow-xl">
                                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                            
                                            <DropdownMenuItem 
                                                disabled={!canTransition(status, 'processing')}
                                                onClick={() => handleStatusUpdate(order.id, 'processing')}
                                            >
                                                <Package className="mr-2 h-4 w-4" /> Mark Processing
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                disabled={!canTransition(status, 'shipped')}
                                                onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                            >
                                                <Truck className="mr-2 h-4 w-4" /> Mark Shipped
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                disabled={!canTransition(status, 'delivered')}
                                                onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Delivered
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem 
                                                className="text-red-500 focus:text-red-500 focus:bg-red-50"
                                                disabled={!canTransition(status, 'cancelled')}
                                                onClick={() => { setOrderToCancel(order.id); setIsCancelModalOpen(true); }}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
         <DialogContent className="max-w-2xl border-none shadow-2xl bg-card">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                    Order #{selectedOrder?.id.slice(0, 8)}
                    {selectedOrder && getStatusBadge(modalStatus)}
                </DialogTitle>
                <DialogDescription>
                    Placed on {selectedOrder && format(new Date(selectedOrder.created_at), "PPP 'at' p")}
                </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tracking</h4>
                        <div className="mt-2">
                             {modalStatus === 'cancelled' ? (
                                 <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 animate-in fade-in zoom-in">
                                     <XCircle className="h-6 w-6" />
                                     <div>
                                         <p className="font-bold">Order Cancelled</p>
                                         <p className="text-xs opacity-80">This order has been cancelled.</p>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="pt-2">
                                     <TimelineItem 
                                        active={false} 
                                        completed={true} // Order placed is always done
                                        icon={ShoppingBag} 
                                        label="Order Placed" 
                                        date={format(new Date(selectedOrder.created_at), "MMM d, h:mm a")} 
                                     />
                                     <TimelineItem 
                                        active={modalStatus === 'processing'} 
                                        completed={['shipped', 'delivered'].includes(modalStatus)} 
                                        icon={Package} 
                                        label="Processing" 
                                     />
                                     <TimelineItem 
                                        active={modalStatus === 'shipped'} 
                                        completed={modalStatus === 'delivered'} 
                                        icon={Truck} 
                                        label="Shipped" 
                                        date={['shipped', 'delivered'].includes(modalStatus) ? "TRK-9821" : undefined}
                                     />
                                     <TimelineItem 
                                        active={false}
                                        completed={modalStatus === 'delivered'} 
                                        icon={CheckCircle2} 
                                        label="Delivered" 
                                        isLast
                                     />
                                 </div>
                             )}
                        </div>
                    </div>
                    
                    {/* ... (Right Column - Address/Payment) ... */}
                    <div className="space-y-6">
                        <div>
                             <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Payment Info</h4>
                             <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">Visa ending in 4242</p>
                                    <p className="text-xs text-muted-foreground">Processed securely via Stripe</p>
                                </div>
                             </div>
                        </div>

                        <div>
                             <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shipping Address</h4>
                             <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">{selectedOrder.user?.full_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedOrder.user?.city || "123 Main St"}, {selectedOrder.user?.country || "USA"}
                                        <br />
                                        Postal Code: 10001
                                    </p>
                                </div>
                             </div>
                        </div>

                         <div>
                             <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Summary</h4>
                             <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <span className="text-sm font-medium">Total Amount</span>
                                <span className="text-lg font-bold text-primary">{formatCurrency(selectedOrder.total_amount)}</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
      
      {/* --- CANCEL MODAL --- */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="border-none shadow-2xl bg-card">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Cancel Order?
                </DialogTitle>
                <DialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>Keep Order</Button>
                <Button variant="destructive" onClick={confirmCancelOrder}>Yes, Cancel Order</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}