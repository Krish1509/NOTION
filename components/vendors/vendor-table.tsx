"use client";

/**
 * Vendor Table Component
 * 
 * Displays all vendors in a table with actions (Purchase Officer only for CRUD).
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { ROLES } from "@/lib/auth/roles";
import { VendorFormDialog } from "./vendor-form-dialog";
import { toast } from "sonner";
import type { Doc } from "@/convex/_generated/dataModel";

interface VendorTableProps {
  vendors: typeof import("@/convex/_generated/api").api.vendors.getAllVendors._returnType | undefined;
}

export function VendorTable({ vendors }: VendorTableProps) {
  const { user: clerkUser } = useUser();
  const userRole = useUserRole();
  const deleteVendor = useMutation(api.vendors.deleteVendor);

  const [loadingVendorId, setLoadingVendorId] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Doc<"vendors"> | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Doc<"vendors"> | null>(null);

  const canPerformCRUD = userRole === ROLES.PURCHASE_OFFICER;

  if (!vendors) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No vendors yet. Add your first vendor to get started.
      </div>
    );
  }

  const handleDelete = async () => {
    if (!deletingVendor) return;

    setLoadingVendorId(deletingVendor._id);
    try {
      await deleteVendor({ vendorId: deletingVendor._id });
      toast.success("Vendor deleted successfully");
      setDeletingVendor(null);
    } catch (error) {
      toast.error("Failed to delete vendor");
    } finally {
      setLoadingVendorId(null);
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>GST Number</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Created</TableHead>
            {canPerformCRUD && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor._id}>
              <TableCell className="font-medium">{vendor.companyName}</TableCell>
              <TableCell>{vendor.email}</TableCell>
              <TableCell>{vendor.phone || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline">{vendor.gstNumber}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{vendor.address}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(vendor.createdAt).toLocaleDateString()}
              </TableCell>
              {canPerformCRUD && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingVendorId === vendor._id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditingVendor(vendor)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Vendor
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingVendor(vendor)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Vendor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Vendor Dialog */}
      <VendorFormDialog
        open={editingVendor !== null}
        onOpenChange={(open) => !open && setEditingVendor(null)}
        vendorId={editingVendor?._id}
        initialData={editingVendor ? {
          companyName: editingVendor.companyName,
          email: editingVendor.email,
          phone: editingVendor.phone,
          gstNumber: editingVendor.gstNumber,
          address: editingVendor.address,
        } : null}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingVendor !== null}
        onOpenChange={(open) => !open && setDeletingVendor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingVendor?.companyName}</strong> and
              remove all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Vendor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

