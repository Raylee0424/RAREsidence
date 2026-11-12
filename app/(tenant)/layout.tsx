"use client";

import { CreditCard, Home, LayoutDashboard } from "lucide-react";
import { DashboardShell, type NavLink } from "@/components/dashboard-shell";

const links: NavLink[] = [
  { href: "/tenant", label: "Overview", icon: LayoutDashboard },
  { href: "/tenant/unit", label: "My home", icon: Home },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="TENANT" links={links}>
      {children}
    </DashboardShell>
  );
}
