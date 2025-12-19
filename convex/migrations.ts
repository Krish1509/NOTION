/**
 * Database Migrations
 * 
 * Helper functions for database migrations and cleanup.
 */

import { mutation } from "./_generated/server";

/**
 * Clear all old messages with invalid schema
 * Run this once to clean up old test data
 */
export const clearOldMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    
    let deletedCount = 0;
    
    for (const message of messages) {
      const messageAny = message as any;
      if ("text" in messageAny && !("content" in messageAny)) {
        await ctx.db.delete(message._id);
        deletedCount++;
      }
    }
    
    return { 
      success: true, 
      deletedCount,
      message: `Cleared ${deletedCount} old message(s)`
    };
  },
});

/**
 * Clear all conversations (use with caution!)
 */
export const clearAllConversations = mutation({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").collect();
    
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }
    
    return { 
      success: true, 
      deletedCount: conversations.length,
      message: `Cleared ${conversations.length} conversation(s)`
    };
  },
});

/**
 * Clear all presence records
 */
export const clearAllPresence = mutation({
  args: {},
  handler: async (ctx) => {
    const presenceRecords = await ctx.db.query("userPresence").collect();
    
    for (const record of presenceRecords) {
      await ctx.db.delete(record._id);
    }
    
    return { 
      success: true, 
      deletedCount: presenceRecords.length,
      message: `Cleared ${presenceRecords.length} presence record(s)`
    };
  },
});

