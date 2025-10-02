// Import types from separate file
export type { InvoiceData, TemplateConfig } from './pdfTemplates/types';

// Import template generators from separate files
import { generateExtrapeTemplate } from './pdfTemplates/generators/extrape';
import { generateDefaultTemplate } from './pdfTemplates/generators/default';

import type { TemplateConfig } from './pdfTemplates/types';

export const INVOICE_TEMPLATES: TemplateConfig[] = [
  {
    id: 'default',
    name: 'Default Template',
    description: 'Simple and clean default invoice template',
    preview: '/templates/default-preview.png',
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#f0f0f0'
    }
  },
  {
    id: 'Extrape',
    name: 'Extrape Format',
    description: 'Professional Extrape design ',
    preview: '/templates/Extrape-preview.png',
    colors: {
      primary: '#1f2937',
      secondary: '#f9fafb',
      accent: '#6b7280'
    }
  }
];

// Export template generators object for use by pdfGenerator
export const TEMPLATE_GENERATORS = {
  default: generateDefaultTemplate,
  Extrape: generateExtrapeTemplate,
};