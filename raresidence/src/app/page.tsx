'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto flex items-center justify-center m-10">
      <Button asChild>
        <Link href="/units">View Units</Link>
      </Button>
    </div>
  )
}