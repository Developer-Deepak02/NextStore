"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Mail, MapPin, Calendar, Ban, CheckCircle2, 
  CreditCard, Package, ShoppingBag, AlertTriangle 
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function UserDetailPage() {
    const supabase = createClient();
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  async function fetchUserDetails() {
    setLoading(true);
    const { data: userData, error: userError } = await supabase
      .from("users").select("*").eq("id", id).single();

    if (userError) {
      toast.error("User not found");
      router.push("/admin/users");
      return;
    }

    const { data: ordersData } = await supabase
      .from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false });

    setUser({ ...userData, orders: ordersData || [] });
    setLoading(false);
  }

  // LOGIC FIX: Just opens the modal, doesn't execute yet
  const handleStatusClick = () => {
      setIsStatusModalOpen(true);
  };

  // EXECUTE: actually runs the code
  const confirmStatusChange = async () => {
      const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
      const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", user.id);
      
      if (!error) {
          setUser({ ...user, status: newStatus });
          toast.success(`User ${newStatus === 'blocked' ? 'Blocked' : 'Activated'}`);
          setIsStatusModalOpen(false); // Close Modal
      }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  const totalSpent = user.orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
  const avgOrderValue = user.orders.length > 0 ? totalSpent / user.orders.length : 0;
  const isBlocking = user.status === 'active';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">{user.full_name || "Guest User"}</h1>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span className="font-mono">{user.id}</span> • Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                </p>
            </div>
            <div className="ml-auto">
                 {user.status === 'active' ? (
                    <Button variant="destructive" onClick={handleStatusClick}>
                        <Ban className="mr-2 h-4 w-4" /> Block User
                    </Button>
                ) : (
                    <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleStatusClick}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Unblock User
                    </Button>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Spent</CardTitle>
                    <CreditCard className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{user.orders.length}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
                <Card className="border-none shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Contact Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-secondary p-2 rounded-full"><Mail className="h-4 w-4" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-secondary p-2 rounded-full"><MapPin className="h-4 w-4" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm font-medium">{user.city || "Unknown"}, {user.country || "USA"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-secondary p-2 rounded-full"><Calendar className="h-4 w-4" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Last Active</p>
                                <p className="text-sm font-medium">{format(new Date(), 'MMM d, h:mm a')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-none shadow-sm">
                     <CardHeader><CardTitle className="text-lg">Account Status</CardTitle></CardHeader>
                     <CardContent>
                        {user.status === 'active' ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">Account is Active</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                <Ban className="h-5 w-5" />
                                <span className="font-medium">Account is Blocked</span>
                            </div>
                        )}
                     </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                <Card className="border-none shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Order History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {user.orders.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
                        ) : (
                            <div className="space-y-0">
                                {user.orders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-4  last:border-0 hover:bg-secondary/20 transition-colors">
                                        <div>
                                            <p className="font-medium flex items-center gap-2">
                                                Order #{order.id.slice(0, 8)}
                                                <Badge variant="outline" className="text-xs font-normal">Paid</Badge>
                                            </p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${(order.total_amount || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* --- BEAUTIFUL STATUS CONFIRMATION MODAL --- */}
        <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
            <DialogContent className="border-none shadow-2xl bg-card">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${isBlocking ? 'text-red-600' : 'text-green-600'}`}>
                        {isBlocking ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        {isBlocking ? "Block User?" : "Unblock User?"}
                    </DialogTitle>
                    <DialogDescription>
                        {isBlocking 
                            ? "This user will immediately lose access to their account and won't be able to log in."
                            : "This will restore full access for this user. They will be able to log in and place orders again."
                        }
                        <br/><br/>
                        Are you sure you want to proceed?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {/* CANCEL now just closes the modal, doing nothing else */}
                    <Button variant="ghost" onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
                    
                    <Button 
                        variant={isBlocking ? "destructive" : "default"} 
                        className={!isBlocking ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={confirmStatusChange}
                    >
                        {isBlocking ? "Yes, Block User" : "Yes, Unblock User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}