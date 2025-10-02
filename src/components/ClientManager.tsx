import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  gstin: string | null;
  company_name: string | null;
}

export const ClientManager = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin_code: "",
    gstin: "",
    company_name: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pin_code: "",
      gstin: "",
      company_name: "",
    });
    setIsAddingClient(false);
    setEditingClient(null);
  };

  const handleInputChange = (field: keyof Omit<Client, "id">) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load clients.",
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
        description: "Client name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id);

        if (error) throw error;

        toast({
          title: "Client updated",
          description: "Client information has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Client added",
          description: "New client has been added successfully.",
        });
      }

      await loadClients();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingClient ? 'update' : 'add'} client.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingClient(client);
    setIsAddingClient(true);
  };

  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: "Client has been removed successfully.",
      });

      await loadClients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client.",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-success to-success text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Client Management</h2>
                <p className="text-white/90">
                  Manage your client database
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsAddingClient(true)}
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAddingClient && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClient ? "Edit Client" : "Add New Client"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="Client Name"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.company_name || ""}
                  onChange={handleInputChange("company_name")}
                  placeholder="Company Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange("email")}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={formData.phone || ""}
                  onChange={handleInputChange("phone")}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientAddress">Address</Label>
              <Textarea
                id="clientAddress"
                value={formData.address || ""}
                onChange={handleInputChange("address")}
                placeholder="Street Address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city || ""} onChange={handleInputChange("city")} placeholder="City"/>
                </div>
                <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={formData.state || ""} onChange={handleInputChange("state")} placeholder="State"/>
                </div>
                <div>
                    <Label htmlFor="pin_code">Pin Code</Label>
                    <Input id="pin_code" value={formData.pin_code || ""} onChange={handleInputChange("pin_code")} placeholder="Pin Code"/>
                </div>
            </div>

            <div>
                <Label htmlFor="clientGstin">GSTIN</Label>
                <Input
                  id="clientGstin"
                  value={formData.gstin || ""}
                  onChange={handleInputChange("gstin")}
                  placeholder="22AAAAA0000A1Z5"
                />
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleSave} variant="success">
                {editingClient ? "Update Client" : "Add Client"}
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
            <CardTitle>Clients ({clients.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {clients.length === 0 ? "No clients added yet" : "No clients match your search"}
              </p>
              {clients.length === 0 && (
                <Button
                  onClick={() => setIsAddingClient(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {client.company_name && (
                        <p className="text-muted-foreground font-medium">{client.company_name}</p>
                      )}
                       {client.address && (
                        <p className="text-muted-foreground">{client.address}, {client.city}, {client.state} - {client.pin_code}</p>
                      )}
                      {client.email && (
                        <p className="text-muted-foreground">{client.email}</p>
                      )}
                      {client.phone && (
                        <p className="text-muted-foreground">{client.phone}</p>
                      )}
                      {client.gstin && (
                        <p className="text-xs text-muted-foreground">
                          GSTIN: {client.gstin}
                        </p>
                      )}
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
