import { useState, useRef, useEffect } from "react";
import { TemplateLayout, TemplateComponent, ComponentType } from "@/types/templateBuilder";
import { createComponent } from "@/lib/templateBuilderService";
import { Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react";

interface TemplateCanvasProps {
  template: TemplateLayout;
  selectedComponent: TemplateComponent | null;
  onComponentSelect: (component: TemplateComponent | null) => void;
  onComponentUpdate: (componentId: string, updates: Partial<TemplateComponent>) => void;
  onComponentDelete: (componentId: string) => void;
  zoom: number;
  showGrid: boolean;
  gridSnap: boolean;
}

export const TemplateCanvas = ({
  template,
  selectedComponent,
  onComponentSelect,
  onComponentUpdate,
  onComponentDelete,
  zoom,
  showGrid,
  gridSnap,
}: TemplateCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [resizingComponent, setResizingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // A4 dimensions in pixels at 96 DPI
  const pageWidth = template.orientation === 'portrait' ? 794 : 1123;
  const pageHeight = template.orientation === 'portrait' ? 1123 : 794;

  const snapToGrid = (value: number, gridSize: number = 10): number => {
    if (!gridSnap) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (!componentType) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate position accounting for zoom
    const x = snapToGrid((e.clientX - rect.left) / (zoom / 100));
    const y = snapToGrid((e.clientY - rect.top) / (zoom / 100));

    const newComponent = createComponent(componentType, { x, y });
    
    // Add the component through the parent handler
    // We need to trigger the add through a different mechanism
    const event = new CustomEvent('addComponent', { detail: newComponent });
    window.dispatchEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleComponentMouseDown = (e: React.MouseEvent, component: TemplateComponent) => {
    if (component.locked) return;
    e.stopPropagation();

    onComponentSelect(component);
    setDraggingComponent(component.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: (e.clientX - rect.left) / (zoom / 100) - component.position.x,
      y: (e.clientY - rect.top) / (zoom / 100) - component.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingComponent && !resizingComponent) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left) / (zoom / 100);
    const mouseY = (e.clientY - rect.top) / (zoom / 100);

    if (draggingComponent) {
      const newX = snapToGrid(mouseX - dragOffset.x);
      const newY = snapToGrid(mouseY - dragOffset.y);

      onComponentUpdate(draggingComponent, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) },
      });
    }

    if (resizingComponent) {
      const deltaX = mouseX - resizeStart.x;
      const deltaY = mouseY - resizeStart.y;

      const newWidth = snapToGrid(Math.max(50, resizeStart.width + deltaX));
      const newHeight = snapToGrid(Math.max(30, resizeStart.height + deltaY));

      onComponentUpdate(resizingComponent, {
        size: { width: newWidth, height: newHeight },
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingComponent(null);
    setResizingComponent(null);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, component: TemplateComponent) => {
    if (component.locked) return;
    e.stopPropagation();

    setResizingComponent(component.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setResizeStart({
      x: (e.clientX - rect.left) / (zoom / 100),
      y: (e.clientY - rect.top) / (zoom / 100),
      width: component.size.width,
      height: component.size.height,
    });
  };

  const renderComponent = (component: TemplateComponent) => {
    if (!component.visible) return null;

    const isSelected = selectedComponent?.id === component.id;
    const style = {
      position: 'absolute' as const,
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      width: `${component.size.width}px`,
      height: `${component.size.height}px`,
      ...component.style,
      fontFamily: component.style.fontFamily || 'Roboto, sans-serif',
      cursor: component.locked ? 'default' : 'move',
      border: isSelected ? '2px solid #0066cc' : '1px dashed #cccccc',
      backgroundColor: component.style.backgroundColor || 'rgba(255, 255, 255, 0.9)',
    };

    return (
      <div
        key={component.id}
        style={style}
        className="group"
        onMouseDown={(e) => handleComponentMouseDown(e, component)}
        onClick={(e) => {
          e.stopPropagation();
          onComponentSelect(component);
        }}
      >
        {/* Component Content */}
        <div className="h-full w-full flex items-center justify-center p-2 overflow-hidden">
          <span className="text-xs text-gray-600 truncate">
            {component.content || component.label}
          </span>
        </div>

        {/* Resize Handle */}
        {isSelected && !component.locked && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, component)}
          />
        )}

        {/* Component Controls */}
        {isSelected && (
          <div className="absolute -top-8 left-0 flex gap-1 bg-white border rounded shadow-sm p-1">
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onComponentUpdate(component.id, { locked: !component.locked });
              }}
              title={component.locked ? "Unlock" : "Lock"}
            >
              {component.locked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onComponentUpdate(component.id, { visible: !component.visible });
              }}
              title={component.visible ? "Hide" : "Show"}
            >
              {component.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </button>
            <button
              className="p-1 hover:bg-red-100 rounded text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onComponentDelete(component.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Lock Indicator */}
        {component.locked && (
          <div className="absolute top-1 right-1">
            <Lock className="h-3 w-3 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative mx-auto bg-white shadow-lg"
      style={{
        width: `${pageWidth * (zoom / 100)}px`,
        height: `${pageHeight * (zoom / 100)}px`,
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top left',
        backgroundImage: showGrid
          ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
          : 'none',
        backgroundSize: showGrid ? '10px 10px' : 'auto',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => onComponentSelect(null)}
    >
      {/* Margins Guide */}
      <div
        className="absolute border-2 border-dashed border-blue-300 pointer-events-none"
        style={{
          top: `${template.margins.top}px`,
          left: `${template.margins.left}px`,
          right: `${template.margins.right}px`,
          bottom: `${template.margins.bottom}px`,
        }}
      />

      {/* Components */}
      {template.components.map(renderComponent)}

      {/* Empty State */}
      {template.components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium">Drag components here</p>
            <p className="text-sm">or click on components in the palette to add them</p>
          </div>
        </div>
      )}
    </div>
  );
};
