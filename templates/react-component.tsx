/**
 * React Component Template
 * 
 * Copy this file to app/components/ or components/ and customize
 * 
 * This example uses the users table from convex/schema.ts
 * Replace 'users' with your own table name
 */

"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function MyComponent() {
  const { user } = useUser();

  // Convex queries - using users as example
  const users = useQuery(api.users.getAllUsers);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Component</h2>
      
      {user && (
        <p>Welcome, {user.firstName}!</p>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Users:</h3>
        {users === undefined ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u._id} className="p-2 border rounded">
                {u.fullName} (@{u.username}) - {u.role}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

