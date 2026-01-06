"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreVertical, Search, Download, Ban, CheckCircle2, 
  MapPin, Mail, Filter, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  status: 'active' | 'blocked' | 'suspended';
  city: string;
  country: string;
  orders: { id: string; total: number }[]; 
};

export default function AdminUsersPage() {
    const supabase = createClient();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data: usersData, error: usersError } = await supabase
      .from("users").select("*").order("created_at", { ascending: false });

    if (usersError) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const { data: ordersData } = await supabase
      .from("orders").select("id, total_amount, user_id"); 

    const combinedUsers = usersData.map((user: any) => {
        const userOrders = ordersData?.filter((o: any) => o.user_id === user.id) || [];
        const formattedOrders = userOrders.map((o: any) => ({
            id: o.id,
            total: o.total_amount || 0 
        }));
        return { ...user, orders: formattedOrders };
    });

    setUsers(combinedUsers);
    setLoading(false);
  }

  const handleBulkBlockConfirm = async () => {
      const { error } = await supabase
        .from("users")
        .update({ status: 'blocked' })
        .in("id", selectedUsers);

      if (!error) {
          setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'blocked' } : u));
          setSelectedUsers([]);
          setIsBlockModalOpen(false);
          toast.success(`${selectedUsers.length} users blocked successfully`);
      }
  };

  const exportCSV = () => {
     const headers = ["Name,Email,Role,Status,Orders,Total Spent,Location,Joined"];
    const rows = users.map(u => {
        const totalSpent = u.orders.reduce((acc, o) => acc + o.total, 0);
        return `${u.full_name},${u.email},${u.role},${u.status},${u.orders.length},${totalSpent},"${u.city}, ${u.country}",${format(new Date(u.created_at), 'yyyy-MM-dd')}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "customers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredUsers = () => {
    let filtered = users.filter(u => 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.city?.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === "spent") {
        filtered.sort((a, b) => {
            const spentA = a.orders.reduce((sum, o) => sum + o.total, 0);
            const spentB = b.orders.reduce((sum, o) => sum + o.total, 0);
            return spentB - spentA;
        });
    } else if (sort === "orders") {
        filtered.sort((a, b) => b.orders.length - a.orders.length);
    } else {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return filtered;
  };

  const displayedUsers = getFilteredUsers();
  
  // FIX: Only consider "Active" users for the "Select All" logic
  const activeDisplayedUsers = displayedUsers.filter(u => u.status !== 'blocked');
  const allSelected = activeDisplayedUsers.length > 0 && selectedUsers.length === activeDisplayedUsers.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">View and manage your store's user base.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
             {selectedUsers.length > 0 && (
                <Button variant="destructive" size="sm" onClick={() => setIsBlockModalOpen(true)} className="animate-in fade-in zoom-in">
                    <Ban className="mr-2 h-4 w-4" /> Block ({selectedUsers.length})
                </Button>
            )}
            
            <Button variant="ghost" size="icon" className="bg-secondary/30 hover:bg-secondary/50" onClick={exportCSV}>
                <Download className="h-4 w-4" />
            </Button>

            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search customers..." 
                    className="pl-8 bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-secondary/30 hover:bg-secondary/50">
                        <Filter className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-none shadow-xl">
                    <DropdownMenuItem onClick={() => setSort("newest")}>Newest Joined</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("spent")}>Highest Spender</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("orders")}>Most Orders</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-md overflow-hidden border-none">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
              <TableHead className="w-[50px]">
                <Checkbox 
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            // FIX: Only select users who are NOT blocked
                            setSelectedUsers(activeDisplayedUsers.map(u => u.id));
                        } else {
                            setSelectedUsers([]);
                        }
                    }}
                />
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={6} className="h-16 animate-pulse bg-secondary/10 border-none" /></TableRow>)
            ) : displayedUsers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground border-none">
                        No customers found matching your search.
                    </TableCell>
                </TableRow>
            ) : (
                displayedUsers.map((user) => {
                    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
                    const isSelected = selectedUsers.includes(user.id);
                    
                    return (
                        <TableRow 
                            key={user.id} 
                            className={`cursor-pointer transition-colors border-b border-border/10 ${user.status === 'blocked' ? 'opacity-60 bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-secondary/30'}`}
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                             <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox 
                                    checked={isSelected}
                                    disabled={user.status === 'blocked'} 
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedUsers([...selectedUsers, user.id]);
                                        else setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                    }}
                                />
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-none">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{user.full_name || "Guest User"}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" /> {user.email}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {user.status === 'active' ? (
                                    <Badge variant="outline" className="text-green-600 bg-green-500/10 border-none gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Active
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-none gap-1 shadow-none">
                                        <Ban className="h-3 w-3" /> Blocked
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-secondary/50 font-mono">
                                    {user.orders.length} Order{user.orders.length !== 1 && 's'}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-primary">
                                ${totalSpent.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {user.city || "Unknown"}, {user.country || "USA"}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Modal - FIXED STYLING */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="border-none shadow-2xl bg-card">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Block {selectedUsers.length} Users?
                </DialogTitle>
                <DialogDescription>
                    These users will immediately lose access to their accounts. They will not be able to log in or place new orders.
                    <br/><br/>
                    Are you sure you want to proceed?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsBlockModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleBulkBlockConfirm}>Yes, Block Users</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}