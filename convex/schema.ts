import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema
 * 
 * Defines all tables for the NOTION CRM system.
 */

export default defineSchema({
  // ============================================================================
  // Users Table
  // ============================================================================
  users: defineTable({
    clerkUserId: v.string(), // Clerk user ID (unique)
    username: v.string(), // Username for login (unique)
    fullName: v.string(),
    phoneNumber: v.string(),
    address: v.string(),
    role: v.union(
      v.literal("site_engineer"),
      v.literal("manager"),
      v.literal("purchase_officer")
    ),
    isActive: v.boolean(),
    createdBy: v.optional(v.id("users")), // Manager who created this user (null for first manager)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"])
    .index("by_is_active", ["isActive"]),

  // ============================================================================
  // Requests Table
  // ============================================================================
  requests: defineTable({
    requestNumber: v.string(), // Auto-generated unique identifier
    createdBy: v.id("users"), // Site Engineer
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unit: v.string(),
        description: v.optional(v.string()),
      })
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("delivered")
    ),
    approvedBy: v.optional(v.id("users")), // Manager
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    deliveryMarkedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_request_number", ["requestNumber"])
    .index("by_created_by", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // ============================================================================
  // Purchase Orders Table
  // ============================================================================
  purchaseOrders: defineTable({
    poNumber: v.string(), // Auto-generated unique identifier
    requestId: v.id("requests"), // Linked request
    vendorId: v.id("vendors"),
    createdBy: v.id("users"), // Purchase Officer
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unit: v.string(),
        unitPrice: v.number(),
        totalPrice: v.number(),
      })
    ),
    totalAmount: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("received"),
      v.literal("completed")
    ),
    expectedDeliveryDate: v.number(),
    actualDeliveryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_po_number", ["poNumber"])
    .index("by_request_id", ["requestId"])
    .index("by_vendor_id", ["vendorId"])
    .index("by_created_by", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // ============================================================================
  // Vendors Table
  // ============================================================================
  vendors: defineTable({
    name: v.string(),
    contactPerson: v.string(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),
    address: v.string(),
    isActive: v.boolean(),
    createdBy: v.id("users"), // Purchase Officer
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_is_active", ["isActive"])
    .index("by_created_at", ["createdAt"]),
});

