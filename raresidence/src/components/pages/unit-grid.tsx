"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnitGrid({
  id,
  name,
  status,
}: {
  id: number;
  name: string;
  status: string;
}) {
  return (
    <Card className="mx-auto w-full max-w-sm overflow-hidden pt-0">
      <div className="relative aspect-video w-full">
        <div className="absolute inset-0 z-10 bg-black/10" />
        {/* Need to change image from the database */}
        <img
          src="/UnitImg.jpg"
          alt="Unit cover"
          className="relative z-0 h-full w-full object-cover"
        />
      </div>

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge variant="secondary">{status}</Badge>
        </div>

        <CardDescription className="text-base">
          10 sq ft • 1 Bedroom • 1 Bath
        </CardDescription>
      </CardHeader>

      <CardFooter className="border-t pt-6">
        <Button className="w-full">View Unit</Button>
      </CardFooter>
    </Card>
  );
}
