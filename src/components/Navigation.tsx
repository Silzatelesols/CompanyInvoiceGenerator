import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, Users, Package2, Building2, LayoutDashboard, LogOut, Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authLib } from "@/lib/auth";

interface NavigationProps {
  collapsed?: boolean;
}
export const Navigation = ({ collapsed = false }: NavigationProps) => {
  const location = useLocation();
  const { toast } = useToast();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
    { id: "invoices", label: "Invoices", href: "/invoices", icon: FileText },
    { id: "clients", label: "Clients", href: "/clients", icon: Users },
    { id: "companies", label: "Companies", href: "/companies", icon: Building2 },
    { id: "products", label: "Products", href: "/products", icon: Package2 },
    // { id: "template-builder", label: "Templates", href: "/template-builder", icon: Palette }, // EXPERIMENTAL - Hidden from users
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    authLib.logout();
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
    // Trigger a page refresh to update auth state
    window.location.reload();
  };

  return (
    <Card className="m-4 mb-0 p-1 bg-gradient-to-r from-primary to-primary-glow">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-white" />
          <h1 className="text-xl font-bold text-white">InvoiceHub</h1>
        </Link>
        
        <div className="flex items-center space-x-2">
          <nav className="flex space-x-1 bg-white/20 rounded-lg p-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link 
                  key={item.id}
                  to={item.href}
                  className={cn(
                    collapsed ? "justify-center" : ""
                  )}
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-white hover:text-white",
                      collapsed ? "justify-center h-8 w-8 p-0" : ""
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      collapsed ? "h-4 w-4" : "mr-2"
                    )} />
                    {!collapsed && item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};