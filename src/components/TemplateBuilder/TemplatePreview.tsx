import { TemplateLayout } from "@/types/templateBuilder";

interface TemplatePreviewProps {
  template: TemplateLayout;
}

export const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  // A4 dimensions
  const pageWidth = template.orientation === 'portrait' ? 794 : 1123;
  const pageHeight = template.orientation === 'portrait' ? 1123 : 794;

  // Sample data for preview
  const sampleData = {
    companyName: "Acme Corporation",
    companyAddress: "123 Business St, Mumbai, Maharashtra - 400001",
    companyContact: "Tel: +91 98765 43210 | Email: info@acme.com",
    companyGSTIN: "GSTIN: 27AAAAA0000A1Z5 | PAN: AAAAA0000A | CIN: L12345MH2010PLC123456",
    clientName: "ABC Enterprises",
    clientAddress: "456 Client Ave, Delhi, Delhi - 110001",
    clientGSTIN: "GSTIN: 07BBBBB0000B1Z5",
    invoiceNumber: "INV-2024-001",
    invoiceDate: "02/10/2024",
    dueDate: "01/11/2024",
    subtotal: "₹ 10,000.00",
    cgst: "₹ 900.00",
    sgst: "₹ 900.00",
    igst: "₹ 0.00",
    total: "₹ 11,800.00",
    amountInWords: "Rupees Eleven Thousand Eight Hundred Only",
    bankDetails: "Bank: State Bank of India\nAccount: 1234567890\nIFSC: SBIN0001234",
  };

  const getComponentContent = (type: string, content?: string) => {
    if (content) return content;

    const contentMap: Record<string, string> = {
      'company-name': sampleData.companyName,
      'company-address': sampleData.companyAddress,
      'company-contact': sampleData.companyContact,
      'company-gstin': sampleData.companyGSTIN,
      'client-name': sampleData.clientName,
      'client-address': sampleData.clientAddress,
      'client-gstin': sampleData.clientGSTIN,
      'invoice-number': `Invoice No: ${sampleData.invoiceNumber}`,
      'invoice-date': `Date: ${sampleData.invoiceDate}`,
      'due-date': `Due Date: ${sampleData.dueDate}`,
      'subtotal': `Subtotal: ${sampleData.subtotal}`,
      'tax-breakdown': `CGST @9%: ${sampleData.cgst}\nSGST @9%: ${sampleData.sgst}\nIGST @18%: ${sampleData.igst}`,
      'total-amount': `Total: ${sampleData.total}`,
      'amount-in-words': sampleData.amountInWords,
      'bank-details': sampleData.bankDetails,
      'signature': 'For Acme Corporation\n\n\n\nAuthorized Signatory',
      'terms-conditions': 'Terms & Conditions: Payment due within 30 days. Late payments subject to 2% monthly interest.',
      'items-table': 'Items table will appear here',
      'company-logo': '[Logo]',
      'heading': 'GST INVOICE',
      'text': 'Sample text',
      'divider': '',
      'spacer': '',
    };

    return contentMap[type] || type;
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div
        className="mx-auto bg-white shadow-lg relative"
        style={{
          width: `${pageWidth}px`,
          height: `${pageHeight}px`,
          transform: 'scale(0.8)',
          transformOrigin: 'top center',
        }}
      >
        {/* Margins Guide */}
        <div
          className="absolute border border-dashed border-gray-300 pointer-events-none"
          style={{
            top: `${template.margins.top}px`,
            left: `${template.margins.left}px`,
            right: `${template.margins.right}px`,
            bottom: `${template.margins.bottom}px`,
          }}
        />

        {/* Components */}
        {template.components.map((component) => {
          if (!component.visible) return null;

          const style = {
            position: 'absolute' as const,
            left: `${component.position.x}px`,
            top: `${component.position.y}px`,
            width: `${component.size.width}px`,
            height: `${component.size.height}px`,
            ...component.style,
          };

          const content = getComponentContent(component.type, component.content);

          // Special rendering for certain component types
          if (component.type === 'divider') {
            return (
              <div
                key={component.id}
                style={{
                  ...style,
                  borderTop: `${component.style.borderWidth || '1px'} ${component.style.borderStyle || 'solid'} ${component.style.borderColor || '#000000'}`,
                }}
              />
            );
          }

          if (component.type === 'spacer') {
            return <div key={component.id} style={style} />;
          }

          if (component.type === 'items-table') {
            return (
              <div key={component.id} style={style}>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Item</th>
                      <th className="border border-gray-300 p-2 text-center">Qty</th>
                      <th className="border border-gray-300 p-2 text-right">Rate</th>
                      <th className="border border-gray-300 p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Consulting Services</td>
                      <td className="border border-gray-300 p-2 text-center">1</td>
                      <td className="border border-gray-300 p-2 text-right">₹ 10,000.00</td>
                      <td className="border border-gray-300 p-2 text-right">₹ 10,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          }

          if (component.type === 'company-logo') {
            return (
              <div
                key={component.id}
                style={{
                  ...style,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed #ccc',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <span className="text-xs text-gray-400">[Company Logo]</span>
              </div>
            );
          }

          return (
            <div
              key={component.id}
              style={style}
              className="overflow-hidden"
            >
              <div
                className="h-full w-full"
                style={{
                  whiteSpace: component.type === 'tax-breakdown' || component.type === 'bank-details' || component.type === 'signature' ? 'pre-line' : 'normal',
                }}
              >
                {content}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {template.components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>No components in template</p>
          </div>
        )}
      </div>
    </div>
  );
};
