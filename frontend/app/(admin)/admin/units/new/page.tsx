"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { ArrowLeft, Upload, Building, Plus } from "lucide-react";
import { apiPostFormData } from "@/lib/api";
import { dollarsToCents } from "@/lib/money";
import { toast } from "sonner";
import { ACCEPTED_PHOTO_TYPES, filterValidPhotos } from "@/lib/photo-upload";
import type { Unit } from "@/lib/types";

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

export default function AddUnitPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

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

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["WiFi", "Air Conditioning"]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.price) {
      toast.error("Please fill in all required fields (Name, Address, Price)");
      return;
    }
    const priceCents = dollarsToCents(form.price);
    if (priceCents === null) {
      toast.error("Enter the rent like 2500 or 2500.50");
      return;
    }

    setSubmitting(true);
    try {
      // One multipart request: the API creates the unit and its photos
      // together, so a failure never leaves a half-made unit behind.
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("address", form.address.trim());
      formData.append("priceCents", String(priceCents));
      formData.append("bedrooms", String(parseInt(form.bedrooms) || 1));
      formData.append("bathrooms", String(parseInt(form.bathrooms) || 1));
      if (form.area) formData.append("area", String(parseFloat(form.area)));
      formData.append("status", form.status);
      if (form.description.trim()) formData.append("description", form.description.trim());
      formData.append("amenities", JSON.stringify(selectedAmenities));
      files.forEach((file) => formData.append("photos", file));

      await apiPostFormData<Unit>("/units", formData);

      toast.success("Unit created successfully!");
      router.push("/admin/units");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create unit");
    } finally {
      setSubmitting(false);
    }
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
            Add New Unit
          </CardTitle>
          <CardDescription>
            Create a new residential property unit listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name / Title *</Label>
              <Input
                id="name"
                placeholder="e.g. Skyline Penthouse 4B"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="e.g. 742 Evergreen Terrace, Unit 4B"
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
                  placeholder="2500"
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
                  placeholder="950"
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
                placeholder="Highlight the key features, neighborhood conveniences, and specifications of this unit..."
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

            {/* Photos Upload Section */}
            <div className="space-y-3">
              <Label>Unit Photos</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload photos for this unit (JPEG, PNG or WebP, up to 5 MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_PHOTO_TYPES}
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="photo-upload" className="cursor-pointer">
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
              {submitting ? "Saving Unit..." : "Create Unit Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
