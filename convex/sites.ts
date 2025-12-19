/**
 * Sites Management Functions
 * 
 * Handles CRUD operations for sites.
 * Only managers can create, edit, and manage sites.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all active sites
 */
export const getAllSites = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .unique();

    if (!currentUser) return [];

    // Get all sites
    let sites = await ctx.db
      .query("sites")
      .order("desc")
      .collect();

    // Filter by active status if needed
    if (!args.includeInactive) {
      sites = sites.filter((site) => site.isActive);
    }

    return sites;
  },
});

/**
 * Get site by ID
 */
export const getSiteById = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const site = await ctx.db.get(args.siteId);
    return site;
  },
});

/**
 * Search sites by name
 */
export const searchSites = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const searchQuery = args.query.toLowerCase().trim();
    if (!searchQuery) return [];

    const allSites = await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return allSites.filter((site) =>
      site.name.toLowerCase().includes(searchQuery) ||
      site.code?.toLowerCase().includes(searchQuery) ||
      site.address?.toLowerCase().includes(searchQuery)
    );
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new site (Manager only)
 */
export const createSite = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    address: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Check if user is a manager
    if (currentUser.role !== "manager") {
      throw new Error("Unauthorized: Only managers can create sites");
    }

    const now = Date.now();

    // Create site
    const siteId = await ctx.db.insert("sites", {
      name: args.name,
      code: args.code,
      address: args.address,
      description: args.description,
      isActive: true,
      createdBy: currentUser._id,
      createdAt: now,
      updatedAt: now,
    });

    return siteId;
  },
});

/**
 * Update a site (Manager only)
 */
export const updateSite = mutation({
  args: {
    siteId: v.id("sites"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    address: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Check if user is a manager
    if (currentUser.role !== "manager") {
      throw new Error("Unauthorized: Only managers can update sites");
    }

    // Get site
    const site = await ctx.db.get(args.siteId);
    if (!site) throw new Error("Site not found");

    // Update site
    await ctx.db.patch(args.siteId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.code !== undefined && { code: args.code }),
      ...(args.address !== undefined && { address: args.address }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a site (Manager only) - Soft delete
 */
export const deleteSite = mutation({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Check if user is a manager
    if (currentUser.role !== "manager") {
      throw new Error("Unauthorized: Only managers can delete sites");
    }

    // Soft delete
    await ctx.db.patch(args.siteId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

