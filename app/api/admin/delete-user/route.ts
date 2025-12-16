/**
 * Delete User API (Manager Only)
 * 
 * Allows managers to delete users from Clerk.
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
    const { clerkUserId } = body;

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Delete user from Clerk
    const client = await clerkClient();
    
    try {
      await client.users.deleteUser(clerkUserId);

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (clerkError: any) {
      console.error("Clerk error:", clerkError);
      
      // Extract error message
      let errorMessage = "Failed to delete user";
      if (clerkError?.errors && Array.isArray(clerkError.errors)) {
        errorMessage = clerkError.errors.map((e: any) => e.message).join(", ");
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

