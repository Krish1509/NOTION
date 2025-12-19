"use client";

/**
 * User Table Component
 * 
 * Displays all users in a table with actions.
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
import { MoreHorizontal, Edit, UserX, UserCheck, Trash2 } from "lucide-react";
import { ROLE_LABELS, ROLES } from "@/lib/auth/roles";
import { Doc } from "@/convex/_generated/dataModel";
import { EditUserDialog } from "./edit-user-dialog";
import { toast } from "sonner";

interface UserTableProps {
  users: typeof import("@/convex/_generated/api").api.users.getAllUsers._returnType | undefined;
}

export function UserTable({ users }: UserTableProps) {
  const { user: clerkUser } = useUser();
  const disableUser = useMutation(api.users.disableUser);
  const enableUser = useMutation(api.users.enableUser);
  const deleteUser = useMutation(api.users.deleteUser);
  const allSites = useQuery(api.sites.getAllSites, {});

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Doc<"users"> | null>(null);
  const [deletingUser, setDeletingUser] = useState<Doc<"users"> | null>(null);

  if (!users) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users yet. Create your first user to get started.
      </div>
    );
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    setLoadingUserId(userId);
    try {
      // Cast to Id<"users"> type
      const userIdTyped = userId as unknown as Parameters<typeof disableUser>[0]['userId'];
      if (isActive) {
        await disableUser({ userId: userIdTyped });
        toast.success("User disabled successfully");
      } else {
        await enableUser({ userId: userIdTyped });
        toast.success("User enabled successfully");
      }
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    
    setLoadingUserId(deletingUser._id);
    try {
      // Delete from Convex first
      const userIdTyped = deletingUser._id as unknown as Parameters<typeof deleteUser>[0]['userId'];
      await deleteUser({ userId: userIdTyped, clerkUserId: deletingUser.clerkUserId });

      // Delete from Clerk
      try {
        await fetch("/api/admin/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkUserId: deletingUser.clerkUserId }),
        });
      } catch (clerkError) {
        // Continue anyway - Convex delete was successful
      }

      toast.success("User deleted successfully");
      setDeletingUser(null);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Sites</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            // Check if this is the current logged-in user
            const isCurrentUser = user.clerkUserId === clerkUser?.id;
            
            return (
            <TableRow key={user._id}>
              <TableCell className="font-medium">
                {user.fullName}
                {isCurrentUser && (
                  <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                )}
              </TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
              </TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>
                {user.role === ROLES.SITE_ENGINEER && user.assignedSites && user.assignedSites.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.assignedSites.map((siteId) => {
                      const site = allSites?.find((s) => s._id === siteId);
                      return site ? (
                        <Badge key={siteId} variant="secondary" className="text-xs">
                          {site.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                ) : user.role === ROLES.SITE_ENGINEER ? (
                  <span className="text-xs text-muted-foreground">No sites assigned</span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loadingUserId === user._id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      disabled={loadingUserId === user._id || isCurrentUser}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          {isCurrentUser ? "Cannot Disable Yourself" : "Disable User"}
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          {isCurrentUser ? "Cannot Enable Yourself" : "Enable User"}
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeletingUser(user)}
                      disabled={isCurrentUser}
                      className={isCurrentUser ? "opacity-50" : "text-destructive focus:text-destructive"}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isCurrentUser ? "Cannot Delete Yourself" : "Delete User"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editingUser !== null}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingUser !== null} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingUser?.fullName}</strong> (@{deletingUser?.username}) and remove all their data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

