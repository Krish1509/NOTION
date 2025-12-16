import { query } from "./_generated/server";

// Debug query to see what Clerk is sending
export const debugAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return { error: "Not authenticated", identity: null };
    }

    // Look for user in database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", identity.subject))
      .unique();

    return {
      clerkUserId: identity.subject,
      issuer: identity.issuer,
      userFoundInDB: user !== null,
      userRecord: user,
      allUsersCount: await ctx.db.query("users").collect().then(u => u.length),
    };
  },
});


