"use client";

/**
 * Convex Test Component (Example)
 * 
 * This is an example component demonstrating Convex integration.
 * The messages table has been removed - this file is kept for reference.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ConvexTest() {
  // Example: Query users instead of messages
  const users = useQuery(api.users.getAllUsers);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          ✅ Convex is Connected!
        </h2>
        <p className="text-sm text-green-700 dark:text-green-300">
          Your Convex backend is working. This is an example component.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Users:</h3>
        {users === undefined ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <p className="text-black dark:text-white font-medium">{user.fullName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

