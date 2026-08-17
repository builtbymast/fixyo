import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { label: "Business", href: "/app/settings/business" },
  { label: "Your Profile", href: "/app/settings/user" },
  { label: "Subscription", href: "/app/settings/subscription" },
];

export default function SettingsNav() {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-1 border-b border-border">
      {SETTINGS_TABS.map((tab) => {
        const isActive = location === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => setLocation(tab.href)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
