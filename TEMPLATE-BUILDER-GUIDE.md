# 🎨 Invoice Template Builder - Complete Guide

## Overview

The Template Builder is a powerful drag-and-drop visual editor that allows you to create custom invoice templates without writing any code. Design professional invoices that match your brand identity and business needs.

## 🚀 Quick Start

### Step 1: Run the Database Migration

Before using the Template Builder, run the migration to create the necessary database table:

```sql
-- File: supabase/migrations/20251002100000_add_custom_templates.sql
-- Run this in your Supabase SQL Editor
```

### Step 2: Access the Template Builder

1. Log into your Billify application
2. Click **"Templates"** in the navigation menu (Palette icon)
3. You'll see the Template Builder interface

### Step 3: Create Your First Template

1. Click **"Create Template"** button
2. Enter a template name (e.g., "Modern Invoice")
3. Add a description (optional)
4. Click **"Create Template"**

## 📐 Interface Overview

The Template Builder has four main areas:

### 1. **Component Palette** (Left Sidebar)
- Browse available components by category
- Search for specific components
- Drag components onto the canvas or click to add them

### 2. **Canvas** (Center)
- Visual representation of your invoice (A4 size)
- Drag components to position them
- Resize components by dragging the bottom-right corner
- Grid lines help with alignment

### 3. **Property Panel** (Right Sidebar)
- Edit selected component properties
- Adjust position, size, colors, fonts, borders
- Delete components

### 4. **Toolbar** (Top)
- Undo/Redo changes
- Zoom in/out
- Toggle grid visibility
- Preview template
- Save template

## 🧩 Available Components

### Header Components
- **Company Logo**: Your company logo image
- **Company Name**: Company name from profile
- **Company Address**: Full company address
- **Company Contact**: Phone and email
- **Company GSTIN**: GSTIN, PAN, CIN details

### Content Components
- **Heading**: Custom heading text (e.g., "GST INVOICE")
- **Text**: Custom text field
- **Invoice Number**: Displays invoice number
- **Invoice Date**: Displays invoice date
- **Due Date**: Payment due date
- **Client Name**: Client name
- **Client Address**: Client full address
- **Client GSTIN**: Client GSTIN

### Table Components
- **Items Table**: Invoice line items with columns
- **Subtotal**: Subtotal amount
- **Tax Breakdown**: CGST, SGST, IGST breakdown
- **Total Amount**: Final total amount
- **Amount in Words**: Total in words

### Footer Components
- **Bank Details**: Bank account information
- **Signature**: Authorized signatory section
- **Terms & Conditions**: Terms and conditions text

### Layout Components
- **Divider**: Horizontal line separator
- **Spacer**: Empty space for layout

## 🎨 Customization Options

### Position & Size
- **X, Y**: Component position in pixels
- **Width, Height**: Component dimensions
- Drag to move, resize handle to adjust size

### Typography
- **Font Size**: e.g., "12px", "14px", "16px"
- **Font Weight**: Normal, Bold, Lighter, Bolder
- **Font Style**: Normal, Italic
- **Text Align**: Left, Center, Right, Justify

### Colors
- **Text Color**: Color picker + hex code
- **Background Color**: Color picker + hex code

### Spacing
- **Padding**: Internal spacing (e.g., "10px", "5px 10px")
- **Margin**: External spacing (e.g., "10px", "5px 10px")

### Border
- **Border Width**: e.g., "1px", "2px"
- **Border Style**: Solid, Dashed, Dotted, None
- **Border Color**: Color picker + hex code

## 🔧 Working with Components

### Adding Components

**Method 1: Drag and Drop**
1. Find component in palette
2. Click and drag onto canvas
3. Drop at desired position

**Method 2: Click to Add**
1. Click component in palette
2. Component appears at default position (100, 100)
3. Drag to reposition

### Selecting Components
- Click any component on canvas to select it
- Selected component shows blue border
- Properties appear in right panel

### Moving Components
- Click and drag component to new position
- Grid snap helps align components (if enabled)
- Position values update in property panel

### Resizing Components
- Select component
- Drag the blue handle at bottom-right corner
- Minimum size: 50px width, 30px height

