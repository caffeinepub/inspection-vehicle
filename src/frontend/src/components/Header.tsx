import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import type { AppPage } from "../App";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  currentPage: AppPage;
  navigate: (page: AppPage) => void;
  userProfile: UserProfile | null | undefined;
}

export default function Header({
  currentPage,
  navigate,
  userProfile,
}: HeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navLinks = [
    { label: "Dashboard", page: { name: "dashboard" } as AppPage },
    { label: "New Inspection", page: { name: "new-inspection" } as AppPage },
  ];

  const isActive = (page: AppPage) => page.name === currentPage.name;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            type="button"
            data-ocid="header.link"
            onClick={() => navigate({ name: "dashboard" })}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(var(--navy))" }}
            >
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "oklch(var(--navy))" }}
            >
              InspectWheels
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.label}
                data-ocid={`header.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
                onClick={() => navigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.page)
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={
                  isActive(link.page)
                    ? { background: "oklch(var(--teal))" }
                    : {}
                }
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              data-ocid="header.new_inspection.primary_button"
              onClick={() => navigate({ name: "new-inspection" })}
              size="sm"
              className="hidden md:flex h-9 font-semibold text-xs uppercase tracking-wider"
              style={{ background: "oklch(var(--teal))" }}
            >
              Start New Inspection
            </Button>

            {identity && (
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {userProfile?.name ?? "User"}
                </span>
                <button
                  type="button"
                  data-ocid="header.logout.button"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              data-ocid="header.mobile_menu.button"
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.label}
              onClick={() => {
                navigate(link.page);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.page) ? "text-white" : "text-foreground"
              }`}
              style={
                isActive(link.page) ? { background: "oklch(var(--teal))" } : {}
              }
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-destructive"
          >
            Log Out
          </button>
        </div>
      )}
    </header>
  );
}
