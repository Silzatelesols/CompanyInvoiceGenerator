import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TemplateComponent } from "@/types/templateBuilder";
import { Trash2, Settings } from "lucide-react";

interface PropertyPanelProps {
  selectedComponent: TemplateComponent | null;
  onComponentUpdate: (updates: Partial<TemplateComponent>) => void;
  onComponentDelete: () => void;
}

export const PropertyPanel = ({
  selectedComponent,
  onComponentUpdate,
  onComponentDelete,
}: PropertyPanelProps) => {
  if (!selectedComponent) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Settings className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p className="text-sm">Select a component to edit its properties</p>
      </div>
    );
  }

  const handleStyleChange = (property: string, value: string) => {
    onComponentUpdate({
      style: {
        ...selectedComponent.style,
        [property]: value,
      },
    });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onComponentUpdate({
      position: {
        ...selectedComponent.position,
        [axis]: value,
      },
    });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    onComponentUpdate({
      size: {
        ...selectedComponent.size,
        [dimension]: value,
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{selectedComponent.label}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onComponentDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{selectedComponent.type}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content */}
        {selectedComponent.content !== undefined && (
          <>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={selectedComponent.content}
                onChange={(e) => onComponentUpdate({ content: e.target.value })}
                rows={3}
              />
            </div>
            <Separator />
          </>
        )}

        {/* Position */}
        <div>
          <Label className="text-sm font-semibold">Position</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label htmlFor="posX" className="text-xs">X</Label>
              <Input
                id="posX"
                type="number"
                value={selectedComponent.position.x}
                onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="posY" className="text-xs">Y</Label>
              <Input
                id="posY"
                type="number"
                value={selectedComponent.position.y}
                onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <Label className="text-sm font-semibold">Size</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label htmlFor="width" className="text-xs">Width</Label>
              <Input
                id="width"
                type="number"
                value={selectedComponent.size.width}
                onChange={(e) => handleSizeChange('width', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs">Height</Label>
              <Input
                id="height"
                type="number"
                value={selectedComponent.size.height}
                onChange={(e) => handleSizeChange('height', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Typography */}
        <div>
          <Label className="text-sm font-semibold">Typography</Label>
          <div className="space-y-2 mt-2">
            <div>
              <Label htmlFor="fontFamily" className="text-xs">Font Family</Label>
              <Select
                value={selectedComponent.style.fontFamily || 'Roboto'}
                onValueChange={(value) => handleStyleChange('fontFamily', value)}
              >
                <SelectTrigger id="fontFamily">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Raleway">Raleway</SelectItem>
                  <SelectItem value="Ubuntu">Ubuntu</SelectItem>
                  <SelectItem value="Nunito">Nunito</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                  <SelectItem value="PT Sans">PT Sans</SelectItem>
                  <SelectItem value="Oswald">Oswald</SelectItem>
                  <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                  <SelectItem value="Noto Sans">Noto Sans</SelectItem>
                  <SelectItem value="Work Sans">Work Sans</SelectItem>
                  <SelectItem value="Quicksand">Quicksand</SelectItem>
                  <SelectItem value="Mukta">Mukta</SelectItem>
                  <SelectItem value="Rubik">Rubik</SelectItem>
                  <SelectItem value="Karla">Karla</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
              <div className="flex gap-2">
                <Input
                  id="fontSize"
                  type="number"
                  value={parseInt(selectedComponent.style.fontSize || '12') || 12}
                  onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                  placeholder="12"
                  className="flex-1"
                  min="6"
                  max="72"
                />
                <span className="flex items-center text-xs text-muted-foreground">px</span>
              </div>
            </div>
            <div>
              <Label htmlFor="fontWeight" className="text-xs">Font Weight</Label>
              <Select
                value={selectedComponent.style.fontWeight || 'normal'}
                onValueChange={(value) => handleStyleChange('fontWeight', value)}
              >
                <SelectTrigger id="fontWeight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Thin (100)</SelectItem>
                  <SelectItem value="200">Extra Light (200)</SelectItem>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="normal">Normal (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semi Bold (600)</SelectItem>
                  <SelectItem value="bold">Bold (700)</SelectItem>
                  <SelectItem value="800">Extra Bold (800)</SelectItem>
                  <SelectItem value="900">Black (900)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontStyle" className="text-xs">Font Style</Label>
              <Select
                value={selectedComponent.style.fontStyle || 'normal'}
                onValueChange={(value) => handleStyleChange('fontStyle', value)}
              >
                <SelectTrigger id="fontStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="italic">Italic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="textAlign" className="text-xs">Text Align</Label>
              <Select
                value={selectedComponent.style.textAlign || 'left'}
                onValueChange={(value) => handleStyleChange('textAlign', value)}
              >
                <SelectTrigger id="textAlign">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div>
          <Label className="text-sm font-semibold">Colors</Label>
          <div className="space-y-2 mt-2">
            <div>
              <Label htmlFor="color" className="text-xs">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={selectedComponent.style.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={selectedComponent.style.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={selectedComponent.style.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={selectedComponent.style.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Spacing */}
        <div>
          <Label className="text-sm font-semibold">Spacing</Label>
          <div className="space-y-2 mt-2">
            <div>
              <Label htmlFor="padding" className="text-xs">Padding</Label>
              <Input
                id="padding"
                value={selectedComponent.style.padding || '0px'}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="10px"
              />
            </div>
            <div>
              <Label htmlFor="margin" className="text-xs">Margin</Label>
              <Input
                id="margin"
                value={selectedComponent.style.margin || '0px'}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                placeholder="10px"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Border */}
        <div>
          <Label className="text-sm font-semibold">Border</Label>
          <div className="space-y-2 mt-2">
            <div>
              <Label htmlFor="borderWidth" className="text-xs">Border Width</Label>
              <Input
                id="borderWidth"
                value={selectedComponent.style.borderWidth || '0px'}
                onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                placeholder="1px"
              />
            </div>
            <div>
              <Label htmlFor="borderStyle" className="text-xs">Border Style</Label>
              <Select
                value={selectedComponent.style.borderStyle || 'solid'}
                onValueChange={(value) => handleStyleChange('borderStyle', value)}
              >
                <SelectTrigger id="borderStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
              <div className="flex gap-2">
                <Input
                  id="borderColor"
                  type="color"
                  value={selectedComponent.style.borderColor || '#000000'}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={selectedComponent.style.borderColor || '#000000'}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
