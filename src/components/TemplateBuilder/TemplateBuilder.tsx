import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Grid3x3, 
  Eye,
  Settings,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { TemplateLayout, TemplateComponent } from "@/types/templateBuilder";
import { templateBuilderService, createBlankTemplate } from "@/lib/templateBuilderService";
import { authLib } from "@/lib/auth";
import { ComponentPalette } from "./ComponentPalette";
import { TemplateCanvas } from "./TemplateCanvas";
import { PropertyPanel } from "./PropertyPanel";
import { TemplatePreview } from "./TemplatePreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const TemplateBuilder = () => {
  const { toast } = useToast();
  
  // EXPERIMENTAL FEATURE - Access Control
  const EXPERIMENTAL_MODE = import.meta.env.VITE_ENABLE_TEMPLATE_BUILDER !== 'true';
  
  const [currentTemplate, setCurrentTemplate] = useState<TemplateLayout | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<TemplateComponent | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSnap, setGridSnap] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<TemplateLayout[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  useEffect(() => {
    // Initialize with a blank template or load existing
    const session = authLib.getSession();
    if (session?.user) {
      loadDefaultTemplate();
    }

    // Listen for component add events from canvas
    const handleAddComponent = (e: CustomEvent) => {
      if (e.detail) {
        handleComponentAdd(e.detail);
      }
    };

    window.addEventListener('addComponent', handleAddComponent as EventListener);
    return () => {
      window.removeEventListener('addComponent', handleAddComponent as EventListener);
    };
  }, [currentTemplate]);

  const loadDefaultTemplate = async () => {
    try {
      const session = authLib.getSession();
      if (!session?.user) return;

      const defaultTemplate = await templateBuilderService.getDefaultTemplate(session.user.id);
      if (defaultTemplate) {
        setCurrentTemplate(defaultTemplate.layout);
        addToHistory(defaultTemplate.layout);
      }
    } catch (error) {
      console.error('Error loading default template:', error);
    }
  };

  const createNewTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }

    const newTemplate = createBlankTemplate(templateName);
    newTemplate.description = templateDescription;
    setCurrentTemplate(newTemplate);
    addToHistory(newTemplate);
    setShowNewTemplateDialog(false);
    setTemplateName("");
    setTemplateDescription("");

    toast({
      title: "Template created",
      description: "Start adding components to your template",
    });
  };

  const addToHistory = (template: TemplateLayout) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(template)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentTemplate(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentTemplate(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleComponentAdd = (component: TemplateComponent) => {
    if (!currentTemplate) return;

    const updatedTemplate = {
      ...currentTemplate,
      components: [...currentTemplate.components, component],
    };
    setCurrentTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
  };

  const handleComponentUpdate = (componentId: string, updates: Partial<TemplateComponent>) => {
    if (!currentTemplate) return;

    const updatedComponents = currentTemplate.components.map(comp => {
      if (comp.id === componentId) {
        // Deep merge for nested objects like style, position, size
        return {
          ...comp,
          ...updates,
          style: updates.style ? { ...comp.style, ...updates.style } : comp.style,
          position: updates.position ? { ...comp.position, ...updates.position } : comp.position,
          size: updates.size ? { ...comp.size, ...updates.size } : comp.size,
        };
      }
      return comp;
    });

    const updatedTemplate = {
      ...currentTemplate,
      components: updatedComponents,
    };
    setCurrentTemplate(updatedTemplate);
    
    // Also update selected component to reflect changes
    const updatedSelected = updatedComponents.find(c => c.id === componentId);
    if (updatedSelected) {
      setSelectedComponent(updatedSelected);
    }
    
    addToHistory(updatedTemplate);
  };

  const handleComponentDelete = (componentId: string) => {
    if (!currentTemplate) return;

    const updatedTemplate = {
      ...currentTemplate,
      components: currentTemplate.components.filter(comp => comp.id !== componentId),
    };
    setCurrentTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
    setSelectedComponent(null);
  };

  const handleSave = async () => {
    if (!currentTemplate) return;

    setSaving(true);
    try {
      const session = authLib.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save templates",
          variant: "destructive",
        });
        return;
      }

      // Check if template already exists
      const existingTemplates = await templateBuilderService.getUserTemplates(session.user.id);
      const existingTemplate = existingTemplates.find(t => t.layout.id === currentTemplate.id);

      if (existingTemplate) {
        // Update existing template
        await templateBuilderService.updateTemplate(existingTemplate.id, {
          layout: currentTemplate,
        });
        toast({
          title: "Template updated",
          description: "Your template has been saved successfully",
        });
      } else {
        // Save new template
        await templateBuilderService.saveTemplate(session.user.id, {
          name: currentTemplate.name,
          description: currentTemplate.description,
          layout: currentTemplate,
          is_default: false,
          thumbnail: undefined,
        });
        toast({
          title: "Template saved",
          description: "Your template has been saved successfully",
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error saving template",
        description: "Failed to save your template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Show experimental feature notice if not enabled
  if (EXPERIMENTAL_MODE) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Experimental Feature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                🧪 Template Builder - Under Development
              </p>
              <p className="text-sm text-yellow-700">
                The drag-and-drop template builder is currently in experimental mode and not available for general use.
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Status:</strong> Beta Testing</p>
              <p><strong>Availability:</strong> Coming Soon</p>
              <p><strong>Current Templates:</strong> Modern, Extrape, Default (available in invoice generation)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                💡 For Developers
              </p>
              <p className="text-sm text-blue-700 mb-2">
                To enable this feature for testing, add to your <code className="bg-blue-100 px-1 rounded">.env</code> file:
              </p>
              <code className="block bg-blue-100 text-blue-900 p-2 rounded text-xs">
                VITE_ENABLE_TEMPLATE_BUILDER=true
              </code>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-4">
              This feature will be available in a future release after thorough testing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="My Custom Invoice Template"
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Description (Optional)</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe your template..."
                rows={3}
              />
            </div>
            <Button onClick={createNewTemplate} className="w-full" variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{currentTemplate.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewTemplateDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* History Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border rounded-md px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(25, zoom - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* View Controls */}
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          {/* Save Button */}
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          <ComponentPalette onComponentAdd={handleComponentAdd} />
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <TemplateCanvas
            template={currentTemplate}
            selectedComponent={selectedComponent}
            onComponentSelect={setSelectedComponent}
            onComponentUpdate={handleComponentUpdate}
            onComponentDelete={handleComponentDelete}
            zoom={zoom}
            showGrid={showGrid}
            gridSnap={gridSnap}
          />
        </div>

        {/* Property Panel */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <PropertyPanel
            selectedComponent={selectedComponent}
            onComponentUpdate={(updates) => {
              if (selectedComponent) {
                handleComponentUpdate(selectedComponent.id, updates);
              }
            }}
            onComponentDelete={() => {
              if (selectedComponent) {
                handleComponentDelete(selectedComponent.id);
              }
            }}
          />
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview how your template will look with sample data
            </DialogDescription>
          </DialogHeader>
          <TemplatePreview template={currentTemplate} />
        </DialogContent>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Start fresh with a new invoice template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newTemplateName">Template Name</Label>
              <Input
                id="newTemplateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="My Custom Invoice Template"
              />
            </div>
            <div>
              <Label htmlFor="newTemplateDescription">Description (Optional)</Label>
              <Textarea
                id="newTemplateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe your template..."
                rows={3}
              />
            </div>
            <Button onClick={createNewTemplate} className="w-full" variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
