/**
 * Site Selector Component
 * 
 * Multi-select dropdown for selecting sites with search functionality.
 */

"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CreateSiteDialog } from "./create-site-dialog";
import type { Id } from "@/convex/_generated/dataModel";

interface SiteSelectorProps {
  selectedSites: Id<"sites">[];
  onSelectionChange: (siteIds: Id<"sites">[]) => void;
  disabled?: boolean;
}

export function SiteSelector({
  selectedSites,
  onSelectionChange,
  disabled = false,
}: SiteSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const allSites = useQuery(api.sites.getAllSites, {});
  const createSite = useMutation(api.sites.createSite);

  // Filter sites based on search
  const filteredSites = allSites?.filter((site) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      site.name.toLowerCase().includes(query) ||
      site.code?.toLowerCase().includes(query) ||
      site.address?.toLowerCase().includes(query)
    );
  }) || [];

  // Get selected site details
  const selectedSiteDetails = allSites?.filter((site) =>
    selectedSites.includes(site._id)
  ) || [];

  const handleToggleSite = (siteId: Id<"sites">) => {
    if (selectedSites.includes(siteId)) {
      onSelectionChange(selectedSites.filter((id) => id !== siteId));
    } else {
      onSelectionChange([...selectedSites, siteId]);
    }
  };

  const handleRemoveSite = (siteId: Id<"sites">) => {
    onSelectionChange(selectedSites.filter((id) => id !== siteId));
  };

  const handleCreateSite = async (data: {
    name: string;
    code?: string;
    address?: string;
    description?: string;
  }) => {
    try {
      const newSiteId = await createSite(data);
      onSelectionChange([...selectedSites, newSiteId]);
      setShowCreateDialog(false);
      setSearchQuery("");
      toast.success("Site created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create site");
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Assigned Sites</label>
          <span className="text-xs text-muted-foreground">
            {selectedSites.length} selected
          </span>
        </div>

        {/* Selected Sites Badges */}
        {selectedSiteDetails.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30 min-h-[40px]">
            {selectedSiteDetails.map((site) => (
              <Badge
                key={site._id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {site.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSite(site._id)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Site Selector Popover */}
        {!disabled && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Search className="mr-2 h-4 w-4" />
                {selectedSites.length === 0
                  ? "Select sites..."
                  : `${selectedSites.length} site(s) selected`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="p-2 border-b">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add New Site
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {filteredSites.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No sites found" : "No sites available"}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredSites.map((site) => {
                      const isSelected = selectedSites.includes(site._id);
                      return (
                        <button
                          key={site._id}
                          type="button"
                          onClick={() => handleToggleSite(site._id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors",
                            "hover:bg-accent",
                            isSelected && "bg-accent"
                          )}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-input"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{site.name}</div>
                            {site.code && (
                              <div className="text-xs text-muted-foreground">
                                Code: {site.code}
                              </div>
                            )}
                            {site.address && (
                              <div className="text-xs text-muted-foreground truncate">
                                {site.address}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Create Site Dialog */}
      <CreateSiteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateSite}
      />
    </>
  );
}

