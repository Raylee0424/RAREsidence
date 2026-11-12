"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

function Wordmark() {
  return (
    <Link href="/" className="text-lg font-semibold tracking-tight">
      RARE<span className="text-brand">sidence</span>
    </Link>
  );
}

export function PublicHeader() {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);

  // The page's own call to action is the primary button; the account link stays quiet.
  const account = isAuthenticated
    ? { href: user?.role === "ADMIN" ? "/admin" : "/tenant", label: "Dashboard" }
    : { href: "/login", label: "Log in" };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Wordmark />

        <nav className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/units">Homes</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={account.href}>{account.label}</Link>
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-6">
            <SheetTitle className="mb-6 text-lg font-semibold">Menu</SheetTitle>
            <nav className="flex flex-col gap-4">
              <Link href="/units" onClick={() => setOpen(false)} className="font-medium">
                Homes
              </Link>
              <Link href={account.href} onClick={() => setOpen(false)} className="font-medium">
                {account.label}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© RAREsidence</p>
        <nav className="flex gap-6">
          <Link href="/units" className="transition-colors hover:text-foreground">
            Available homes
          </Link>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Tenant &amp; manager login
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
