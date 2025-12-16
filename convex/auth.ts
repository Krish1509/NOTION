/**
 * Convex Auth Configuration
 * 
 * This file configures Convex to use Clerk for authentication.
 * 
 * IMPORTANT: You need to configure Clerk JWT in Convex Dashboard:
 * 1. Go to Convex Dashboard → Settings → Auth
 * 2. Set Auth Provider to "Clerk"
 * 3. Add your Clerk JWT issuer URL
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// This is a placeholder - actual auth configuration is done in Convex Dashboard
// For local development, Convex will use the token passed from the client

const http = httpRouter();

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;

