"use client";

import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/">
          <p className="text-xl font-bold hover:text-gray-700">RARESIDENCE</p>
        </Link>

        <Button variant="ghost" size="lg">
          Book a Viewing
        </Button>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}