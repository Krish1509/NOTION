"use client";

/**
 * Inventory Table Component
 * 
 * Displays all inventory items in a table with images and actions.
 * Purchase Officer: Full CRUD
 * Manager and Site Engineer: Read-only, but Site Engineer can add images
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, Image as ImageIcon, Plus } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { ROLES } from "@/lib/auth/roles";
import { InventoryFormDialog } from "./inventory-form-dialog";
import { toast } from "sonner";
import type { Doc, Id } from "@/convex/_generated/dataModel";

interface InventoryTableProps {
  items: typeof import("@/convex/_generated/api").api.inventory.getAllInventoryItems._returnType | undefined;
}

export function InventoryTable({ items }: InventoryTableProps) {
  const userRole = useUserRole();
  const deleteItem = useMutation(api.inventory.deleteInventoryItem);
  const removeImage = useMutation(api.inventory.removeImageFromInventory);

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Doc<"inventory"> | null>(null);
  const [deletingItem, setDeletingItem] = useState<Doc<"inventory"> | null>(null);
  const [addingImageItem, setAddingImageItem] = useState<Doc<"inventory"> | null>(null);
  const [removingImageKey, setRemovingImageKey] = useState<string | null>(null);

  const canPerformCRUD = userRole === ROLES.PURCHASE_OFFICER;
  const canAddImages = userRole === ROLES.PURCHASE_OFFICER || userRole === ROLES.SITE_ENGINEER;

  if (!items) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No inventory items yet. Add your first item to get started.
      </div>
    );
  }

  const handleDelete = async () => {
    if (!deletingItem) return;

    setLoadingItemId(deletingItem._id);
    try {
      // Delete all images from R2 first
      if (deletingItem.images && deletingItem.images.length > 0) {
        for (const img of deletingItem.images) {
          try {
            await fetch(`/api/delete/image?key=${encodeURIComponent(img.imageKey)}`, {
              method: "DELETE",
            });
          } catch (error) {
            console.error("Failed to delete image:", error);
          }
        }
      }

      await deleteItem({ itemId: deletingItem._id });
      toast.success("Inventory item deleted successfully");
      setDeletingItem(null);
    } catch (error) {
      toast.error("Failed to delete inventory item");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemoveImage = async (itemId: string, imageKey: string) => {
    setRemovingImageKey(imageKey);
    try {
      // Delete from R2
      await fetch(`/api/delete/image?key=${encodeURIComponent(imageKey)}`, {
        method: "DELETE",
      });

      // Remove from database
      await removeImage({ itemId: itemId as any, imageKey });
      toast.success("Image removed successfully");
    } catch (error) {
      toast.error("Failed to remove image");
    } finally {
      setRemovingImageKey(null);
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Central Stock</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Created</TableHead>
            {(canPerformCRUD || canAddImages) && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.itemName}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.unit}</Badge>
              </TableCell>
              <TableCell>{item.centralStock}</TableCell>
              <TableCell>{item.vendor?.companyName || "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {item.images && item.images.length > 0 ? (
                    <>
                      {item.images.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img.imageUrl}
                            alt={`${item.itemName} ${idx + 1}`}
                            className="w-10 h-10 object-cover rounded border"
                          />
                          {canPerformCRUD && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(item._id, img.imageKey)}
                              disabled={removingImageKey === img.imageKey}
                              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              <span>×</span>
                            </button>
                          )}
                        </div>
                      ))}
                      {item.images.length > 3 && (
                        <div className="w-10 h-10 rounded border flex items-center justify-center text-xs bg-muted">
                          +{item.images.length - 3}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No images</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
              {(canPerformCRUD || canAddImages) && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingItemId === item._id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {canPerformCRUD && (
                        <>
                          <DropdownMenuItem onClick={() => setEditingItem(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {canAddImages && (
                        <DropdownMenuItem onClick={() => setAddingImageItem(item)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Images
                        </DropdownMenuItem>
                      )}
                      {canPerformCRUD && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingItem(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Item Dialog */}
      {canPerformCRUD && (
        <InventoryFormDialog
          open={editingItem !== null}
          onOpenChange={(open) => !open && setEditingItem(null)}
          itemId={editingItem?._id}
          initialData={editingItem
            ? {
                itemName: editingItem.itemName,
                unit: editingItem.unit ?? "",
                centralStock: editingItem.centralStock ?? 0,
                vendorId: editingItem.vendorId ?? ("" as Id<"vendors">),
              }
            : null}
          mode="edit"
        />
      )}

      {/* Add Images Dialog */}
      {canAddImages && (
        <InventoryFormDialog
          open={addingImageItem !== null}
          onOpenChange={(open) => !open && setAddingImageItem(null)}
          itemId={addingImageItem?._id || undefined}
          mode="add-image"
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canPerformCRUD && (
        <AlertDialog
          open={deletingItem !== null}
          onOpenChange={(open) => !open && setDeletingItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{deletingItem?.itemName}</strong> and
                remove all associated data and images. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

