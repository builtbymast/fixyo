import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, Briefcase, FileText, Users, Zap, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(true);

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/app/dashboard" },
    { icon: Briefcase, label: "Jobs", href: "/app/jobs" },
    { icon: FileText, label: "Quotes", href: "/app/quotes" },
    { icon: FileText, label: "Invoices", href: "/app/invoices" },
    { icon: Users, label: "Customers", href: "/app/customers" },
    { icon: Zap, label: "AI Generator", href: "/app/ai" },
    { icon: Settings, label: "Settings", href: "/app/settings/business" },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="border-r border-border">
        <SidebarHeader className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FY</span>
            </div>
            {open && <span className="font-bold text-lg text-primary">FixYo</span>}
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  onClick={() => setLocation(item.href)}
                  className="w-full justify-start gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {open && <span>{item.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="border-t border-border p-4 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            {open && "Logout"}
          </Button>
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl font-bold text-foreground">FixYo</h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
