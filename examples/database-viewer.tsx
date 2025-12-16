"use client";

/**
 * Database Viewer Component (Example)
 * 
 * This is an example component for viewing database contents.
 * Updated to use users table instead of messages.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DatabaseViewer() {
  const users = useQuery(api.users.getAllUsers);
  
  // Calculate stats from users
  const stats = users ? {
    totalDocuments: users.length,
    tables: {
      users: {
        count: users.length,
      },
    },
  } : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
          📊 Database Viewer
        </h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          View all data stored in your Convex database tables (collections)
        </p>
      </div>

      {/* Database Stats */}
      {stats && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-3">Database Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalDocuments}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tables</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(stats.tables).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-lg">
            Table: <code className="text-blue-600 dark:text-blue-400">users</code>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {users === undefined
              ? "Loading..."
              : `${users.length} document${users.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {users === undefined ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading database...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">No users in database yet.</p>
            <p className="text-sm">Create users through the User Management page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {user.role}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw JSON View */}
      {users && users.length > 0 && (
        <details className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            View Raw JSON Data
          </summary>
          <pre className="p-4 overflow-x-auto text-xs bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <code className="text-gray-800 dark:text-gray-200">
              {JSON.stringify(users, null, 2)}
            </code>
          </pre>
        </details>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          💡 Where is data stored?
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
          <li>
            <strong>Local Development:</strong> Data is stored locally when running{" "}
            <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
              npx convex dev
            </code>
          </li>
          <li>
            <strong>Convex Dashboard:</strong> View all data at{" "}
            <a
              href="https://dashboard.convex.dev/d/local-krish1506soni-notion_f26f9"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              dashboard.convex.dev
            </a>
          </li>
          <li>
            <strong>Tables (Collections):</strong> Defined in{" "}
            <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
              convex/schema.ts
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
}

