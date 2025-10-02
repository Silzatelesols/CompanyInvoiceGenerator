import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Loader2, Tag, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageDropzone } from "@/components/ui/image-dropzone";

interface CompanyData {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  stampUrl: string;
  gstin: string;
  pan: string;
  cin: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  tags: string[];
  comments: string;
}

export const CompanyProfile = () => {
  const { toast } = useToast();
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    stampUrl: "",
    gstin: "",
    pan: "",
    cin: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    tags: [],
    comments: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load company profile data on component mount
  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_profile')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompanyData({
          name: data.company_name || "",
          address: data.address || "",
          city: data.city || "", 
          state: data.state || "", 
          pinCode: data.pin_code || "", 
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          logoUrl: data.logo_url || "",
          stampUrl: data.stamp_url || "",
          gstin: data.gstin || "",
          pan: data.pan || "",
          cin: data.cin || "",
          bankName: data.bank_name || "",
          accountNumber: data.bank_account_number || "",
          ifscCode: data.bank_ifsc || "",
          tags: data.tags || [],
          comments: data.comments || "",
        });
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load company profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Omit<CompanyData, 'tags'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('company_profile')
        .upsert({
          company_name: companyData.name,
          address: companyData.address,
          city: companyData.city || "",
          state: companyData.state || "",
          pin_code: companyData.pinCode || "",
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          logo_url: companyData.logoUrl,
          stamp_url: companyData.stampUrl,
          gstin: companyData.gstin,
          pan: companyData.pan,
          cin: companyData.cin,
          bank_name: companyData.bankName,
          bank_account_number: companyData.accountNumber,
          bank_ifsc: companyData.ifscCode,
          tags: companyData.tags,
          comments: companyData.comments,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Company profile saved",
        description: "Your company information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: "Error saving profile",
        description: "Failed to save company profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-primary-glow text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Company Profile</h2>
              <p className="text-white/90">
                Set up your company information for invoices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyData.name}
                onChange={handleInputChange("name")}
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={companyData.address}
                onChange={handleInputChange("address")}
                placeholder="Street Address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={companyData.city}
                  onChange={handleInputChange("city")}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={companyData.state}
                  onChange={handleInputChange("state")}
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pinCode">PinCode</Label>
              <Input
                id="pinCode"
                value={companyData.pinCode}
                onChange={handleInputChange("pinCode")}
                placeholder="PinCode"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={handleInputChange("phone")}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={handleInputChange("email")}
                placeholder="company@example.com"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={companyData.website}
                onChange={handleInputChange("website")}
                placeholder="www.company.com"
              />
            </div>

            <div>
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                value={companyData.gstin}
                onChange={handleInputChange("gstin")}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div>
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                value={companyData.pan}
                onChange={handleInputChange("pan")}
                placeholder="AAAAA0000A"
              />
            </div>

            <div>
              <Label htmlFor="cin">CIN</Label>
              <Input
                id="cin"
                value={companyData.cin}
                onChange={handleInputChange("cin")}
                placeholder="L12345MH2010PLC123456"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Logo & Stamp */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Company Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageDropzone
                value={companyData.logoUrl}
                onChange={(value) => setCompanyData(prev => ({ ...prev, logoUrl: value }))}
                label="Company Logo"
              />
              <ImageDropzone
                value={companyData.stampUrl}
                onChange={(value) => setCompanyData(prev => ({ ...prev, stampUrl: value }))}
                label="Company Stamp/Seal"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={companyData.bankName}
                  onChange={handleInputChange("bankName")}
                  placeholder="State Bank of India"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={companyData.accountNumber}
                  onChange={handleInputChange("accountNumber")}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={companyData.ifscCode}
                  onChange={handleInputChange("ifscCode")}
                  placeholder="SBIN0001234"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags and Comments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags & Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add tags to identify and differentiate company profiles with similar names (e.g., "main-office", "branch-mumbai", "backup-contact")
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter a tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      if (!companyData.tags.includes(tagInput.trim())) {
                        setCompanyData(prev => ({
                          ...prev,
                          tags: [...prev.tags, tagInput.trim()]
                        }));
                      }
                      setTagInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (tagInput.trim() && !companyData.tags.includes(tagInput.trim())) {
                      setCompanyData(prev => ({
                        ...prev,
                        tags: [...prev.tags, tagInput.trim()]
                      }));
                      setTagInput('');
                    }
                  }}
                >
                  Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {companyData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyData(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== index)
                        }));
                      }}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Internal Comments
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add internal notes about this company profile (e.g., contact preferences, special requirements)
              </p>
              <Textarea
                id="comments"
                value={companyData.comments}
                onChange={handleInputChange("comments")}
                placeholder="Add any internal notes or comments about this company profile..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} variant="gradient" size="lg" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Company Profile"}
        </Button>
      </div>
    </div>
  );
};