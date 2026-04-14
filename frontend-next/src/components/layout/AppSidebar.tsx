"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  FileText,
  GitCompare,
  Mail,
  User,
  Settings,
  LogOut,
  BriefcaseBusiness,
  ShipWheel,
  MapPinned,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";

const baseNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Inquiry Capture", href: "/inquiries", icon: BriefcaseBusiness },
  { title: "RFQ Drafting", href: "/rfq", icon: FileText },
  { title: "Quote Comparison", href: "/comparison", icon: GitCompare },
  { title: "Customer Quote", href: "/customer-quote", icon: Mail },
  { title: "Vendor Master", href: "/vendors", icon: Building2 },
  { title: "Rate Sheets", href: "/rate-sheets", icon: ShipWheel },
  { title: "Profile", href: "/profile", icon: User },
];

interface AppSidebarProps {
  collapsed: boolean;
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    ...baseNav,
    ...(user?.role === "ADMIN"
      ? [
          { title: "User Management", href: "/admin/users", icon: Settings },
          { title: "Role Builder", href: "/admin/roles", icon: Settings },
          { title: "Port Master", href: "/admin/ports", icon: MapPinned },
        ]
      : []),
  ];

  if (collapsed) {
    return (
      <aside
        className="sticky top-0 relative z-[60] h-svh w-16 shrink-0 overflow-visible flex flex-col"
        style={{ background: "hsl(228,55%,23%)" }}
      >
        <div className="flex items-center justify-center h-14 bg-white border-b border-slate-200">
          <BrandLogo
            variant="mark"
            alt="Nagarkot"
            className="h-7 w-auto object-contain"
            sizes="28px"
          />
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 items-center">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        <div className="py-3 flex flex-col items-center" style={{ borderTop: "1px solid hsl(228,50%,30%)" }}>
          <button
            onClick={() => void logout()}
            title="Logout"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-0 relative z-[60] h-svh w-60 shrink-0 overflow-visible flex flex-col border-r border-slate-200 bg-slate-50 2xl:w-64">
      <div className="h-14 flex items-center px-5 border-b border-slate-200">
        <BrandLogo
          alt="Nagarkot Forwarders"
          className="h-8 w-auto object-contain"
          sizes="280px"
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-primary border-l-4 border-primary rounded-none rounded-r-lg"
                  : "text-slate-500 hover:text-primary hover:bg-white rounded-lg"
              }`}
              style={active ? { color: "hsl(228,55%,23%)" } : undefined}
            >
              <item.icon className="h-[1.1rem] w-[1.1rem] shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => void logout()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-primary hover:bg-white w-full transition-all"
        >
          <LogOut className="h-[1.1rem] w-[1.1rem] shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
