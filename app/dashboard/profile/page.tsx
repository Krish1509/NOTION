/**
 * User Profile Page
 * 
 * Allows users to view and edit their profile information.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/profile-content";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and account settings
        </p>
      </div>

      <ProfileContent />
    </div>
  );
}

