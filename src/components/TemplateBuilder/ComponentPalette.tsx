import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Image, 
  Building2, 
  MapPin, 
  Phone, 
  FileText, 
  Heading, 
  Type, 
  Hash, 
  Calendar, 
  CalendarClock,
  User,
  Table,
  Calculator,
  Percent,
  DollarSign,
  Building,
  PenTool,
  Minus,
  Space,
  Search
} from "lucide-react";
import { componentLibrary, createComponent } from "@/lib/templateBuilderService";
import { ComponentType, TemplateComponent } from "@/types/templateBuilder";

interface ComponentPaletteProps {
  onComponentAdd: (component: TemplateComponent) => void;
}

const iconMap: Record<string, any> = {
  Image, Building2, MapPin, Phone, FileText, Heading, Type, Hash, Calendar, 
  CalendarClock, User, Table, Calculator, Percent, DollarSign, Building, 
  PenTool, Minus, Space
};

export const ComponentPalette = ({ onComponentAdd }: ComponentPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'header', label: 'Header', color: 'bg-blue-100 text-blue-800' },
    { id: 'content', label: 'Content', color: 'bg-green-100 text-green-800' },
    { id: 'table', label: 'Table', color: 'bg-purple-100 text-purple-800' },
    { id: 'footer', label: 'Footer', color: 'bg-orange-100 text-orange-800' },
    { id: 'layout', label: 'Layout', color: 'bg-gray-100 text-gray-800' },
  ];

  const filteredComponents = componentLibrary.filter(comp => {
    const matchesSearch = comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, componentType: ComponentType) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleComponentClick = (componentType: ComponentType) => {
    // Add component to center of canvas
    const newComponent = createComponent(componentType, { x: 100, y: 100 });
    onComponentAdd(newComponent);
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Components</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>

      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className={`cursor-pointer ${selectedCategory === cat.id ? '' : cat.color}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-2 pt-0">
          {filteredComponents.map(component => {
            const Icon = iconMap[component.icon];
            return (
              <div
                key={component.type}
                draggable
                onDragStart={(e) => handleDragStart(e, component.type)}
                onClick={() => handleComponentClick(component.type)}
                className="flex items-start gap-3 p-3 border rounded-lg cursor-move hover:bg-gray-50 hover:border-primary transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
                  {Icon && <Icon className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{component.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {component.description}
                  </p>
                </div>
              </div>
            );
          })}
          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No components found</p>
              <p className="text-xs mt-1">Try a different search or category</p>
            </div>
          )}
        </CardContent>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Drag components onto the canvas or click to add them
        </p>
      </div>
    </div>
  );
};