### Editing Component Properties
1. Select component
2. Use property panel on right
3. Changes apply immediately
4. Use Undo if needed

### Locking Components
- Click lock icon above selected component
- Locked components can't be moved or resized
- Prevents accidental changes

### Hiding Components
- Click eye icon above selected component
- Hidden components don't appear in preview/PDF
- Useful for temporary removal

### Deleting Components
- Select component
- Click trash icon above component
- Or use Delete button in property panel

## 💾 Saving & Managing Templates

### Saving Your Template
1. Click **"Save"** button in toolbar
2. Template saves to database
3. Success notification appears

### Creating Multiple Templates
1. Click **"+"** button next to template name
2. Create new template
3. Switch between templates as needed

### Setting Default Template
- Use Settings service to set default template
- Default template used for quick generation

## 👁️ Preview Your Template

1. Click **"Preview"** button in toolbar
2. See template with sample invoice data
3. Check layout, spacing, alignment
4. Close preview and make adjustments

### Sample Data in Preview
- Company: "Acme Corporation"
- Client: "ABC Enterprises"
- Invoice: INV-2024-001
- Items: Sample consulting service
- Amounts: ₹10,000 + GST = ₹11,800

## 🎯 Best Practices

### Layout Tips
1. **Start with structure**: Add major sections first (header, body, footer)
2. **Use dividers**: Separate sections visually
3. **Consistent spacing**: Use same padding/margin values
4. **Grid snap**: Keep enabled for clean alignment
5. **Margins**: Respect the margin guides (dashed blue box)

### Design Tips
1. **Font hierarchy**: Larger fonts for headings, smaller for details
2. **Color consistency**: Use 2-3 colors maximum
3. **White space**: Don't overcrowd the invoice
4. **Alignment**: Left-align most text, right-align amounts
5. **Branding**: Add logo and use brand colors

### Component Placement
1. **Header**: Logo, company name, address (top 150px)
2. **Invoice details**: Number, date, client info (next 150px)
3. **Items table**: Main content area (middle section)
4. **Totals**: Right-aligned below table
5. **Footer**: Bank details, signature (bottom 150px)

## 🔄 Undo/Redo

- **Undo**: Click undo button or Ctrl+Z
- **Redo**: Click redo button or Ctrl+Y
- History tracks all changes
- Navigate through your editing history

## 🔍 Zoom Controls

- **Zoom In**: Click + button or increase percentage
- **Zoom Out**: Click - button or decrease percentage
- **Range**: 25% to 200%
- **Default**: 100% (actual size)

## 📏 Grid & Snapping

### Grid Display
- Toggle with grid button in toolbar
- Shows 10px × 10px grid
- Helps with alignment

### Grid Snap
- Automatically enabled
- Components snap to 10px increments
- Ensures clean positioning

## 🎨 Template Examples

### Example 1: Minimal Invoice
```
Components:
- Company Name (center, large, bold)
- Divider
- Invoice Number + Date (left)
- Client Name + Address (left)
- Items Table
- Total Amount (right, bold)
- Signature (right)
```

### Example 2: Professional Invoice
```
Components:
- Company Logo (left) + Company Name (center)
- Company Address + Contact (center, small)
- Company GSTIN (left) + Invoice Number (right)
- Divider
- Client Name + Address (left)
- Client GSTIN (left)
- Items Table (full width)
- Tax Breakdown (right)
- Total Amount (right, large, bold)
- Amount in Words (left)
- Divider
- Bank Details (left) + Signature (right)
- Terms & Conditions (bottom, small)
```

### Example 3: Modern Invoice
```
Components:
- Company Logo (left) + Company Name (large, fancy font)
- Heading: "INVOICE" (center, very large)
- Invoice Number + Date (right, colored box)
- Client details (left, colored background)
- Items Table (modern styling, colored header)
- Subtotal + Tax (right, clean layout)
- Total (right, large, colored background)
- Bank Details (bottom left)
- Signature (bottom right)
```

## 🚨 Troubleshooting

### Components Not Appearing
- Check if component is hidden (eye icon)
- Check if component is outside margins
- Try zooming out to see full canvas

