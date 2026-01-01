"use client";

/**
 * Purchase Request Group Card - Shows all items within a request number
 *
 * Matches the manager page layout exactly for consistency.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, FileText, MapPin } from "lucide-react";
import { CompactImageGallery } from "@/components/ui/image-gallery";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface RequestItem {
  _id: Id<"requests">;
  requestNumber: string;
  itemName: string;
  quantity: number;
  unit: string;
  description?: string;
  specsBrand?: string;
  isUrgent: boolean;
  status: string;
  photo?: {
    imageUrl: string;
    imageKey: string;
  };
  photos?: Array<{
    imageUrl: string;
    imageKey: string;
  }>;
  itemOrder?: number;
  site?: {
    _id: Id<"sites">;
    name: string;
    code?: string;
    address?: string;
  } | null;
  creator?: {
    fullName: string;
  } | null;
}

interface PurchaseRequestGroupCardProps {
  requestNumber: string;
  items: RequestItem[];
  firstItem: RequestItem;
  statusInfo: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: any;
  };
  hasMultipleItems: boolean;
  urgentCount: number;
  onViewDetails: (requestId: Id<"requests">) => void;
  onOpenCC?: (requestId: Id<"requests">) => void;
  onSiteClick?: (siteId: Id<"sites">) => void;
  onItemClick?: (itemName: string) => void;
}

// Helper function to collect photos
const getItemPhotos = (item: RequestItem) => {
  const photos: Array<{ imageUrl: string; imageKey: string }> = [];
  if (item.photos && item.photos.length > 0) {
    item.photos.forEach((photo) => {
      photos.push({
        imageUrl: photo.imageUrl,
        imageKey: photo.imageKey,
      });
    });
  } else if (item.photo) {
    photos.push({
      imageUrl: item.photo.imageUrl,
      imageKey: item.photo.imageKey,
    });
  }
  return photos;
};

const handleOpenInMap = (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  window.open(mapUrl, '_blank');
};

// Get status badge helper
const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 text-xs">
          Draft
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800 text-xs">
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs">
          Approved
        </Badge>
      );
    case "ready_for_cc":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-xs">
          Ready for CC
        </Badge>
      );
    case "cc_pending":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 text-xs">
          CC Pending
        </Badge>
      );
    case "ready_for_po":
      return (
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 text-xs">
          Ready for PO
        </Badge>
      );
    case "delivery_stage":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800 text-xs">
          Delivery
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
};

export function PurchaseRequestGroupCard({
  requestNumber,
  items,
  firstItem,
  statusInfo,
  hasMultipleItems,
  urgentCount,
  onViewDetails,
  onOpenCC,
  onSiteClick,
  onItemClick
}: PurchaseRequestGroupCardProps) {
  const StatusIcon = statusInfo.icon;

  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-card shadow-sm grouped-card-hover touch-manipulation transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-nowrap overflow-x-auto">
            <span className="font-mono text-xs font-semibold text-primary flex-shrink-0">
              #{requestNumber}
            </span>
            <Badge variant={statusInfo.variant} className="text-xs flex-shrink-0">
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {urgentCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1 text-xs flex-shrink-0">
                <AlertCircle className="h-3 w-3" />
                {urgentCount}/{items.length} urgent{urgentCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {firstItem.site?.address && (
                <button
                  onClick={() => handleOpenInMap(firstItem.site?.address || '')}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full p-2 transition-colors shrink-0 border border-primary/20 hover:border-primary/40"
                  title="Open in Maps"
                >
                  <MapPin className="h-3.5 w-3.5" />
                </button>
              )}
              {firstItem.site ? (
                onSiteClick && firstItem.site._id ? (
                  <button
                    onClick={() => onSiteClick(firstItem.site!._id)}
                    className="font-semibold text-sm text-foreground hover:text-primary hover:bg-muted/50 rounded-full px-3 py-1.5 -mx-2 -my-1 transition-colors cursor-pointer text-left truncate flex-1 border border-transparent hover:border-primary/20"
                  >
                    {firstItem.site.name}
                    {firstItem.site.code && <span className="text-muted-foreground ml-1">({firstItem.site.code})</span>}
                  </button>
                ) : (
                  <span className="font-semibold text-sm truncate flex-1">
                    {firstItem.site.name}
                    {firstItem.site.code && <span className="text-muted-foreground ml-1">({firstItem.site.code})</span>}
                  </span>
                )
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
        {hasMultipleItems && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5 flex-shrink-0">
            {items.length} items
          </Badge>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-3 mb-3">
        {items.map((item, idx) => {
          const displayNumber = item.itemOrder ?? (items.length - idx);
          const itemPhotos = getItemPhotos(item);

          return (
            <div
              key={item._id}
              className={cn(
                "p-3 rounded-lg border shadow-sm",
                item.status === "approved" && "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
                item.status === "rejected" && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
                item.status === "cc_rejected" && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
                !["approved", "rejected", "cc_rejected"].includes(item.status) && "bg-card/50"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 min-w-[24px] flex items-center justify-center flex-shrink-0">
                      {displayNumber}
                    </Badge>
                    <div className="space-y-1 text-sm flex-1 min-w-0">
                      <div className="break-words">
                        <span className="font-medium text-muted-foreground">Item:</span>{" "}
                        {onItemClick ? (
                          <button
                            onClick={() => onItemClick(item.itemName)}
                            className="font-semibold text-sm text-foreground hover:text-primary hover:bg-muted/50 rounded-full px-3 py-1.5 -mx-2 -my-1 transition-colors cursor-pointer text-left border border-transparent hover:border-primary/20 whitespace-normal"
                          >
                            {item.itemName}
                          </button>
                        ) : (
                          <span className="font-semibold text-sm">{item.itemName}</span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground break-words whitespace-normal">
                          <span className="font-medium">Dis:</span> {item.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                        <span><span className="font-medium">Quantity:</span> {item.quantity} {item.unit}</span>
                        {item.specsBrand && (
                          <span className="text-primary">• {item.specsBrand}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <CompactImageGallery
                    images={itemPhotos}
                    maxDisplay={1}
                    size="md"
                  />
                </div>
              </div>
              {/* Status badges on new line */}
              <div className="flex items-center justify-between pt-2 border-t mt-2">
                <div className="flex items-center gap-2">
                  {item.isUrgent && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                  {(item.status === 'approved' || item.status === 'cc_approved') && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs flex-shrink-0">
                      ✓ Approved
                    </Badge>
                  )}
                  {(item.status === 'rejected' || item.status === 'cc_rejected') && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0">
                      ✗ Rejected
                    </Badge>
                  )}
                  {item.status !== 'approved' && item.status !== 'rejected' && item.status !== 'cc_approved' && item.status !== 'cc_rejected' && getStatusBadge(item.status)}
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "ready_for_cc" && onOpenCC && (
                    <Button
                      size="sm"
                      onClick={() => onOpenCC(item._id)}
                      className="text-xs h-7 px-2"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      CC
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(item._id)}
                    className="text-xs h-7 px-2"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
