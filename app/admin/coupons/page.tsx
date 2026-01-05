"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Trash2, TicketPercent, MoreVertical, 
  Search, Wand2, Power, Download, AlertCircle, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { format, isPast } from "date-fns";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  discount_type: 'percent' | 'fixed';
  min_order_value: number;
  max_discount: number | null;
  valid_until: string;
  is_active: boolean;
  usage_limit: number | null;
  times_used: number;
  created_at: string;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount: 10,
    type: "percent" as "percent" | "fixed",
    validUntil: "",
    minOrder: 0,
    maxDiscount: "",
    usageLimit: ""
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setCoupons(data as any);
    setLoading(false);
  }

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  const exportCSV = () => {
    const headers = ["Code,Type,Value,Used,Limit,Status,Expires"];
    const rows = coupons.map(c => {
        const status = isPast(new Date(c.valid_until)) ? "Expired" : c.is_active ? "Active" : "Disabled";
        return `${c.code},${c.discount_type},${c.discount_percent},${c.times_used},${c.usage_limit || "∞"},${status},${format(new Date(c.valid_until), 'yyyy-MM-dd')}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "coupons_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.validUntil) {
      toast.error("Code and Expiry Date are required");
      return;
    }
    if (new Date(formData.validUntil) < new Date()) {
        toast.error("Expiry date cannot be in the past");
        return;
    }
    if (formData.discount <= 0) {
        toast.error("Discount value must be greater than 0");
        return;
    }

    setCreating(true);
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: formData.code.toUpperCase(),
        discount_percent: formData.discount,
        discount_type: formData.type,
        valid_until: new Date(formData.validUntil).toISOString(),
        min_order_value: formData.minOrder,
        max_discount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usage_limit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      setCoupons([data as any, ...coupons]);
      toast.success("Coupon created successfully");
      setIsModalOpen(false);
      resetForm();
    }
    setCreating(false);
  };

  const resetForm = () => {
      setFormData({
        code: "", discount: 10, type: "percent", validUntil: "",
        minOrder: 0, maxDiscount: "", usageLimit: ""
      });
      setShowAdvanced(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
      const { error } = await supabase
          .from("coupons")
          .update({ is_active: !currentStatus })
          .eq("id", id);
      
      if (!error) {
          setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
          toast.success(currentStatus ? "Coupon disabled" : "Coupon activated");
      }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure? This action cannot be undone.")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (!error) {
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success("Coupon deleted");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
            <p className="text-muted-foreground">Manage discount codes and promotions.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Button without ugly border */}
            <Button variant="ghost" size="icon" className="bg-secondary/30 hover:bg-secondary/50" onClick={exportCSV} title="Export CSV">
                <Download className="h-4 w-4" />
            </Button>

            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                {/* Search Input without border */}
                <Input 
                    placeholder="Search code..." 
                    className="pl-8 bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-md border-none">
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                
                {/* Code Input */}
                <div className="grid gap-2">
                    <Label>Coupon Code</Label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g. SUMMER25" 
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            className="uppercase font-mono tracking-wider font-bold bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                        />
                        <Button variant="ghost" className="bg-secondary/30 hover:bg-secondary/50" onClick={generateCode} title="Generate Random">
                            <Wand2 className="h-4 w-4" />
                        </Button>
                    </div>
                    {formData.code && <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Code available</p>}
                </div>

                {/* Values */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        {/* Select without border */}
                        <select 
                            className="flex h-10 w-full rounded-md bg-secondary/30 border-none px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                        >
                            <option value="percent">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Value</Label>
                        <div className="relative">
                            <Input 
                                type="number" min="1" 
                                value={formData.discount}
                                onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value)})}
                                className="pl-8 bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                            <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">
                                {formData.type === 'percent' ? '%' : '$'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Valid Until</Label>
                    <Input 
                        type="datetime-local" 
                        value={formData.validUntil}
                        className="bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                        min={new Date().toISOString().slice(0, 16)} 
                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    />
                </div>

                {/* Advanced Options - Removed Ugly Border */}
                <div className="rounded-lg p-3 space-y-3 bg-secondary/20">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors">
                        <span>Advanced Rules (Optional)</span>
                    </button>
                    
                    {showAdvanced && (
                        <div className="grid gap-4 pt-2 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs">Min Order ($)</Label>
                                    <Input 
                                        type="number" min="0" placeholder="0"
                                        className="bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                                        value={formData.minOrder}
                                        onChange={(e) => setFormData({...formData, minOrder: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs">Max Discount ($)</Label>
                                    <Input 
                                        type="number" min="0" placeholder="No Limit"
                                        className="bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                                        disabled={formData.type === 'fixed'}
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs">Usage Limit (Total uses)</Label>
                                <Input 
                                    type="number" min="1" placeholder="Unlimited"
                                    className="bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                />
                            </div>
                        </div>
                    )}
                </div>

                </div>
                <DialogFooter>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                    {creating ? "Creating..." : "Create Coupon"}
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-md overflow-hidden border-none">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
              <TableHead>Code</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="h-16 animate-pulse bg-secondary/10 border-none" /></TableRow>)
            ) : filteredCoupons.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground border-none">
                        <TicketPercent className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        No coupons found.
                    </TableCell>
                </TableRow>
            ) : (
                filteredCoupons.map((coupon) => {
                    const expiryDate = new Date(coupon.valid_until);
                    const isExpired = isPast(expiryDate);
                    const isSoldOut = coupon.usage_limit && coupon.times_used >= coupon.usage_limit;
                    
                    const percentUsed = coupon.usage_limit ? Math.min(100, (coupon.times_used / coupon.usage_limit) * 100) : 0;
                    
                    return (
                        <TableRow key={coupon.id} className={`hover:bg-secondary/30 transition-colors border-b border-border/10 ${isExpired ? 'opacity-50' : ''}`}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-mono font-bold text-lg tracking-wide text-primary">{coupon.code}</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {isExpired && <AlertCircle className="h-3 w-3 text-red-500" />}
                                        Expires: {format(expiryDate, 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                    {coupon.discount_type === 'percent' ? `${coupon.discount_percent}% OFF` : `$${coupon.discount_percent} FLAT`}
                                </Badge>
                            </TableCell>
                            <TableCell className="w-[200px]">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{coupon.times_used} used</span>
                                    <span className="text-muted-foreground">{coupon.usage_limit ? `/ ${coupon.usage_limit}` : "Unlimited"}</span>
                                </div>
                                {coupon.usage_limit ? (
                                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${percentUsed >= 100 ? 'bg-red-500' : 'bg-primary'}`} 
                                            style={{ width: `${percentUsed}%` }} 
                                        />
                                    </div>
                                ) : (
                                    <div className="h-2 w-full bg-secondary/30 rounded-full" />
                                )}
                            </TableCell>
                            <TableCell>
                                {isExpired ? (
                                    <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 shadow-none border-none">Expired</Badge>
                                ) : isSoldOut ? (
                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none">Sold Out</Badge>
                                ) : !coupon.is_active ? (
                                    <Badge variant="outline" className="text-muted-foreground border-none bg-secondary/50">Disabled</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-green-600 bg-green-500/10 border-none">Active</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-secondary">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="border-none shadow-xl bg-card">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        
                                        {!isExpired && (
                                            <DropdownMenuItem onClick={() => toggleStatus(coupon.id, coupon.is_active)} className="cursor-pointer">
                                                <Power className="mr-2 h-4 w-4" /> {coupon.is_active ? "Disable" : "Enable"}
                                            </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuItem onClick={() => handleDelete(coupon.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}