import { supabase } from "@/integrations/supabase/client";
import { SavedTemplate, TemplateLayout, ComponentDefinition, ComponentType } from "@/types/templateBuilder";

/**
 * Template Builder Service
 * Handles CRUD operations for custom invoice templates
 */

export const templateBuilderService = {
  /**
   * Get all templates for current user
   */
  async getUserTemplates(userId: string): Promise<SavedTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<SavedTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  /**
   * Save a new template
   */
  async saveTemplate(userId: string, template: Omit<SavedTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<SavedTemplate> {
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .insert({
          user_id: userId,
          name: template.name,
          description: template.description,
          layout: template.layout,
          is_default: template.is_default,
          thumbnail: template.thumbnail,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  },

  /**
   * Update an existing template
   */
  async updateTemplate(templateId: string, updates: Partial<SavedTemplate>): Promise<SavedTemplate> {
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .update({
          name: updates.name,
          description: updates.description,
          layout: updates.layout,
          is_default: updates.is_default,
          thumbnail: updates.thumbnail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  /**
   * Set a template as default
   */
  async setDefaultTemplate(userId: string, templateId: string): Promise<void> {
    try {
      // First, unset all defaults for this user
      await supabase
        .from('custom_templates')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected template as default
      const { error } = await supabase
        .from('custom_templates')
        .update({ is_default: true })
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting default template:', error);
      throw error;
    }
  },

  /**
   * Get default template for user
   */
  async getDefaultTemplate(userId: string): Promise<SavedTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching default template:', error);
      return null;
    }
  },

  /**
   * Duplicate a template
   */
  async duplicateTemplate(templateId: string, userId: string, newName: string): Promise<SavedTemplate> {
    try {
      const original = await this.getTemplate(templateId);
      if (!original) throw new Error('Template not found');

      const { data, error } = await supabase
        .from('custom_templates')
        .insert({
          user_id: userId,
          name: newName,
          description: original.description,
          layout: original.layout,
          is_default: false,
          thumbnail: original.thumbnail,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  },
};

/**
 * Component Library - Predefined components that can be dragged onto canvas
 */
export const componentLibrary: ComponentDefinition[] = [
  // Header Components
  {
    type: 'company-logo',
    label: 'Company Logo',
    icon: 'Image',
    category: 'header',
    description: 'Your company logo',
    defaultStyle: {
      width: '100px',
      height: '100px',
    },
    defaultSize: { width: 100, height: 100 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'company-name',
    label: 'Company Name',
    icon: 'Building2',
    category: 'header',
    description: 'Company name from profile',
    defaultStyle: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    defaultSize: { width: 300, height: 40 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'company-address',
    label: 'Company Address',
    icon: 'MapPin',
    category: 'header',
    description: 'Company address from profile',
    defaultStyle: {
      fontSize: '12px',
      textAlign: 'center',
    },
    defaultSize: { width: 300, height: 60 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'company-contact',
    label: 'Company Contact',
    icon: 'Phone',
    category: 'header',
    description: 'Phone and email',
    defaultStyle: {
      fontSize: '12px',
      textAlign: 'center',
    },
    defaultSize: { width: 300, height: 40 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'company-gstin',
    label: 'Company GSTIN',
    icon: 'FileText',
    category: 'header',
    description: 'GSTIN, PAN, CIN',
    defaultStyle: {
      fontSize: '11px',
      textAlign: 'left',
    },
    defaultSize: { width: 250, height: 30 },
    configurable: { style: true, size: true, position: true },
  },

  // Content Components
  {
    type: 'heading',
    label: 'Heading',
    icon: 'Heading',
    category: 'content',
    description: 'Custom heading text',
    defaultStyle: {
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    defaultSize: { width: 200, height: 30 },
    configurable: { content: true, style: true, size: true, position: true },
  },
  {
    type: 'text',
    label: 'Text',
    icon: 'Type',
    category: 'content',
    description: 'Custom text field',
    defaultStyle: {
      fontSize: '12px',
      textAlign: 'left',
    },
    defaultSize: { width: 200, height: 30 },
    configurable: { content: true, style: true, size: true, position: true },
  },
  {
    type: 'invoice-number',
    label: 'Invoice Number',
    icon: 'Hash',
    category: 'content',
    description: 'Invoice number field',
    defaultStyle: {
      fontSize: '12px',
      fontWeight: 'bold',
    },
    defaultSize: { width: 200, height: 25 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'invoice-date',
    label: 'Invoice Date',
    icon: 'Calendar',
    category: 'content',
    description: 'Invoice date field',
    defaultStyle: {
      fontSize: '12px',
    },
    defaultSize: { width: 200, height: 25 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'due-date',
    label: 'Due Date',
    icon: 'CalendarClock',
    category: 'content',
    description: 'Payment due date',
    defaultStyle: {
      fontSize: '12px',
    },
    defaultSize: { width: 200, height: 25 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'client-name',
    label: 'Client Name',
    icon: 'User',
    category: 'content',
    description: 'Client name and address',
    defaultStyle: {
      fontSize: '12px',
      fontWeight: 'bold',
    },
    defaultSize: { width: 250, height: 30 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'client-address',
    label: 'Client Address',
    icon: 'MapPin',
    category: 'content',
    description: 'Client full address',
    defaultStyle: {
      fontSize: '11px',
    },
    defaultSize: { width: 250, height: 60 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'client-gstin',
    label: 'Client GSTIN',
    icon: 'FileText',
    category: 'content',
    description: 'Client GSTIN',
    defaultStyle: {
      fontSize: '11px',
    },
    defaultSize: { width: 200, height: 25 },
    configurable: { style: true, size: true, position: true },
  },

  // Table Components
  {
    type: 'items-table',
    label: 'Items Table',
    icon: 'Table',
    category: 'table',
    description: 'Invoice items table',
    defaultStyle: {
      fontSize: '11px',
      borderWidth: '1px',
      borderColor: '#000000',
      borderStyle: 'solid',
    },
    defaultSize: { width: 700, height: 200 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'subtotal',
    label: 'Subtotal',
    icon: 'Calculator',
    category: 'table',
    description: 'Subtotal amount',
    defaultStyle: {
      fontSize: '12px',
      textAlign: 'right',
    },
    defaultSize: { width: 200, height: 25 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'tax-breakdown',
    label: 'Tax Breakdown',
    icon: 'Percent',
    category: 'table',
    description: 'CGST, SGST, IGST breakdown',
    defaultStyle: {
      fontSize: '11px',
      textAlign: 'right',
    },
    defaultSize: { width: 250, height: 80 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'total-amount',
    label: 'Total Amount',
    icon: 'DollarSign',
    category: 'table',
    description: 'Final total amount',
    defaultStyle: {
      fontSize: '14px',
      fontWeight: 'bold',
      textAlign: 'right',
    },
    defaultSize: { width: 200, height: 30 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'amount-in-words',
    label: 'Amount in Words',
    icon: 'Type',
    category: 'table',
    description: 'Total amount in words',
    defaultStyle: {
      fontSize: '11px',
      fontStyle: 'italic',
    },
    defaultSize: { width: 400, height: 25 },
    configurable: { style: true, size: true, position: true },
  },

  // Footer Components
  {
    type: 'bank-details',
    label: 'Bank Details',
    icon: 'Building',
    category: 'footer',
    description: 'Bank account information',
    defaultStyle: {
      fontSize: '10px',
      borderWidth: '1px',
      borderColor: '#cccccc',
      borderStyle: 'solid',
      padding: '10px',
    },
    defaultSize: { width: 350, height: 100 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'signature',
    label: 'Signature',
    icon: 'PenTool',
    category: 'footer',
    description: 'Authorized signatory section',
    defaultStyle: {
      fontSize: '11px',
      textAlign: 'right',
    },
    defaultSize: { width: 200, height: 100 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'terms-conditions',
    label: 'Terms & Conditions',
    icon: 'FileText',
    category: 'footer',
    description: 'Terms and conditions text',
    defaultStyle: {
      fontSize: '9px',
      color: '#666666',
    },
    defaultSize: { width: 700, height: 60 },
    configurable: { content: true, style: true, size: true, position: true },
  },

  // Layout Components
  {
    type: 'divider',
    label: 'Divider',
    icon: 'Minus',
    category: 'layout',
    description: 'Horizontal line separator',
    defaultStyle: {
      borderWidth: '1px',
      borderColor: '#000000',
      borderStyle: 'solid',
      width: '100%',
    },
    defaultSize: { width: 700, height: 2 },
    configurable: { style: true, size: true, position: true },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: 'Space',
    category: 'layout',
    description: 'Empty space for layout',
    defaultStyle: {
      backgroundColor: 'transparent',
    },
    defaultSize: { width: 100, height: 20 },
    configurable: { size: true, position: true },
  },
];

/**
 * Helper function to create a new component instance
 */
export function createComponent(type: ComponentType, position: { x: number; y: number }): any {
  const definition = componentLibrary.find(c => c.type === type);
  if (!definition) throw new Error(`Component type ${type} not found`);

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: definition.label,
    content: definition.configurable.content ? 'Edit this text' : undefined,
    style: { ...definition.defaultStyle },
    position,
    size: { ...definition.defaultSize },
    locked: false,
    visible: true,
  };
}

/**
 * Helper function to create a blank template
 */
export function createBlankTemplate(name: string): TemplateLayout {
  return {
    id: `template-${Date.now()}`,
    name,
    description: '',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    components: [],
    globalStyles: {
      fontFamily: 'Roboto, sans-serif',
      primaryColor: '#000000',
      secondaryColor: '#666666',
      accentColor: '#0066cc',
    },
  };
}
