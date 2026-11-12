"use client";

import { Building, CalendarCheck, CreditCard, LayoutDashboard, Users } from "lucide-react";
import { DashboardShell, type NavLink } from "@/components/dashboard-shell";

const links: NavLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/units", label: "Units", icon: Building },
  { href: "/admin/bookings", label: "Viewing requests", icon: CalendarCheck },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="ADMIN" links={links}>
      {children}
    </DashboardShell>
  );
}
