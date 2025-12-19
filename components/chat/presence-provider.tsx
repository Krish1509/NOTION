/**
 * Presence Provider Component
 * 
 * Automatically updates user's online status via heartbeat.
 * Should be included in the dashboard layout.
 */

"use client";

import { usePresenceHeartbeat } from "@/hooks/use-presence";
import { useEffect, useState } from "react";

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enable presence heartbeat only on client side
  usePresenceHeartbeat(isClient);

  return <>{children}</>;
}

