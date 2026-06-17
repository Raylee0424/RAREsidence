"use client";

import TopBar from "@/components/pages/topbar.tsx";
import UnitGrid from "@/components/pages/unit-grid.tsx";

export default function Home() {
  return (
    <>
      <TopBar />
      <div className="container mx-auto flex items-center justify-center">
        <div className="mt-10">
          <div className="grid grid-cols-2 grid-rows-2 gap-10">
            <UnitGrid />

            <UnitGrid />

            <UnitGrid />

            <UnitGrid />
          </div>
        </div>
      </div>
    </>
  );
}
