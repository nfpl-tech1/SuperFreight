"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, GitCompare, BriefcaseBusiness } from "lucide-react";

const mobileNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Inquiries", href: "/inquiries", icon: BriefcaseBusiness },
  { title: "RFQ", href: "/rfq", icon: FileText },
  { title: "Compare", href: "/comparison", icon: GitCompare },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-border flex items-stretch">
      {mobileNav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-[0.65rem] font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
