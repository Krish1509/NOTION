import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getNotes = query({
    args: { requestNumber: v.string() },
    handler: async (ctx, args) => {
        const notes = await ctx.db
            .query("request_notes")
            .withIndex("by_request_number", (q) => q.eq("requestNumber", args.requestNumber))
            .collect();

        // Sort in memory to ensure correct order (descending by createdAt)
        notes.sort((a, b) => b.createdAt - a.createdAt);

        // Enrich with user details
        const enrichedNotes = await Promise.all(
            notes.map(async (note) => {
                const user = await ctx.db.get(note.userId);
                return {
                    ...note,
                    userName: user?.fullName || "Unknown User",
                    userRole: user?.role || note.role,
                };
            })
        );

        return enrichedNotes;
    },
});

export const addNote = mutation({
    args: {
        requestNumber: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
            .first();

        if (!user) throw new Error("User not found");

        const request = await ctx.db
            .query("requests")
            .withIndex("by_request_number", (q) => q.eq("requestNumber", args.requestNumber))
            .first();

        const noteId = await ctx.db.insert("request_notes", {
            requestNumber: args.requestNumber,
            userId: user._id,
            role: user.role,
            status: request?.status,
            content: args.content,
            createdAt: Date.now(),
        });

        return noteId;
    },
});
