import { NavLink } from "react-router-dom";
import { AlertTriangle, Users, Wifi, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Complaints",
    href: "/",
    icon: AlertTriangle,
    description: "Manage resident issues"
  },
  {
    title: "Residents",
    href: "/residents",
    icon: Users,
    description: "Resident management"
  },
  {
    title: "Speed Test",
    href: "/speed-test",
    icon: Gauge,
    description: "Test internet speed"
  }
];

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border min-h-screen shadow-soft-sm">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-foreground">WiFi Manager</h1>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-sage-light text-sage-foreground shadow-soft-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-sage" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <div>
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}