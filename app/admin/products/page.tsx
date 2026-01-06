"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, MoreVertical, Search, Pencil, Trash2, 
  Image as ImageIcon, UploadCloud, ChevronLeft, ChevronRight, Star, FolderPlus 
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";

// FIXED: Changed 'name' to 'title' to match database
type Product = {
  id: string;
  title: string; 
  price: number;
  stock: number;
  category: string;
  image_url: string;
  images: string[];
  description: string;
  status: 'active' | 'draft';
};

type Category = {
    id: string;
    name: string;
};

export default function AdminProductsPage() {
    const supabase = createClient();
  const { formatCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  // FIXED: Changed 'name' to 'title'
  const [formData, setFormData] = useState({
    title: "", 
    price: "",
    stock: "",
    category: "",
    description: "",
    images: [] as string[],
    status: "active"
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) toast.error("Failed to load products");
    else setProducts(data as any);
    setLoading(false);
  }

  async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*").order("name", { ascending: true });
      if (data) setCategories(data);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file);

        if (uploadError) {
            toast.error(`Failed to upload ${file.name}`);
            continue;
        }
        const { data } = supabase.storage.from("products").getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
    setUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
      setFormData(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
      const newImages = [...formData.images];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newImages.length) return;
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setFormData({ ...formData, images: newImages });
  };

  const handleCreateCategory = async () => {
      if(!newCategoryName.trim()) return;
      const { data, error } = await supabase.from("categories").insert({ name: newCategoryName }).select().single();
      if(error) toast.error("Category failed");
      else {
          setCategories([...categories, data]);
          setFormData({ ...formData, category: data.name });
          setIsCategoryModalOpen(false);
          setNewCategoryName("");
          toast.success("Category created!");
      }
  };

  const handleSubmit = async () => {
      // FIXED: Check 'title' instead of 'name'
      if (!formData.title || !formData.price) {
          toast.error("Product Name (Title) and Price are required");
          return;
      }

      const mainImage = formData.images.length > 0 ? formData.images[0] : null;

      // FIXED: Payload uses 'title' to match database column
      const payload = {
          title: formData.title, 
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          category: formData.category,
          description: formData.description,
          images: formData.images,
          image_url: mainImage,
          status: formData.status
      };

      let error;
      if (editingProduct) {
          const { error: updateError } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
          error = updateError;
      } else {
          const { error: insertError } = await supabase.from("products").insert(payload);
          error = insertError;
      }

      if (error) {
          console.error(error);
          toast.error(error.message);
      } else {
          toast.success(editingProduct ? "Product updated" : "Product created");
          setIsModalOpen(false);
          fetchProducts();
          resetForm();
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Delete this product?")) return;
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
          setProducts(products.filter(p => p.id !== id));
          toast.success("Product deleted");
      }
  };

  const openEdit = (product: Product) => {
      setEditingProduct(product);
      setFormData({
          title: product.title || "", // FIXED: Map title
          price: product.price ? product.price.toString() : "",
          stock: product.stock ? product.stock.toString() : "0",
          category: product.category || "",
          description: product.description || "",
          images: product.images || (product.image_url ? [product.image_url] : []),
          status: product.status || "active"
      });
      setIsModalOpen(true);
  };

  const resetForm = () => {
      setEditingProduct(null);
      setFormData({ title: "", price: "", stock: "", category: "", description: "", images: [], status: "active" });
  };

  // FIXED: Filter by 'title'
  const filteredProducts = products.filter(p => 
      (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage your inventory and catalog.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search products..." 
                    className="pl-8 bg-card border-none shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) resetForm(); }}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-none shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <Label>Product Gallery</Label>
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-background">
                                            <img src={url} alt="Product" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => moveImage(index, 'left')} disabled={index === 0} className="p-1 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                                                <button onClick={() => removeImage(index)} className="p-1 bg-red-500/80 hover:bg-red-500 rounded text-white"><Trash2 className="h-4 w-4" /></button>
                                                <button onClick={() => moveImage(index, 'right')} disabled={index === formData.images.length - 1} className="p-1 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                                            </div>
                                            {index === 0 && (
                                                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"><Star className="h-3 w-3 fill-current" /> Main</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors border-muted-foreground/25">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload multiple images"}</p>
                                    </div>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Product Name</Label>
                                {/* FIXED: Bind to formData.title */}
                                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <div className="flex gap-2">
                                    <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                                        <DialogTrigger asChild><Button variant="outline" size="icon"><FolderPlus className="h-4 w-4" /></Button></DialogTrigger>
                                        <DialogContent className="max-w-sm">
                                            <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
                                            <div className="py-4">
                                                <Label>Category Name</Label>
                                                <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="mt-2" />
                                            </div>
                                            <DialogFooter><Button onClick={handleCreateCategory}>Save Category</Button></DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Price</Label>
                                <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Stock</Label>
                                <Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {editingProduct ? "Save Changes" : "Create Product"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-xl border-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                 [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={6} className="h-16 animate-pulse bg-secondary/10 border-none" /></TableRow>)
            ) : filteredProducts.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground border-none">No products found.</TableCell>
                </TableRow>
            ) : (
                filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-secondary/30 border-b border-border/5">
                        <TableCell>
                            <div className="h-12 w-12 rounded-md bg-secondary overflow-hidden relative border border-border/50">
                                {product.image_url ? (
                                    <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                )}
                                {product.images && product.images.length > 1 && (
                                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1">
                                        +{product.images.length - 1}
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        {/* FIXED: Display title */}
                        <TableCell className="font-medium">{product.title || "Unnamed Product"}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className="font-normal">{product.category || "Uncategorized"}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                            <span className={(product.stock || 0) < 10 ? "text-red-500 font-medium" : "text-green-600"}>
                                {product.stock || 0} in stock
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEdit(product)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-500">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}