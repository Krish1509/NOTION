"use client";

/**
 * Personal Info Form Component
 * 
 * Form for editing user's personal information.
 */

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, X, Edit } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

interface PersonalInfoFormProps {
  convexUser: Doc<"users"> | null | undefined;
  clerkUserId: string;
}

export function PersonalInfoForm({ convexUser, clerkUserId }: PersonalInfoFormProps) {
  const updateProfile = useMutation(api.users.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });

  // Initialize form data when convexUser is loaded
  useEffect(() => {
    if (convexUser) {
      setFormData({
        fullName: convexUser.fullName || "",
        phoneNumber: convexUser.phoneNumber || "",
        address: convexUser.address || "",
      });
    }
  }, [convexUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        clerkUserId,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (convexUser) {
      setFormData({
        fullName: convexUser.fullName || "",
        phoneNumber: convexUser.phoneNumber || "",
        address: convexUser.address || "",
      });
    }
    setIsEditing(false);
  };

  if (!convexUser) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading profile information...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={convexUser.username}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Username cannot be changed for security reasons
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          disabled={!isEditing || isLoading}
          required
          placeholder="John Doe"
          className={!isEditing ? "bg-muted cursor-not-allowed" : "bg-background border-2 border-primary focus:border-primary"}
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">
          Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          disabled={!isEditing || isLoading}
          placeholder="+1234567890"
          className={!isEditing ? "bg-muted cursor-not-allowed" : "bg-background border-2 border-primary focus:border-primary"}
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">
          Address <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          disabled={!isEditing || isLoading}
          placeholder="123 Main St, City, State"
          className={!isEditing ? "bg-muted cursor-not-allowed" : "bg-background border-2 border-primary focus:border-primary"}
        />
      </div>

      {/* Role (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={convexUser.role.toUpperCase().replace("_", " ")}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Contact your administrator to change your role
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        {!isEditing ? (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            size="lg"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3 w-full">
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="gap-2 flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              size="lg"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}

