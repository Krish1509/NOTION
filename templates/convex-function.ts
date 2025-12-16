/**
 * Convex Function Template
 * 
 * Copy this file to convex/your-function.ts and customize
 * 
 * NOTE: This is a template file. When you copy it to convex/,
 * the imports will work correctly because _generated files exist there.
 */

// ============================================
// QUERY - Read data (no side effects)
// ============================================
// Example query function:
/*
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";

export const getItems = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("items").collect();
  },
});
*/

// ============================================
// MUTATION - Modify data (write operations)
// ============================================
// Example mutation function:
/*
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";

export const createItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: { name: string; description?: string }) => {
    const itemId = await ctx.db.insert("items", {
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
    });
    return itemId;
  },
});
*/

// ============================================
// ACTION - External API calls, complex logic
// ============================================
// Example action function:
/*
import { action } from "./_generated/server";
import { v } from "convex/values";
import type { ActionCtx } from "./_generated/server";

export const fetchExternalData = action({
  args: { url: v.string() },
  handler: async (ctx: ActionCtx, args: { url: string }) => {
    const response = await fetch(args.url);
    return await response.json();
  },
});
*/

