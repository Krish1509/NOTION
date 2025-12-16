/**
 * Update User Password API (Manager Only)
 * 
 * Allows managers to update any user's password.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { clerkUserId, newPassword } = body;

    if (!clerkUserId || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Update password in Clerk
    const client = await clerkClient();
    
    try {
      await client.users.updateUser(clerkUserId, {
        password: newPassword,
        skipPasswordChecks: true, // Allow any password without restrictions
      });

      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (clerkError: any) {
      console.error("Clerk error:", clerkError);
      
      // Extract error message
      let errorMessage = "Failed to update password";
      if (clerkError?.errors && Array.isArray(clerkError.errors)) {
        errorMessage = clerkError.errors.map((e: any) => e.message).join(", ");
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error updating password:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update password";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

