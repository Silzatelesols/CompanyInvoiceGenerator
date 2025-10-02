// Template Builder Type Definitions

export type ComponentType = 
  | 'text'
  | 'heading'
  | 'company-logo'
  | 'company-name'
  | 'company-address'
  | 'company-contact'
  | 'company-gstin'
  | 'client-name'
  | 'client-address'
  | 'client-gstin'
  | 'invoice-number'
  | 'invoice-date'
  | 'due-date'
  | 'items-table'
  | 'subtotal'
  | 'tax-breakdown'
  | 'total-amount'
  | 'amount-in-words'
  | 'bank-details'
  | 'signature'
  | 'terms-conditions'
  | 'divider'
  | 'spacer';

export interface ComponentStyle {
  fontSize?: string;
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: string;
  margin?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  width?: string;
  height?: string;
  display?: 'block' | 'inline' | 'flex' | 'grid';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
}

export interface TemplateComponent {
  id: string;
  type: ComponentType;
  label: string;
  content?: string; // For text/heading components
  style: ComponentStyle;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  locked?: boolean;
  visible?: boolean;
  children?: TemplateComponent[]; // For container components
}

export interface TemplateLayout {
  id: string;
  name: string;
  description?: string;
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  components: TemplateComponent[];
  globalStyles?: {
    fontFamily?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

export interface SavedTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  layout: TemplateLayout;
  is_default: boolean;
  thumbnail?: string; // Base64 or URL
  created_at: string;
  updated_at: string;
}

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string; // Lucide icon name
  category: 'header' | 'content' | 'table' | 'footer' | 'layout';
  description: string;
  defaultStyle: ComponentStyle;
  defaultSize: {
    width: number;
    height: number;
  };
  configurable: {
    content?: boolean;
    style?: boolean;
    size?: boolean;
    position?: boolean;
  };
}

export interface TemplateBuilderState {
  currentTemplate: TemplateLayout | null;
  selectedComponent: TemplateComponent | null;
  isDragging: boolean;
  isResizing: boolean;
  zoom: number;
  gridSnap: boolean;
  showGrid: boolean;
  history: TemplateLayout[];
  historyIndex: number;
}
