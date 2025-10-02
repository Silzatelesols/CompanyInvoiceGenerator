import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Loader2, Plus, Edit, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageDropzone } from "@/components/ui/image-dropzone";

interface Company {
  id: string;
  company_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  stamp_url: string | null;
  gstin: string | null;
  pan: string | null;
  cin: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
}

export const CompanyManager = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<Company, "id">>({
    company_name: "",
    address: "",
    city: "",
    state: "",
    pin_code: "",
    phone: "",
    email: "",
    website: "",
    logo_url: "",
    stamp_url: "",
    gstin: "",
    pan: "",
    cin: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",
  });

  const resetForm = () => {
    setFormData({
      company_name: "",
      address: "",
      city: "",
      state: "",
      pin_code: "",
      phone: "",
      email: "",
      website: "",
      logo_url: "",
      stamp_url: "",
      gstin: "",
      pan: "",
      cin: "",
      bank_name: "",
      bank_account_number: "",
      bank_ifsc: "",
    });
    setIsAddingCompany(false);
    setEditingCompany(null);
  };

  const handleInputChange = (field: keyof Omit<Company, "id">) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load companies.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company_name.trim()) {
      toast({
        title: "Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('company_profile')
          .update(formData)
          .eq('id', editingCompany.id);

        if (error) throw error;

        toast({
          title: "Company updated",
          description: "Company information has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('company_profile')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Company added",
          description: "New company has been added successfully.",
        });
      }

      await loadCompanies();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingCompany ? 'update' : 'add'} company.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company: Company) => {
    setFormData(company);
    setEditingCompany(company);
    setIsAddingCompany(true);
  };

  const handleDelete = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('company_profile')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Company deleted",
        description: "Company has been removed successfully.",
      });

      await loadCompanies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete company.",
        variant: "destructive",
      });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-primary-glow text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Company Management</h2>
                <p className="text-white/90">
                  Manage your companies information for invoices
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsAddingCompany(true)}
            >
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAddingCompany && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCompany ? "Edit Company" : "Add New Company"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.company_name}
                onChange={handleInputChange("company_name")}
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={handleInputChange("address")}
                placeholder="Street Address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={handleInputChange("city")}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={handleInputChange("state")}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="pinCode">Pin Code</Label>
                <Input
                  id="pinCode"
                  value={formData.pin_code || ""}
                  onChange={handleInputChange("pin_code")}
                  placeholder="Pin Code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange("phone")}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange("email")}
                  placeholder="company@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ""}
                onChange={handleInputChange("website")}
                placeholder="www.company.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={formData.gstin || ""}
                  onChange={handleInputChange("gstin")}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <div>
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  value={formData.pan || ""}
                  onChange={handleInputChange("pan")}
                  placeholder="AAAAA0000A"
                />
              </div>
              <div>
                <Label htmlFor="cin">CIN</Label>
                <Input
                  id="cin"
                  value={formData.cin || ""}
                  onChange={handleInputChange("cin")}
                  placeholder="L12345MH2010PLC123456"
                />
              </div>
            </div>

            {/* Company Logo & Stamp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageDropzone
                value={formData.logo_url || ""}
                onChange={(value) => setFormData(prev => ({ ...prev, logo_url: value }))}
                label="Company Logo"
              />
              <ImageDropzone
                value={formData.stamp_url || ""}
                onChange={(value) => setFormData(prev => ({ ...prev, stamp_url: value }))}
                label="Company Stamp/Seal"
              />
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bank_name || ""}
                  onChange={handleInputChange("bank_name")}
                  placeholder="State Bank of India"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.bank_account_number || ""}
                  onChange={handleInputChange("bank_account_number")}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={formData.bank_ifsc || ""}
                  onChange={handleInputChange("bank_ifsc")}
                  placeholder="SBIN0001234"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleSave} 
                variant="gradient"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingCompany ? "Update Company" : "Add Company"}
              </Button>
              <Button onClick={resetForm} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Companies List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Companies ({companies.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {companies.length === 0 ? "No companies added yet" : "No companies match your search"}
              </p>
              {companies.length === 0 && (
                <Button
                  onClick={() => setIsAddingCompany(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Company
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{company.company_name}</h3>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {company.address && (
                        <p className="text-muted-foreground">
                          {company.address}
                          {company.city && company.state && `, ${company.city}, ${company.state}`}
                          {company.pin_code && ` - ${company.pin_code}`}
                        </p>
                      )}
                      {company.email && (
                        <p className="text-muted-foreground">{company.email}</p>
                      )}
                      {company.phone && (
                        <p className="text-muted-foreground">{company.phone}</p>
                      )}
                      {company.website && (
                        <p className="text-muted-foreground">{company.website}</p>
                      )}
                      {(company.gstin || company.pan || company.cin) && (
                        <p className="text-xs text-muted-foreground">
                          {company.gstin && `GSTIN: ${company.gstin}`}
                          {company.gstin && (company.pan || company.cin) && ' | '}
                          {company.pan && `PAN: ${company.pan}`}
                          {company.pan && company.cin && ' | '}
                          {company.cin && `CIN: ${company.cin}`}
                        </p>
                      )}
                      {company.bank_name && (
                        <p className="text-xs text-muted-foreground">
                          Bank: {company.bank_name}
                          {company.bank_account_number && ` (Acc: ${company.bank_account_number})`}
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
