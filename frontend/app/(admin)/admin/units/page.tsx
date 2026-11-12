"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
} from "lucide-react";
import { apiGet, apiDelete, getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/skeletons";
import { unitFacts } from "@/components/unit-card";
import type { Unit } from "@/lib/types";

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchUnits() {
    try {
      const data = await apiGet<Unit[]>("/units");
      setUnits(data);
    } catch {
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUnits();
  }, []);

  async function handleDeleteConfirm() {
    if (!unitToDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/units/${unitToDelete.id}`);
      toast.success("Unit deleted successfully");
      setUnitToDelete(null);
      fetchUnits();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete unit");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Units</h1>
          <p className="mt-1 text-muted-foreground">Listings, prices and availability.</p>
        </div>
        <Button asChild>
          <Link href="/admin/units/new">
            <Plus data-icon="inline-start" /> Add unit
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={3} columns={6} />
          ) : units.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-medium mb-1">No units created yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first residential unit listing.
              </p>
              <Button asChild>
                <Link href="/admin/units/new">
                  <Plus data-icon="inline-start" /> Add unit
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"><span className="sr-only">Photo</span></TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => {
                  const primaryPhoto =
                    unit.photos && unit.photos.length > 0
                      ? unit.photos.find((p) => p.isPrimary) || unit.photos[0]
                      : null;

                  return (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                          <img
                            src={getImageUrl(primaryPhoto ? primaryPhoto.path : null)}
                            alt={unit.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{unit.name}</p>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {unit.photos.length} {unit.photos.length === 1 ? "photo" : "photos"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                        {unit.address}
                      </TableCell>
                      <TableCell className="text-sm">
                        {unitFacts(unit)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(unit.priceCents)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={unit.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/units/${unit.id}`} target="_blank" aria-label={`View ${unit.name} listing`} title="View listing">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </Button>
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/admin/units/${unit.id}/edit`} aria-label={`Edit ${unit.name}`} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setUnitToDelete(unit)}
                            aria-label={`Delete ${unit.name}`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{unitToDelete?.name}&quot;? This permanently removes its photos and viewing requests. Units with assigned tenants or payment records can&apos;t be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} loading={deleting}>
              {deleting ? "Deleting" : "Delete unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

