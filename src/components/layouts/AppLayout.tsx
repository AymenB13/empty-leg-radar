import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Search, Calendar, Settings } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { AboutDialog } from "@/components/AboutDialog";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navItems = [
    { to: "/find-cover", icon: Search, label: "Find Cover" },
    { to: "/briefing", icon: Calendar, label: "Briefing" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium">Empty Leg Radar</h1>
          <AboutDialog />
        </div>
        <UserMenu />
      </header>
      
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-48 border-r border-border bg-background">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
