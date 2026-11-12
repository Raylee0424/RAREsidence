"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, type LucideIcon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DashboardSkeleton } from "@/components/skeletons";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Defined at module level (not inside render) so it isn't remounted on every render.
function Sidebar({
  links,
  pathname,
  onNavigate,
  onLogout,
}: {
  links: NavLink[];
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const home = links[0].href;
  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="px-5 py-5 text-lg font-semibold tracking-tight">
        RARE<span className="text-brand">sidence</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== home && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <link.icon className="size-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </button>
      </div>
    </div>
  );
}

interface DashboardShellProps {
  role: "ADMIN" | "TENANT";
  links: NavLink[];
  children: React.ReactNode;
}

// usePathname() reads request data, which cacheComponents requires to sit
// inside a Suspense boundary (the build fails otherwise).
export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShellContent {...props} />
    </Suspense>
  );
}

function DashboardShellContent({ role, links, children }: DashboardShellProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // proxy.ts already redirects most cases on the server; this covers a session
  // that expires or a role that changes while the page is open.
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== role)) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, user, role, router]);

  if (isLoading || !isAuthenticated || user?.role !== role) {
    return <DashboardSkeleton />;
  }

  const sidebar = (
    <Sidebar links={links} pathname={pathname} onNavigate={() => setOpen(false)} onLogout={logout} />
  );

  return (
    <div className="flex h-screen">
      <aside className="hidden w-60 flex-col border-r bg-card md:flex">{sidebar}</aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
          <span className="ml-auto text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.name}</span>
          </span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
