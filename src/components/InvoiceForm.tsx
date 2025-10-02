import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { generateInvoiceNumber } from "@/utils/invoiceNumberGenerator";

interface Client {
  id: string;
  name: string;
  company_name: string | null;
}

interface Product {
  id: string;
  name: string;
  unit_price: number;
  gst_rate: number;
  hsn_sac: string | null;
  unit: string | null;
}

interface InvoiceItem {
  id?: string;
  product_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  line_total: number;
  gst_amount: number;
  hsn_sac?: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  status: string;
  client_id: string;
  subtotal: number;
  total_gst: number;
  total_amount: number;
  discount: number;
  notes: string | null;
  gst_payable_reverse_charge?: boolean; // Make field optional for existing data
}

interface InvoiceFormProps {
  invoice?: Invoice | null;
  clients: Client[];
  onSave: () => void;
  onCancel: () => void;
}

export const InvoiceForm = ({ invoice, clients, onSave, onCancel }: InvoiceFormProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<{id: string, company_name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    company_id: "",
    client_id: invoice?.client_id || "",
    invoice_date: invoice?.invoice_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || "",
    status: invoice?.status || "draft",
    discount: invoice?.discount || 0,
    notes: invoice?.notes || "",
    gst_payable_reverse_charge: invoice?.gst_payable_reverse_charge || false, // Add this line

  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      product_id: null,
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      gst_rate: 18,
      line_total: 0,
      gst_amount: 0,
      hsn_sac: "",
    }
  ]);

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
    if (invoice) {
      fetchInvoiceItems();
    }
  }, [invoice]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("company_profile")
        .select("id, company_name")
        .order("company_name", { ascending: true });

      if (error) throw error;
      setCompanies(data || []);
      
      // Auto-select first company if creating new invoice
      if (!invoice && data && data.length > 0) {
        setFormData(prev => ({ ...prev, company_id: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchInvoiceItems = async () => {
    if (!invoice) return;
    
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setItems(data.map(item => ({
          id: item.id,
          product_id: item.product_id,
          item_name: item.item_name,
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          gst_rate: Number(item.gst_rate),
          line_total: Number(item.line_total),
          gst_amount: Number(item.gst_amount),
          hsn_sac: item.hsn_sac,
        })));
      }
    } catch (error) {
      console.error("Error fetching invoice items:", error);
    }
  };

  const calculateItemTotals = (item: InvoiceItem) => {
    const lineTotal = item.quantity * item.unit_price;
    const gstAmount = (lineTotal * item.gst_rate) / 100;
    return { lineTotal, gstAmount };
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If product is selected, auto-fill details
    if (field === 'product_id' && value && value !== "custom") {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].item_name = product.name;
        newItems[index].unit_price = product.unit_price;
        newItems[index].gst_rate = product.gst_rate;
        newItems[index].hsn_sac = product.hsn_sac || "";
      }
    } else if (field === 'product_id' && value === "custom") {
      // Clear product-specific fields for custom items
      newItems[index].product_id = null;
      newItems[index].item_name = "";
      newItems[index].unit_price = 0;
      newItems[index].gst_rate = 18;
      newItems[index].hsn_sac = "";
    }

    // Recalculate totals
    const { lineTotal, gstAmount } = calculateItemTotals(newItems[index]);
    newItems[index].line_total = lineTotal;
    newItems[index].gst_amount = gstAmount;

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      product_id: null,
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      gst_rate: 18,
      line_total: 0,
      gst_amount: 0,
      hsn_sac: "",
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const totalGst = items.reduce((sum, item) => sum + item.gst_amount, 0);
    const totalAmount = subtotal + totalGst - formData.discount;
    return { subtotal, totalGst, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { subtotal, totalGst, totalAmount } = calculateTotals();
      
      // Validate company selection
      if (!formData.company_id) {
        toast({
          title: "Error",
          description: "Please select a company",
          variant: "destructive",
        });
        return;
      }

      // Generate invoice number for new invoices
      const invoiceNumber = invoice?.invoice_number || await generateInvoiceNumber();

      // Create or update invoice
      const invoiceData = {
        ...formData,
        invoice_number: invoiceNumber,
        subtotal,
        total_gst: totalGst,
        total_amount: totalAmount,
        gst_payable_reverse_charge: formData.gst_payable_reverse_charge // Ensure it's included

      };

      let invoiceId: string;

      if (invoice) {
        // Update existing invoice
        const { error } = await supabase
          .from("invoices")
          .update(invoiceData)
          .eq("id", invoice.id);

        if (error) throw error;
        invoiceId = invoice.id;

        // Delete existing items
        await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", invoice.id);
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single();

        if (error) throw error;
        invoiceId = data.id;
      }

      // Insert invoice items
      const itemsData = items.map(item => ({
        invoice_id: invoiceId,
        product_id: item.product_id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        gst_rate: item.gst_rate,
        line_total: item.line_total,
        gst_amount: item.gst_amount,
        hsn_sac: item.hsn_sac || null,
        
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsData);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: `Invoice ${invoice ? 'updated' : 'created'} successfully`,
      });

      onSave();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: `Failed to ${invoice ? 'update' : 'create'} invoice`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, totalGst, totalAmount } = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>
              {invoice ? 'Edit Invoice' : 'Create New Invoice'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company *</Label>
                <Select 
                  value={formData.company_id} 
                  onValueChange={(value) => setFormData({...formData, company_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client">Client *</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={(value) => setFormData({...formData, client_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  type="date"
                  id="invoice_date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  type="date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Line Items</h3>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid gap-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Product (Optional)</Label>
                            <Select
                              value={item.product_id || ""}
                              onValueChange={(value) => updateItem(index, 'product_id', value === "custom" ? null : value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">Custom Item</SelectItem>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Item Name *</Label>
                            <Input
                              value={item.item_name}
                              onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                              required
                              placeholder="Enter item name"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={item.description || ""}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Item description"
                            rows={2}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>HSN/SAC</Label>
                            <Input
                              value={item.hsn_sac || ""}
                              onChange={(e) => updateItem(index, 'hsn_sac', e.target.value)}
                              placeholder="Enter HSN/SAC code"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>GST Rate (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.gst_rate}
                              onChange={(e) => updateItem(index, 'gst_rate', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Line Total</Label>
                            <Input
                              type="number"
                              value={item.line_total.toFixed(2)}
                              readOnly
                              className="bg-muted"
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discount">Discount Amount</Label>
                    <Input
                      type="number"
                      id="discount"
                      min="0"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes for this invoice"
                      rows={3}
                    />
                  </div>


                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total GST:</span>
                        <span>₹{totalGst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-₹{formData.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total Amount:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                  <div className="space-y-4">
                      {/* ... discount and notes fields ... */}
                      <div className="flex items-center space-x-2 pt-4">
                          <Switch
                              id="gst-reverse-charge"
                              checked={formData.gst_payable_reverse_charge}
                              onCheckedChange={(checked: boolean) => setFormData({...formData, gst_payable_reverse_charge: checked})}
                          />
                          <Label htmlFor="gst-reverse-charge">GST Payable on Reverse Charge</Label>
                      </div>
                      {/* ... totals display ... */}
                  </div>
              </CardContent>
          </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};