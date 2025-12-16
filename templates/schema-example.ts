/**
 * Convex Schema Template
 * 
 * Add tables to convex/schema.ts following this pattern
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example: Messages table
  messages: defineTable({
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  })
    .index("by_author", ["author"])
    .index("by_created", ["createdAt"]),

  // Example: Users table (if not using Clerk user management)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Example: Posts with relationships
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),

  // Example: Comments (nested relationships)
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"]),
});

/**
 * Field Types Available:
 * - v.string()
 * - v.number()
 * - v.boolean()
 * - v.id("tableName")
 * - v.array(v.string())
 * - v.object({ field: v.string() })
 * - v.optional(v.string())
 * - v.union(v.literal("value1"), v.literal("value2"))
 * 
 * Indexes:
 * - .index("index_name", ["fieldName"])
 * - .index("compound_index", ["field1", "field2"])
 */

