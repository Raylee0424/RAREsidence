"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Building, Trash2, Plus } from "lucide-react";
import { apiGet, apiPatch, apiDelete, apiPostFormData, getImageUrl } from "@/lib/api";
import { centsToDollarInput, dollarsToCents } from "@/lib/money";
import { toast } from "sonner";
import { ACCEPTED_PHOTO_TYPES, filterValidPhotos } from "@/lib/photo-upload";
import type { Unit, UnitPhoto } from "@/lib/types";

const COMMON_AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Parking",
  "Gym",
  "Pool Access",
  "Laundry",
  "Balcony",
  "Pet Friendly",
  "Security 24/7",
  "Elevator",
];

function parseAmenities(amenities?: string | string[] | null): string[] {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;
  try {
    const parsed = JSON.parse(amenities);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return amenities.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function EditUnitContent() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<UnitPhoto[]>([]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    price: "",
    bedrooms: "1",
    bathrooms: "1",
    area: "",
    status: "AVAILABLE",
    description: "",
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function loadUnit() {
      try {
        const unit = await apiGet<Unit>(`/units/${id}`);
        setForm({
          name: unit.name,
          address: unit.address,
          price: centsToDollarInput(unit.priceCents),
          bedrooms: unit.bedrooms.toString(),
          bathrooms: unit.bathrooms.toString(),
          area: unit.area ? unit.area.toString() : "",
          status: unit.status,
          description: unit.description || "",
        });
        setSelectedAmenities(parseAmenities(unit.amenities));
        setExistingPhotos(unit.photos || []);
      } catch (err) {
        toast.error("Failed to load unit details");
      } finally {
        setLoading(false);
      }
    }
    loadUnit();
  }, [id]);

  function toggleAmenity(amenity: string) {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  }

  function addCustomAmenity() {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities([...selectedAmenities, customAmenity.trim()]);
      setCustomAmenity("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = filterValidPhotos(Array.from(e.target.files));
      e.target.value = "";
      setFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      await apiDelete(`/units/${id}/photos/${photoId}`);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to delete photo");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.price) {
      toast.error("Please fill in required fields");
      return;
    }
    const priceCents = dollarsToCents(form.price);
    if (priceCents === null) {
      toast.error("Enter the rent like 2500 or 2500.50");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update unit
      await apiPatch(`/units/${id}`, {
        name: form.name.trim(),
        address: form.address.trim(),
        priceCents,
        bedrooms: parseInt(form.bedrooms) || 1,
        bathrooms: parseInt(form.bathrooms) || 1,
        area: form.area ? parseFloat(form.area) : null,
        status: form.status,
        description: form.description.trim() || null,
        amenities: JSON.stringify(selectedAmenities),
      });

      // 2. Upload any newly added photos. The details above are already
      // saved, so say exactly what failed instead of "failed to update".
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("photos", file);
        });
        try {
          await apiPostFormData(`/units/${id}/photos`, formData);
        } catch (err) {
          const reason = err instanceof Error ? err.message : "upload failed";
          toast.error(`Details saved, but the new photos weren't added: ${reason}`);
          return;
        }
      }

      toast.success("Unit updated successfully!");
      router.push("/admin/units");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update unit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button asChild variant="ghost">
        <Link href="/admin/units">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Units
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Edit Unit
          </CardTitle>
          <CardDescription>Update unit specifications, status, and photos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name / Title *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Rent ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area (sqft)</Label>
                <Input
                  id="area"
                  type="number"
                  min="0"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val || "AVAILABLE" })}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status">
                    {(val: any) => {
                      const labels: Record<string, string> = {
                        AVAILABLE: "Available",
                        OCCUPIED: "Occupied",
                        MAINTENANCE: "Maintenance",
                      };
                      return labels[val] || val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Amenities Section */}
            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <Button
                      key={amenity}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add custom amenity..."
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustomAmenity}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>

            {/* Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="space-y-3">
                <Label>Current Photos ({existingPhotos.length})</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-md overflow-hidden aspect-video bg-muted border">
                      <img
                        src={getImageUrl(photo.path)}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full h-6 w-6 text-xs flex items-center justify-center opacity-90 hover:opacity-100"
                        title="Delete photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Upload Section */}
            <div className="space-y-3">
              <Label>Upload Additional Photos</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Select new images to upload to this unit
                </p>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_PHOTO_TYPES}
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload-edit"
                />
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="photo-upload-edit" className="cursor-pointer">
                    Select Images
                  </label>
                </Button>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative group rounded-md overflow-hidden aspect-video bg-muted border">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center opacity-90 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditUnitPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      }
    >
      <EditUnitContent />
    </Suspense>
  );
}
