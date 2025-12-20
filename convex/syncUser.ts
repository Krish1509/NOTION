/**
 * Auto-sync user from Clerk to Convex
 * 
 * This mutation automatically creates a user in Convex if they don't exist
 * when they first login. It syncs data from Clerk.
 */

import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (existingUser) {
      return existingUser._id; // User already exists
    }

    // User doesn't exist, create them
    // Get user info from Clerk (we'll need to fetch this)
    // For now, create with default values that can be updated later
    const userId = await ctx.db.insert("users", {
      clerkUserId: clerkUserId,
      username: `user_${clerkUserId.slice(0, 8)}`, // Temporary username
      fullName: "User", // Will be updated
      phoneNumber: "",
      address: "",
      role: "site_engineer", // Default role, manager can change
      assignedSites: [],
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

