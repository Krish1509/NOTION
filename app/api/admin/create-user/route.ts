/**
 * Admin API: Create User
 * 
 * Creates a user in Clerk with username/password authentication.
 * Only accessible by authenticated managers.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

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
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Create user in Clerk
    const client = await clerkClient();
    const user = await client.users.createUser({
      username,
      password,
      publicMetadata: {
        role,
      },
      skipPasswordChecks: true, // Allow any password without restrictions
    });

    return NextResponse.json({
      clerkUserId: user.id,
      success: true,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    // Extract detailed error message from Clerk
    let errorMessage = "Failed to create user";
    
    if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      // Clerk API errors format: { errors: [{ message: "..." }] }
      errorMessage = error.errors.map((e: any) => e.message || e.longMessage).join(", ");
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.clerkError) {
      errorMessage = JSON.stringify(error.clerkError);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

