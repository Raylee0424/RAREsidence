'use client';

import { Button } from "@/components/ui/button.tsx";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center justify-center rounded-[25px] h-10 w-10 bg-black">
          <img src="/vercel.svg" alt="Vercel Logo" className="h-6 w-6 bg-black" />
        </div>

        <Button variant="ghost" size="lg">
          Book a Viewing
        </Button>

        <Button variant="ghost" size="lg">
          Sign In
        </Button>
        
      </div>
    </header>
  )
}