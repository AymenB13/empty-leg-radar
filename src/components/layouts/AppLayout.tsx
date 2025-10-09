import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Activity, BarChart3, Settings, Briefcase } from "lucide-react";
import { UserMenu } from "./UserMenu";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navItems = [
    { to: "/signals", icon: Activity, label: "Signals" },
    { to: "/opportunities", icon: Briefcase, label: "Opportunities" },
    { to: "/patterns", icon: BarChart3, label: "Patterns" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
        <h1 className="text-lg font-medium">Empty Leg Radar</h1>
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
