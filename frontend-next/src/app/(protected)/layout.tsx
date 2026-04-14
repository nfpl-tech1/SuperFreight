"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsCompactDesktop } from "@/hooks/use-is-compact-desktop";
import { Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, logout, requiresOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isCompactDesktop = useIsCompactDesktop();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isVendorsRoute = pathname === "/vendors";
  const effectiveSidebarCollapsed = isCompactDesktop || sidebarCollapsed;
  const desktopShellClass = isVendorsRoute
    ? "h-svh overflow-hidden"
    : "min-h-svh";
  const desktopMainOverflowClass = "overflow-auto";
  const desktopMainPaddingClass = isVendorsRoute
    ? isCompactDesktop
      ? "px-4 pb-4 pt-4 lg:px-5"
      : "px-5 pb-4 pt-4 2xl:px-8"
    : isCompactDesktop
      ? "p-4 lg:p-5"
      : "p-5 2xl:p-8";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isLoading && isAuthenticated && requiresOnboarding) {
      router.replace("/onboarding");
    }
  }, [isLoading, isAuthenticated, requiresOnboarding, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || requiresOnboarding) return null;

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-svh w-full">
        <header className="sticky top-0 z-50 h-[3.75rem] flex items-center justify-between px-4 bg-white border-b border-border shadow-sm">
          <div className="flex items-center gap-2">
            <BrandLogo
              variant="mark"
              alt="Nagarkot"
              className="h-7 w-auto object-contain"
              sizes="28px"
            />
            <span className="text-lg font-bold tracking-widest uppercase" style={{ color: "hsl(228,55%,23%)" }}>NAGARKOT</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            <button
              onClick={() => void logout()}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.7rem] font-bold"
            >
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 pt-4 pb-20 overflow-y-auto">{children}</main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className={`relative flex w-full overflow-visible ${desktopShellClass}`}>
      <AppSidebar collapsed={effectiveSidebarCollapsed} />
      <div className="flex min-h-0 flex-1 flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center justify-between gap-3 border-b border-border bg-white px-4 lg:px-5 2xl:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              title={effectiveSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={effectiveSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {effectiveSidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" strokeWidth={2.1} />
              ) : (
                <PanelLeftClose className="h-5 w-5" strokeWidth={2.1} />
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 lg:gap-5">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end xl:flex">
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {user?.isAppAdmin ? "Operations Admin" : "Freight Team"}
                </span>
              </div>
              <button
                onClick={() => void logout()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold"
                title="Sign out"
              >
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </button>
            </div>
          </div>
        </header>
        <main
          className={`min-h-0 flex-1 bg-background transition-[padding] ${desktopMainPaddingClass} ${desktopMainOverflowClass}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
