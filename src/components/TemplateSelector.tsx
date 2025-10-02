import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { INVOICE_TEMPLATES, TemplateConfig } from "@/utils/pdfTemplates";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const TemplateSelector = ({ 
  selectedTemplate, 
  onTemplateSelect, 
  onClose, 
  onConfirm 
}: TemplateSelectorProps) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Choose Invoice Template</h2>
          <p className="text-gray-600 mt-2">Select a template design for your invoice PDF</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INVOICE_TEMPLATES.map((template: TemplateConfig) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onTemplateSelect(template.id)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <CardContent className="p-0">
                  {/* Template Preview */}
                  <div 
                    className="h-48 rounded-t-lg relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.accent})`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
                      <div className="p-4 h-full flex flex-col justify-between">
                        <div>
                          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs font-medium inline-block mb-2">
                            INVOICE
                          </div>
                          <div className="space-y-1">
                            <div className="bg-white/30 rounded h-2 w-3/4"></div>
                            <div className="bg-white/20 rounded h-1.5 w-1/2"></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-white/30 rounded h-1.5 w-full"></div>
                          <div className="bg-white/20 rounded h-1.5 w-4/5"></div>
                          <div className="bg-white/20 rounded h-1.5 w-3/5"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedTemplate === template.id && (
                      <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {template.name}
                      </h3>
                      {selectedTemplate === template.id && (
                        <Badge variant="default" className="bg-blue-500">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {template.description}
                    </p>
                    
                    {/* Color Palette */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Colors:</span>
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.primary }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.accent }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.secondary }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            Generate PDF with Selected Template
          </Button>
        </div>
      </div>
    </div>
  );
};