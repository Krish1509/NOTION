/**
 * Read Receipt Component
 * 
 * Shows read status with check marks (WhatsApp style):
 * - Single grey check (✓) = Sent (message just sent, not yet delivered)
 * - Double grey check (✓✓) = Delivered (message delivered to server, receiver hasn't seen it)
 * - Double blue check (✓✓) = Read (receiver has seen the message)
 */

import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadReceiptProps {
  isRead: boolean; // True if receiver has read the message
  isDelivered?: boolean; // True if message has been delivered (older than 1 second)
  className?: string;
}

export function ReadReceipt({ isRead, isDelivered = false, className }: ReadReceiptProps) {
  return (
    <span className={cn("inline-flex items-center shrink-0", className)}>
      {isRead ? (
        // Double blue check - Message read by receiver
        <span title="Read">
        <CheckCheck 
          className="h-4 w-4 text-blue-500 dark:text-blue-400" 
          aria-label="Read"
        />
        </span>
      ) : isDelivered ? (
        // Double grey check - Message delivered but not read
        <span title="Delivered">
        <CheckCheck 
          className="h-4 w-4 text-muted-foreground" 
          aria-label="Delivered"
        />
        </span>
      ) : (
        // Single grey check - Message sent (not yet delivered)
        <span title="Sent">
        <Check 
          className="h-4 w-4 text-muted-foreground" 
          aria-label="Sent"
        />
        </span>
      )}
    </span>
  );
}

