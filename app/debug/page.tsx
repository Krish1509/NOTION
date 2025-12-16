"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export default function DebugPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const debugInfo = useQuery(api.debug.debugAuth);

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Auth Info</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Clerk Status:</h2>
            <pre className="bg-muted p-4 rounded overflow-auto">
              {JSON.stringify({ isLoaded, isSignedIn, clerkUserId: userId }, null, 2)}
            </pre>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Convex Auth Info:</h2>
            <pre className="bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {debugInfo && !debugInfo.userFoundInDB && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <h3 className="text-lg font-semibold text-destructive mb-2">❌ User Not Found in Convex!</h3>
              <p className="mb-4">The Clerk User ID <code className="bg-muted px-2 py-1 rounded">{debugInfo.clerkUserId}</code> doesn't exist in Convex database.</p>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">To fix this:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to Convex Dashboard → Data → users table</li>
                  <li>Click "Add Document"</li>
                  <li>Paste this JSON:</li>
                </ol>
                <pre className="bg-muted p-4 rounded overflow-auto mt-2 text-xs">
{JSON.stringify({
  clerkUserId: debugInfo.clerkUserId,
  username: "manager",
  fullName: "System Manager",
  phoneNumber: "+1234567890",
  address: "Admin Office",
  role: "manager",
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {debugInfo && debugInfo.userFoundInDB && (
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <h3 className="text-lg font-semibold text-green-600 mb-2">✅ User Found in Convex!</h3>
              <p>Authentication is working correctly. You should be able to access the user management page.</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <a 
            href="/dashboard/manager/users" 
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Go to User Management →
          </a>
        </div>
      </div>
    </div>
  );
}