### Can't Move Component
- Check if component is locked (lock icon)
- Click component to select it first
- Make sure you're clicking the component, not empty space

### Preview Looks Different
- Preview uses sample data
- Actual invoice will use real data
- Layout and styling will match

### Save Not Working
- Check if you're logged in
- Check database migration is run
- Check browser console for errors

## 📱 Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+S**: Save template
- **Delete**: Delete selected component
- **Arrow Keys**: Move selected component (1px)
- **Shift+Arrow**: Move selected component (10px)

## 🔗 Integration with PDF Generation

### Using Custom Templates
1. Save your template in Template Builder
2. Set as default in Settings (optional)
3. Generate invoice - uses your custom template
4. PDF reflects your design exactly

### Template Selection
- Choose template when generating invoice
- Override default template per invoice
- Multiple templates for different clients

## 💡 Advanced Tips

### Responsive Components
- Use percentage widths for flexibility
- Test with different data lengths
- Leave space for dynamic content

### Multi-Page Invoices
- Design for single page first
- Consider page breaks for long item lists
- Footer components stay at bottom

### Branding
- Upload logo in Company Profile
- Use brand colors consistently
- Match your existing stationery

### Performance
- Limit components to 30-40 per template
- Avoid very large images
- Use simple borders and styles

## 📊 Component Data Mapping

When generating actual invoices, components automatically pull data from:

| Component | Data Source |
|-----------|-------------|
| Company Name | `company.company_name` |
| Company Address | `company.address`, `company.city`, `company.state`, `company.pin_code` |
| Company Contact | `company.phone`, `company.email` |
| Company GSTIN | `company.gstin`, `company.pan`, `company.cin` |
| Client Name | `client.name` |
| Client Address | `client.address`, `client.city`, `client.state`, `client.pin_code` |
| Client GSTIN | `client.gstin` |
| Invoice Number | `invoice.invoice_number` |
| Invoice Date | `invoice.invoice_date` |
| Due Date | `invoice.due_date` |
| Items Table | `invoice_items[]` |
| Subtotal | `invoice.subtotal` |
| Tax Breakdown | Calculated CGST, SGST, IGST |
| Total Amount | `invoice.total_amount` |
| Amount in Words | Converted from total |
| Bank Details | `company.bank_name`, `company.bank_account_number`, `company.bank_ifsc` |

## 🎓 Tutorial: Create Your First Template

### Step-by-Step Guide

**1. Create New Template**
- Click "Create Template"
- Name: "My First Invoice"
- Click "Create"

**2. Add Header**
- Drag "Company Name" to top center
- Drag "Company Address" below it
- Select Company Name, make font size "24px", bold

**3. Add Invoice Info**
- Drag "Invoice Number" to top left
- Drag "Invoice Date" below it
- Position at Y: 150

**4. Add Client Info**
- Drag "Client Name" below invoice info
- Drag "Client Address" below client name
- Position at Y: 220

**5. Add Items Table**
- Drag "Items Table" to center
- Position at Y: 320
- Resize to full width (700px)

**6. Add Totals**
- Drag "Subtotal" to right side
- Drag "Tax Breakdown" below it
- Drag "Total Amount" below tax
- Position at X: 550, Y: 550

**7. Add Footer**
- Drag "Bank Details" to bottom left
- Drag "Signature" to bottom right
- Position at Y: 900

**8. Style Your Template**
- Select Company Name: color = #0066cc
- Select Total Amount: font size = "18px", bold
- Select Items Table: border = "1px solid #000"

**9. Preview**
- Click "Preview" button
- Check layout and spacing
- Make adjustments if needed

**10. Save**
- Click "Save" button
- Template is now ready to use!

## 🎉 Congratulations!

You now know how to create custom invoice templates! Experiment with different layouts, colors, and components to create the perfect invoice for your business.

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review the troubleshooting section
3. Check browser console for errors
4. Ensure database migration is run
5. Verify you're logged in

## 🔄 Updates & Improvements

The Template Builder is continuously improved. Future features may include:
- Template marketplace
- Import/export templates
- More component types
- Advanced styling options
- Template versioning
- Collaborative editing

---

**Happy Template Building! 🎨✨**
