"use-client";

import Link from "next/link";

export default function HomeNavbar() {
  return (
    <div className="bg-surface-container-high border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold">
            RAREsidence
          </Link>
        </div> 
      </div>
    </div>
  )
}