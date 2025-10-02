import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Download, Calendar, Building2, Mail, Phone, AlertCircle, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDFWithSettings, generateInvoiceWithDefaultTemplate } from "@/utils/pdfGeneratorWithSettings";
import { TemplateSelector } from "./TemplateSelector";
import { settingsService } from "@/lib/settingsService";
import { authLib } from "@/lib/auth";
import { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type CompanyProfile = Database["public"]["Tables"]["company_profile"]["Row"];
type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];

interface InvoiceDetailProps {
  invoice: Invoice;
  onEdit: () => void;
  onClose: () => void;
}

export const InvoiceDetail = ({ invoice, onEdit, onClose }: InvoiceDetailProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingDefaultPDF, setDownloadingDefaultPDF] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [showDefaultButton, setShowDefaultButton] = useState(false);

  useEffect(() => {
    fetchInvoiceDetails();
    checkDefaultButtonSetting();
  }, [invoice.id]);

  const checkDefaultButtonSetting = async () => {
    try {
      const session = authLib.getSession();
      if (session && session.user) {
        const settings = await settingsService.getOrCreateSettings(session.user.id);
        setShowDefaultButton(settings.enable_default_template_button);
      }
    } catch (error) {
      console.error('Error checking default button setting:', error);
      // Silently fail - feature just won't be available
    }
  };

  const fetchInvoiceDetails = async () => {
    try {
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id);

      if (itemsError) throw itemsError;

      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", invoice.client_id)
        .single();

      if (clientError) throw clientError;

      // Fetch company profile based on invoice's company_id
      let companyData = null;
      if (invoice.company_id) {
        const { data, error: companyError } = await supabase
          .from("company_profile")
          .select("*")
          .eq("id", invoice.company_id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          console.error("Error fetching company profile:", companyError);
        } else {
          companyData = data;
        }
      }

      // Fallback: if no company_id or company not found, get the first available company
      if (!companyData) {
        const { data, error: fallbackError } = await supabase
          .from("company_profile")
          .select("*")
          .limit(1)
          .single();

        if (fallbackError && fallbackError.code !== 'PGRST116') {
          console.error("Error fetching fallback company profile:", fallbackError);
        } else {
          companyData = data;
        }
      }

      setItems(itemsData || []);
      setClient(clientData);
      setCompany(companyData);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadPDF = async (templateId: string = selectedTemplate) => {
    if (!client || !items.length) {
      toast({
        title: "Error",
        description: "Unable to generate PDF. Missing invoice data.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingPDF(true);
    try {
      const result = await generateInvoicePDFWithSettings({
        invoice,
        client,
        company,
        items,
      }, templateId);

      if (result.success) {
        let description = "";
        const actions = [];
        
        if (result.localDownload) actions.push("downloaded locally");
        if (result.s3Url) actions.push("uploaded to cloud storage");
        if (result.emailSent) actions.push("email sent to client");
        
        if (actions.length > 0) {
          description = `PDF generated successfully! ${actions.join(", ").replace(/,([^,]*)$/, " and$1")}.`;
        } else {
          description = "PDF generated successfully!";
        }

        toast({
          title: "Success",
          description,
        });

        // Log details for debugging
        if (result.s3Url) {
          console.log("PDF available at:", result.s3Url);
        }
        if (result.emailSent) {
          console.log("Email sent to:", client?.email);
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleTemplateSelect = () => {
    setShowTemplateSelector(true);
  };

  const handleTemplateConfirm = () => {
    setShowTemplateSelector(false);
    handleDownloadPDF(selectedTemplate);
  };

  const handleQuickDefaultGenerate = async () => {
    if (!client || !items.length) {
      toast({
        title: "Error",
        description: "Unable to generate PDF. Missing invoice data.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingDefaultPDF(true);
    try {
      const result = await generateInvoiceWithDefaultTemplate({
        invoice,
        client,
        company,
        items,
      });

      if (result.success) {
        let description = "";
        const actions = [];
        
        if (result.localDownload) actions.push("downloaded locally");
        if (result.s3Url) actions.push("uploaded to cloud storage");
        if (result.emailSent) actions.push("email sent to client");
        
        if (actions.length > 0) {
          description = `PDF generated with default template! ${actions.join(", ").replace(/,([^,]*)$/, " and$1")}.`;
        } else {
          description = "PDF generated with default template!";
        }

        toast({
          title: "Success",
          description,
        });

        if (result.s3Url) {
          console.log("PDF available at:", result.s3Url);
        }
        if (result.emailSent) {
          console.log("Email sent to:", client?.email);
        }
      }
    } catch (error) {
      console.error("Error generating PDF with default template:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingDefaultPDF(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading invoice details...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Invoice {invoice.invoice_number}
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Created on {formatDate(invoice.invoice_date)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {showDefaultButton && (
                <Button 
                  variant="default" 
                  onClick={handleQuickDefaultGenerate}
                  disabled={downloadingDefaultPDF || downloadingPDF}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {downloadingDefaultPDF ? "Generating..." : "Quick Generate"}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleTemplateSelect}
                disabled={downloadingPDF || downloadingDefaultPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadingPDF ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Invoice Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              From
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company ? (
              <div className="space-y-2">
                <h3 className="font-semibold">{company.company_name}</h3>
                {company.address && (
                  <p className="text-sm text-muted-foreground">{company.address}</p>
                )}
                <div className="space-y-1">
                  {company.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {company.email}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      {company.phone}
                    </div>
                  )}
                </div>
                {company.gstin && (
                  <p className="text-sm">
                    <strong>GSTIN:</strong> {company.gstin}
                  </p>
                )}
                {company.pan && (
                  <p className="text-sm">
                    <strong>PAN:</strong> {company.pan}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Company profile not configured
              </p>
            )}
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            {client && (
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {client.company_name || client.name}
                </h3>
                {client.company_name && client.name !== client.company_name && (
                  <p className="text-sm">{client.name}</p>
                )}
                {client.address && (
                  <p className="text-sm text-muted-foreground">{client.address}</p>
                )}
                <div className="space-y-1">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </div>
                  )}
                </div>
                {client.gstin && (
                  <p className="text-sm">
                    <strong>GSTIN:</strong> {client.gstin}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(invoice.invoice_date)}
              </p>
            </div>
            {invoice.due_date && (
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(invoice.due_date)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={getStatusVariant(invoice.status)} className="mt-1">
                {invoice.status}
              </Badge>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Reverse Charge</p>
                <p className={`font-medium flex items-center gap-2 ${invoice.gst_payable_reverse_charge ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <AlertCircle className="h-4 w-4" />
                    {invoice.gst_payable_reverse_charge ? "Yes" : "No"}
                </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.item_name}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>Rate: {formatCurrency(item.unit_price)}</span>
                      <span>GST: {item.gst_rate}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.line_total)}</p>
                    <p className="text-sm text-muted-foreground">
                      +{formatCurrency(item.gst_amount)} GST
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total GST:</span>
              <span>{formatCurrency(invoice.total_gst)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          onClose={() => setShowTemplateSelector(false)}
          onConfirm={handleTemplateConfirm}
        />
      )}
    </div>
  );
};