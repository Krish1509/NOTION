"use client";

/**
 * Cost Comparison Dialog Component
 * 
 * Dialog for creating/editing cost comparisons with multiple vendor quotes.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { X, Plus, Save, Send, AlertCircle, Package, CheckCircle, Building } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { ROLES } from "@/lib/auth/roles";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { VendorCreationForm } from "./vendor-creation-form";
import type { Id } from "@/convex/_generated/dataModel";

interface CostComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: Id<"requests">;
}

interface VendorQuote {
  vendorId: Id<"vendors">;
  unitPrice: number;
}

export function CostComparisonDialog({
  open,
  onOpenChange,
  requestId,
}: CostComparisonDialogProps) {
  const [vendorQuotes, setVendorQuotes] = useState<VendorQuote[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<Id<"vendors"> | "">("");
  const [unitPrice, setUnitPrice] = useState("");
  const [isDirectDelivery, setIsDirectDelivery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  
  // Manager review state
  const [selectedFinalVendor, setSelectedFinalVendor] = useState<Id<"vendors"> | "">("");
  const [managerNotes, setManagerNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  
  const userRole = useUserRole();
  const isManager = userRole === ROLES.MANAGER;
  const reviewCC = useMutation(api.costComparisons.reviewCostComparison);

  const request = useQuery(
    api.requests.getRequestById,
    requestId ? { requestId } : "skip"
  );
  const vendors = useQuery(api.vendors.getAllVendors);
  const inventoryItems = useQuery(api.inventory.getAllInventoryItems);

  // Check if item exists in inventory
  const itemInInventory = inventoryItems?.find(
    (item) => item.itemName.toLowerCase() === request?.itemName.toLowerCase()
  );

  // Get smart vendor suggestions based on item in inventory
  const suggestedVendors = vendors?.filter(vendor =>
    itemInInventory?.vendorIds?.includes(vendor._id) || false
  ) || [];

  const otherVendors = vendors?.filter(vendor =>
    !itemInInventory?.vendorIds?.includes(vendor._id) &&
    !vendorQuotes.some(quote => quote.vendorId === vendor._id)
  ) || [];
  const existingCC = useQuery(
    api.costComparisons.getCostComparisonByRequestId,
    requestId ? { requestId } : "skip"
  );
  const upsertCC = useMutation(api.costComparisons.upsertCostComparison);
  const submitCC = useMutation(api.costComparisons.submitCostComparison);
  const resubmitCC = useMutation(api.costComparisons.resubmitCostComparison);

  // Load existing cost comparison
  useEffect(() => {
    if (existingCC && open) {
      setVendorQuotes(
        existingCC.vendorQuotes.map((q) => ({
          vendorId: q.vendorId,
          unitPrice: q.unitPrice,
        }))
      );
      setIsDirectDelivery(existingCC.isDirectDelivery);
      // Reset manager notes when opening
      if (isManager) {
        setManagerNotes("");
      }
    } else if (open && !existingCC) {
      // Reset when opening new
      setVendorQuotes([]);
      setIsDirectDelivery(false);
      if (isManager) {
        setManagerNotes("");
      }
    }
  }, [existingCC, open, isManager]);

  // Get vendor name by ID
  const getVendorName = (vendorId: Id<"vendors">) => {
    return vendors?.find((v) => v._id === vendorId)?.companyName || "Unknown";
  };

  // Add vendor quote
  const handleAddVendor = () => {
    if (!selectedVendorId || !unitPrice) {
      toast.error("Please select a vendor and enter unit price");
      return;
    }

    const price = parseFloat(unitPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid unit price");
      return;
    }

    if (vendorQuotes.some((q) => q.vendorId === selectedVendorId)) {
      toast.error("This vendor is already added");
      return;
    }

    setVendorQuotes([
      ...vendorQuotes,
      {
        vendorId: selectedVendorId as Id<"vendors">,
        unitPrice: price,
      },
    ]);

    setSelectedVendorId("");
    setUnitPrice("");
    setVendorDialogOpen(false);
  };

  // Remove vendor quote
  const handleRemoveVendor = (vendorId: Id<"vendors">) => {
    setVendorQuotes(vendorQuotes.filter((q) => q.vendorId !== vendorId));
  };

  // Save cost comparison
  const handleSave = async () => {
    if (vendorQuotes.length === 0) {
      toast.error("Please add at least one vendor quote");
      return;
    }

    setIsSaving(true);
    try {
      await upsertCC({
        requestId,
        vendorQuotes,
        isDirectDelivery,
      });
      toast.success("Cost comparison saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit for approval
  const handleSubmit = async () => {
    if (vendorQuotes.length === 0) {
      toast.error("Please add at least one vendor quote");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingCC?.status === "cc_rejected") {
        await resubmitCC({
          requestId,
          vendorQuotes,
          isDirectDelivery,
        });
        toast.success("Cost comparison resubmitted");
      } else {
        await handleSave();
        await submitCC({ requestId });
        toast.success("Cost comparison submitted");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total
  const calculateTotal = (unitPrice: number) => {
    if (!request) return 0;
    return unitPrice * request.quantity;
  };

  const canEdit = existingCC?.status === "draft" || existingCC?.status === "cc_rejected" || !existingCC;
  const isSubmitted = existingCC?.status === "cc_pending";
  const isManagerReview = isManager && isSubmitted;
  
  // Load selected vendor if CC is approved (for manager view)
  useEffect(() => {
    if (existingCC?.selectedVendorId && open && isManager) {
      setSelectedFinalVendor(existingCC.selectedVendorId);
    } else if (open && isManager && !existingCC?.selectedVendorId) {
      setSelectedFinalVendor("");
    }
  }, [existingCC, open, isManager]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg">Cost Comparison - {request?.requestNumber}</DialogTitle>
          <DialogDescription className="text-xs">
            {request?.itemName} • {request?.quantity} {request?.unit}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Item Information Card */}
          {request && (
            <div className="p-3 bg-muted/30 border rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Item Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Item:</span>
                  <p className="font-medium">{request.itemName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <p className="font-medium">
                    {request.quantity} {request.unit || itemInInventory?.unit || 'units'}
                  </p>
                </div>
                {request.description && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="text-sm mt-1">{request.description}</p>
                  </div>
                )}
                {itemInInventory && (
                  <div className="col-span-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                      <Package className="h-3.5 w-3.5" />
                      <span>Item in inventory • Central stock: {itemInInventory.centralStock || 0} {itemInInventory.unit || 'units'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inventory Alert - Now more informative */}
          {itemInInventory && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Item Available in Inventory
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <div>Central Stock: {itemInInventory.centralStock || 0} {itemInInventory.unit || 'units'}</div>
                  {itemInInventory.vendorIds && itemInInventory.vendorIds.length > 0 && (
                    <div>Associated Vendors: {itemInInventory.vendorIds.length}</div>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <input
                      type="checkbox"
                      id="directDelivery"
                      checked={isDirectDelivery}
                      onChange={(e) => setIsDirectDelivery(e.target.checked)}
                      disabled={!canEdit || isSubmitted}
                      className="h-3 w-3 rounded border-gray-300"
                    />
                    <label htmlFor="directDelivery" className="cursor-pointer text-xs">
                      Use Direct Delivery (skip vendor quotes)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Notes */}
          {existingCC?.status === "cc_rejected" && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-destructive">Rejected: </span>
                  <span className="text-muted-foreground">{existingCC.managerNotes || "No reason provided."}</span>
                </div>
              </div>
            </div>
          )}

          {/* Direct Delivery Option */}
          {itemInInventory && (
            <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
              <Checkbox
                id="directDelivery"
                checked={isDirectDelivery}
                onCheckedChange={(checked) => setIsDirectDelivery(checked === true)}
                disabled={!canEdit || isSubmitted}
                className="h-3 w-3"
              />
              <Label htmlFor="directDelivery" className="text-xs cursor-pointer text-muted-foreground">
                Direct Delivery (Item in inventory)
              </Label>
            </div>
          )}

          {/* Vendor Quotes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                {isManagerReview ? "Select Final Vendor" : "Vendor Quotes"}
              </Label>
              {canEdit && !isManagerReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVendorDialogOpen(true)}
                  className="text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Vendor Quote
                </Button>
              )}
            </div>
            {vendorQuotes.length > 0 ? (
              isManagerReview ? (
                // Manager view: Radio buttons to select final vendor
                <RadioGroup
                  value={selectedFinalVendor}
                  onValueChange={(value) => setSelectedFinalVendor(value as Id<"vendors">)}
                  className="space-y-2"
                >
                  {vendorQuotes.map((quote) => (
                    <div
                      key={quote.vendorId}
                      className={`p-3 border rounded-lg ${
                        selectedFinalVendor === quote.vendorId
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={quote.vendorId}
                          id={`vendor-${quote.vendorId}`}
                          className="mt-1"
                        />
                        <label
                          htmlFor={`vendor-${quote.vendorId}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div>
                            <p className="font-medium text-sm">{getVendorName(quote.vendorId)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{quote.unitPrice.toFixed(2)}/unit • ₹{calculateTotal(quote.unitPrice).toFixed(2)} total
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                // Purchase Officer view: List with remove buttons
                <div className="border rounded-lg divide-y">
                  {vendorQuotes.map((quote) => (
                    <div key={quote.vendorId} className="p-2 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{getVendorName(quote.vendorId)}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{quote.unitPrice.toFixed(2)}/unit • ₹{calculateTotal(quote.unitPrice).toFixed(2)} total
                        </p>
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVendor(quote.vendorId)}
                          className="h-7 w-7 p-0 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">
                No vendors added
              </p>
            )}

            {/* Enhanced Vendor Selection Dialog with Tabs */}
            <Dialog open={vendorDialogOpen && canEdit} onOpenChange={(open) => {
              if (canEdit) {
                setVendorDialogOpen(open);
                // Reset form when closing
                if (!open) {
                  setSelectedVendorId("");
                  setUnitPrice("");
                }
              }
            }}>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Add Vendor Quote</DialogTitle>
                  <DialogDescription>
                    Select an existing vendor or create a new one for this item quote.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="existing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Select Vendor
                    </TabsTrigger>
                    <TabsTrigger value="create" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Vendor
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-4 mt-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {/* Smart Vendor Suggestions */}
                      {suggestedVendors.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <Label className="text-sm font-medium text-green-700 dark:text-green-400">
                              Suggested Vendors (supplied this item before)
                            </Label>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {suggestedVendors.map((vendor) => (
                              <button
                                key={vendor._id}
                                onClick={() => setSelectedVendorId(vendor._id)}
                                className={`p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors ${
                                  selectedVendorId === vendor._id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''
                                }`}
                              >
                                <div className="font-medium text-sm">{vendor.companyName}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                  <span>{vendor.email}</span>
                                  {vendor.phone && <span>• {vendor.phone}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Vendors */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          {suggestedVendors.length > 0 ? 'Other Available Vendors' : 'Available Vendors'}
                        </Label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                          {otherVendors.map((vendor) => (
                            <button
                              key={vendor._id}
                              onClick={() => setSelectedVendorId(vendor._id)}
                              className={`p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors ${
                                selectedVendorId === vendor._id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''
                              }`}
                            >
                              <div className="font-medium text-sm">{vendor.companyName}</div>
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <span>{vendor.email}</span>
                                {vendor.phone && <span>• {vendor.phone}</span>}
                              </div>
                            </button>
                          ))}
                          {otherVendors.length === 0 && suggestedVendors.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <div className="text-sm">No vendors available</div>
                              <div className="text-xs mt-1">Create a new vendor to add quotes</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price Input for selected vendor */}
                    {selectedVendorId && (
                      <div className="space-y-3 border-t pt-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Unit Price (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            placeholder="0.00"
                            className="text-sm"
                          />
                          {request && unitPrice && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>Total: ₹{(parseFloat(unitPrice) * request.quantity).toFixed(2)}</span>
                              <span>•</span>
                              <span>Unit: {request.unit || itemInInventory?.unit || 'units'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="create" className="mt-4">
                    <VendorCreationForm
                      onVendorCreated={(vendorId) => {
                        setSelectedVendorId(vendorId);
                        toast.success("Vendor created! Now add the price.");
                        // Switch back to existing tab
                        const tabTrigger = document.querySelector('[value="existing"]') as HTMLElement;
                        if (tabTrigger) tabTrigger.click();
                      }}
                      onCancel={() => {
                        // Switch back to existing tab
                        const tabTrigger = document.querySelector('[value="existing"]') as HTMLElement;
                        if (tabTrigger) tabTrigger.click();
                      }}
                      itemName={request?.itemName}
                    />
                  </TabsContent>
                </Tabs>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddVendor}
                    disabled={!selectedVendorId || !unitPrice}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quote
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Manager Review Actions */}
          {isManagerReview && (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label className="text-xs font-medium">Manager Notes / Rejection Reason</Label>
                <Textarea
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="Add instructions or reason for rejection..."
                  className="mt-1 text-sm min-h-[80px]"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsReviewing(true);
                    try {
                      await reviewCC({
                        requestId,
                        action: "reject",
                        notes: managerNotes.trim() || undefined,
                      });
                      toast.success("Cost comparison rejected");
                      onOpenChange(false);
                    } catch (error: any) {
                      toast.error(error.message || "Failed to reject");
                    } finally {
                      setIsReviewing(false);
                    }
                  }}
                  disabled={isReviewing}
                  size="sm"
                  className="flex-1"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Reject CC
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedFinalVendor) {
                      toast.error("Please select a final vendor");
                      return;
                    }
                    setIsReviewing(true);
                    try {
                      await reviewCC({
                        requestId,
                        action: "approve",
                        selectedVendorId: selectedFinalVendor as Id<"vendors">,
                        notes: managerNotes.trim() || undefined,
                      });
                      toast.success("Cost comparison approved");
                      onOpenChange(false);
                    } catch (error: any) {
                      toast.error(error.message || "Failed to approve");
                    } finally {
                      setIsReviewing(false);
                    }
                  }}
                  disabled={isReviewing || !selectedFinalVendor}
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Approve & Select Vendor
                </Button>
              </div>
            </div>
          )}

          {/* Purchase Officer Actions */}
          {canEdit && !isSubmitted && !isManager && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setVendorDialogOpen(true)}
                className="flex-1"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Vendor
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || isSubmitting}
                size="sm"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving || isSubmitting || vendorQuotes.length === 0}
                size="sm"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {existingCC?.status === "cc_rejected" ? "Resubmit" : "Submit"}
              </Button>
            </div>
          )}

          {isSubmitted && !isManagerReview && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Submitted for manager approval
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

