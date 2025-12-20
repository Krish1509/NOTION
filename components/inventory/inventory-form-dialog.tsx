"use client";

/**
 * Inventory Form Dialog
 * 
 * Dialog for creating and editing inventory items with image upload.
 * Purchase Officer can create/edit items.
 * Site Engineer can add images to existing items.
 */

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UnitInput } from "./unit-input";
import { CameraDialog } from "./camera-dialog";
import { Camera, Upload, X, Search } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { ROLES } from "@/lib/auth/roles";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: Id<"inventory"> | null;
  initialData?: {
    itemName: string;
    unit: string;
    centralStock: number;
    vendorId: Id<"vendors">;
  } | null;
  mode?: "create" | "edit" | "add-image"; // add-image for Site Engineer
}

export function InventoryFormDialog({
  open,
  onOpenChange,
  itemId,
  initialData,
  mode = "create",
}: InventoryFormDialogProps) {
  const userRole = useUserRole();
  const createItem = useMutation(api.inventory.createInventoryItem);
  const updateItem = useMutation(api.inventory.updateInventoryItem);
  const addImage = useMutation(api.inventory.addImageToInventory);
  
  // Determine if we're in add-image mode (needed before queries)
  const isAddImageMode = mode === "add-image";
  
  // Only query vendors if user can create/edit items (Purchase Officer)
  // Site Engineers only add images, so they don't need vendors
  const canQueryVendors = userRole === ROLES.PURCHASE_OFFICER && !isAddImageMode;
  const vendors = useQuery(
    api.vendors.getAllVendors,
    canQueryVendors ? {} : "skip"
  );
  
  const currentItem = useQuery(
    api.inventory.getInventoryItemById,
    itemId ? { itemId } : "skip"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorPopoverOpen, setVendorPopoverOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const canEdit = userRole === ROLES.PURCHASE_OFFICER && !isAddImageMode;
  // Purchase Officer can add images when creating or editing items
  // Site Engineer can add images to existing items only
  const canAddImages =
    (userRole === ROLES.PURCHASE_OFFICER && !isAddImageMode) ||
    (userRole === ROLES.SITE_ENGINEER && itemId) ||
    isAddImageMode;

  const [formData, setFormData] = useState({
    itemName: "",
    unit: "",
    centralStock: undefined as number | undefined,
    vendorId: "" as Id<"vendors"> | "",
  });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        itemName: initialData.itemName,
        unit: initialData.unit,
        centralStock: initialData.centralStock,
        vendorId: initialData.vendorId,
      });
    } else if (currentItem && !isAddImageMode) {
      setFormData({
        itemName: currentItem.itemName,
        unit: currentItem.unit ?? "",
        centralStock: currentItem.centralStock,
        vendorId: currentItem.vendorId ?? ("" as Id<"vendors"> | ""),
      });
    } else {
      setFormData({
        itemName: "",
        unit: "",
        centralStock: undefined,
        vendorId: "" as Id<"vendors"> | "",
      });
    }
    setSelectedImages([]);
    setImagePreviews([]);
    setError("");
  }, [initialData, currentItem, isAddImageMode, open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        itemName: "",
        unit: "",
        centralStock: undefined,
        vendorId: "" as Id<"vendors"> | "",
      });
      setSelectedImages([]);
      setImagePreviews([]);
      setError("");
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  const filteredVendors =
    (vendors && Array.isArray(vendors))
      ? vendors.filter((vendor) =>
          vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const selectedVendor = vendors?.find((v) => v._id === formData.vendorId);

  const handleCameraCapture = (file: File) => {
    const newImages = [...selectedImages, file];
    setSelectedImages(newImages);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImagePreviews((prev) => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length === 0) {
      toast.error("Please select image files only");
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (itemId: string) => {
    const uploadPromises = selectedImages.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("itemId", itemId);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(errorData.error || "Failed to upload image");
        }

        const data = await response.json();
        if (!data.imageUrl || !data.imageKey) {
          throw new Error("Invalid response from upload API");
        }

        return { imageUrl: data.imageUrl, imageKey: data.imageKey };
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate form data for create/edit modes - only item name is required
    if (!isAddImageMode && canEdit) {
      if (!formData.itemName.trim()) {
        setError("Item name is required");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isAddImageMode && itemId) {
        // Add images only
        if (selectedImages.length === 0) {
          setError("Please select at least one image");
          setIsLoading(false);
          return;
        }

        setIsUploading(true);
        try {
          const imageData = await uploadImages(itemId);

          // Add each image to the inventory item in Convex
          for (const img of imageData) {
            await addImage({
              itemId,
              imageUrl: img.imageUrl,
              imageKey: img.imageKey,
            });
          }

          toast.success(`${imageData.length} image(s) added successfully`);
          handleOpenChange(false);
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload images";
          setError(errorMessage);
          toast.error(errorMessage);
          setIsUploading(false);
        }
      } else if (itemId && canEdit) {
        // Update existing item
        await updateItem({
          itemId,
          itemName: formData.itemName,
          unit: formData.unit || undefined,
          centralStock: formData.centralStock || undefined,
          vendorId: (formData.vendorId && formData.vendorId !== "") ? formData.vendorId as Id<"vendors"> : undefined,
        });

        // Upload images if any (after item is updated)
        if (selectedImages.length > 0) {
          setIsUploading(true);
          try {
            const imageData = await uploadImages(itemId);
            // Add each image to the inventory item in Convex
            for (const img of imageData) {
              await addImage({
                itemId,
                imageUrl: img.imageUrl,
                imageKey: img.imageKey,
              });
            }
          } catch (uploadError) {
            console.error("Error uploading images:", uploadError);
            toast.warning("Item updated but some images failed to upload");
          }
        }

        toast.success("Inventory item updated successfully");
        handleOpenChange(false);
      } else if (canEdit) {
        // Create new item first
        const newItemId = await createItem({
          itemName: formData.itemName,
          unit: formData.unit || undefined,
          centralStock: formData.centralStock || undefined,
          vendorId: (formData.vendorId && formData.vendorId !== "") ? formData.vendorId as Id<"vendors"> : undefined,
        });

        // Upload images if any (after item is created)
        if (selectedImages.length > 0) {
          setIsUploading(true);
          try {
            const imageData = await uploadImages(newItemId);
            // Add each image to the inventory item in Convex
            for (const img of imageData) {
              await addImage({
                itemId: newItemId,
                imageUrl: img.imageUrl,
                imageKey: img.imageKey,
              });
            }
          } catch (uploadError) {
            console.error("Error uploading images:", uploadError);
            // Item is already created, but images failed - show warning
            toast.warning("Item created but some images failed to upload");
          }
        }

        toast.success("Inventory item created successfully");
        handleOpenChange(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAddImageMode
              ? "Add Images to Inventory Item"
              : itemId
              ? "Edit Inventory Item"
              : "Add New Inventory Item"}
          </DialogTitle>
          <DialogDescription>
            {isAddImageMode
              ? "Upload images for this inventory item"
              : itemId
              ? "Update inventory item information. Required fields are marked with *."
              : "Create a new inventory item. Required fields are marked with *."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {!isAddImageMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="Enter item name"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  required
                  disabled={isLoading || !canEdit}
                />
              </div>

              <div className="space-y-2">
                <UnitInput
                  id="unit"
                  value={formData.unit}
                  onChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                  disabled={isLoading || !canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="centralStock">
                  Central Stock <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="centralStock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.centralStock ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      centralStock: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  disabled={isLoading || !canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">
                  Vendor <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Popover open={vendorPopoverOpen} onOpenChange={setVendorPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={isLoading || !canEdit}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {selectedVendor
                        ? selectedVendor.companyName
                        : "Select vendor..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search vendors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredVendors.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No vendors found
                        </div>
                      ) : (
                        filteredVendors.map((vendor) => (
                          <button
                            key={vendor._id}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                vendorId: vendor._id,
                              });
                              setVendorPopoverOpen(false);
                              setSearchQuery("");
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors",
                              formData.vendorId === vendor._id && "bg-accent"
                            )}
                          >
                            {vendor.companyName}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {/* Image Upload Section */}
          {canAddImages && (
            <div className="space-y-2">
              <Label>Add Images to Inventory Item</Label>
              <p className="text-xs text-muted-foreground">
                Upload images for this inventory item
              </p>
              <div className="flex gap-2">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files)}
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCameraOpen(true)}
                  disabled={isLoading || isUploading}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => uploadInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start gap-2">
              <span className="text-destructive font-semibold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? (
                <>
                  <span className="mr-2">
                    {isUploading ? "Uploading..." : isAddImageMode ? "Adding..." : itemId ? "Updating..." : "Creating..."}
                  </span>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                </>
              ) : (
                isAddImageMode
                  ? "Add Images"
                  : itemId
                  ? "Update Item"
                  : "Create Item"
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Camera Dialog */}
        <CameraDialog
          open={cameraOpen}
          onOpenChange={setCameraOpen}
          onCapture={handleCameraCapture}
          multiple={true}
        />
      </DialogContent>
    </Dialog>
  );
}

