import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  unit: string | null;
  hsn_sac: string | null;
  gst_rate: number;
  is_service: boolean;
}

export const ProductManager = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    unit_price: 0,
    unit: "piece",
    hsn_sac: "",
    gst_rate: 18.00,
    is_service: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      unit_price: 0,
      unit: "piece",
      hsn_sac: "",
      gst_rate: 18.00,
      is_service: false,
    });
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  const handleInputChange = (field: keyof Omit<Product, "id">) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === "unit_price" || field === "gst_rate" 
      ? parseFloat(e.target.value) || 0 
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_service: checked
    }));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.unit_price < 0) {
      toast({
        title: "Error",
        description: "Unit price cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Product updated",
          description: "Product information has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Product added",
          description: "New product has been added successfully.",
        });
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? 'update' : 'add'} product.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingProduct(product);
    setIsAddingProduct(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "Product has been removed successfully.",
      });

      await loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.hsn_sac && product.hsn_sac.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-info to-info text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Product Management</h2>
                <p className="text-white/90">
                  Manage your products and services
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsAddingProduct(true)}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAddingProduct && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product/Service Name *</Label>
                <Input
                  id="productName"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="Product or Service Name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isService"
                  checked={formData.is_service}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isService">This is a service</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                value={formData.description || ""}
                onChange={handleInputChange("description")}
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={handleInputChange("unit_price")}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit || ""}
                  onChange={handleInputChange("unit")}
                  placeholder="piece, kg, hour, etc."
                />
              </div>
              <div>
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Input
                  id="gstRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.gst_rate}
                  onChange={handleInputChange("gst_rate")}
                  placeholder="18.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hsnSac">HSN/SAC Code</Label>
              <Input
                id="hsnSac"
                value={formData.hsn_sac || ""}
                onChange={handleInputChange("hsn_sac")}
                placeholder="HSN/SAC Code"
              />
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleSave} variant="success">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
              <Button onClick={resetForm} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products & Services ({products.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {products.length === 0 ? "No products added yet" : "No products match your search"}
              </p>
              {products.length === 0 && (
                <Button
                  onClick={() => setIsAddingProduct(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {product.is_service && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Service
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          ₹{product.unit_price.toFixed(2)}
                          {product.unit && <span className="text-sm text-muted-foreground">/{product.unit}</span>}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {product.description && (
                        <p className="text-muted-foreground">{product.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">GST: {product.gst_rate}%</span>
                        {product.hsn_sac && (
                          <span className="text-xs text-muted-foreground">
                            HSN/SAC: {product.hsn_sac}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};