"use client";

/**
 * Direct PO Dialog Component
 * 
 * Creates a Purchase Order instantly, bypassing the Manager approval workflow.
 * Use for emergency procurements.
 */

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, Plus, Search, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { AddressAutocomplete } from "@/components/vendors/address-autocomplete";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";
import { cn } from "@/lib/utils";

interface DirectPODialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Common units for construction materials
const COMMON_UNITS = [
    "pcs",
    "bags",
    "kg",
    "ton",
    "mm",
    "gm",
    "nos",
    "ltr",
    "sqft",
    "cft",
    "box",
    "bundle",
    "roll",
];

// Common tax rates
const TAX_RATES = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "12", label: "12%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
];

export function DirectPODialog({ open, onOpenChange }: DirectPODialogProps) {
    const createDirectPO = useMutation(api.purchaseOrders.createDirectPO);
    const inventoryItems = useQuery(api.inventory.getAllInventoryItems);
    const vendors = useQuery(api.vendors.getAllVendors);
    const sites = useQuery(api.sites.getAllSites, {});

    const [isLoading, setIsLoading] = useState(false);
    const [showVendorDialog, setShowVendorDialog] = useState(false);
    const [vendorSearchQuery, setVendorSearchQuery] = useState("");
    const [itemSearchQuery, setItemSearchQuery] = useState("");
    const [showItemSuggestions, setShowItemSuggestions] = useState(false);
    const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        itemDescription: "",
        hsnCode: "",
        quantity: 0,
        unit: "pcs",
        deliverySite: "",
        vendorId: "" as Id<"vendors"> | "",
        vendorName: "",
        vendorEmail: "",
        gstNumber: "",
        vendorAddress: "",
        unitPrice: 0,
        taxRate: "18",
        validTill: "",
        notes: "",
    });

    // Filter inventory items based on search
    const filteredInventoryItems = useMemo(() => {
        if (!inventoryItems || !itemSearchQuery.trim()) return [];
        const query = itemSearchQuery.toLowerCase();
        return inventoryItems
            .filter((item) => item.itemName.toLowerCase().includes(query))
            .slice(0, 5);
    }, [inventoryItems, itemSearchQuery]);

    // Filter vendors based on search
    const filteredVendors = useMemo(() => {
        if (!vendors || !vendorSearchQuery.trim()) return [];
        const query = vendorSearchQuery.toLowerCase();
        return vendors
            .filter((vendor) =>
                vendor.companyName.toLowerCase().includes(query)
            )
            .slice(0, 5);
    }, [vendors, vendorSearchQuery]);

    // Auto-fill vendor details when vendor is selected
    useEffect(() => {
        if (formData.vendorId && vendors) {
            const selectedVendor = vendors.find((v) => v._id === formData.vendorId);
            if (selectedVendor) {
                setFormData((prev) => ({
                    ...prev,
                    vendorName: selectedVendor.companyName,
                    vendorEmail: selectedVendor.email || "",
                    gstNumber: selectedVendor.gstNumber || "",
                    vendorAddress: selectedVendor.address || "",
                }));
                setVendorSearchQuery(selectedVendor.companyName);
            }
        }
    }, [formData.vendorId, vendors]);

    // Calculate total amount
    const calculateTotal = () => {
        const subtotal = formData.quantity * formData.unitPrice;
        const taxAmount = (subtotal * parseFloat(formData.taxRate)) / 100;
        return subtotal + taxAmount;
    };

    const handleReset = () => {
        setFormData({
            itemDescription: "",
            hsnCode: "",
            quantity: 0,
            unit: "pcs",
            deliverySite: "",
            vendorId: "",
            vendorName: "",
            vendorEmail: "",
            gstNumber: "",
            vendorAddress: "",
            unitPrice: 0,
            taxRate: "18",
            validTill: "",
            notes: "",
        });
        setVendorSearchQuery("");
        setItemSearchQuery("");
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            handleReset();
        }
        onOpenChange(newOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validation
            if (!formData.itemDescription.trim()) {
                throw new Error("Item description is required");
            }
            if (formData.quantity <= 0) {
                throw new Error("Quantity must be greater than 0");
            }
            if (!formData.deliverySite) {
                throw new Error("Delivery site is required");
            }
            if (!formData.vendorId) {
                throw new Error("Vendor is required");
            }
            if (formData.unitPrice <= 0) {
                throw new Error("Unit price must be greater than 0");
            }
            if (!formData.validTill) {
                throw new Error("PO expiry date is required");
            }

            await createDirectPO({
                itemDescription: formData.itemDescription,
                hsnSacCode: formData.hsnCode || undefined,
                quantity: formData.quantity,
                unit: formData.unit,
                deliverySiteId: formData.deliverySite as Id<"sites">,
                vendorId: formData.vendorId,
                unitRate: formData.unitPrice,
                gstTaxRate: parseFloat(formData.taxRate),
                validTill: new Date(formData.validTill).getTime(),
                notes: formData.notes || undefined,
            });

            toast.success("Direct PO created successfully!", {
                description: `PO for ${formData.itemDescription} has been generated.`,
            });

            handleOpenChange(false);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create Direct PO";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemSelect = (itemName: string, unit?: string) => {
        setFormData((prev) => ({
            ...prev,
            itemDescription: itemName,
            unit: unit || prev.unit,
        }));
        setItemSearchQuery(itemName);
        setShowItemSuggestions(false);
    };

    const handleVendorSelect = (vendorId: Id<"vendors">) => {
        setFormData((prev) => ({ ...prev, vendorId }));
        setShowVendorSuggestions(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            Create Direct PO
                        </DialogTitle>
                        <DialogDescription>
                            This creates a PO instantly, bypassing the Manager approval workflow.
                            Use for emergency procurements.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 py-2">
                        {/* Order Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                                Order Details
                            </h3>

                            {/* Item Description with Autocomplete */}
                            <div className="space-y-1.5 relative">
                                <Label htmlFor="itemDescription" className="text-sm">
                                    Item Description *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="itemDescription"
                                        placeholder="e.g. Cement Bags (Ultratech)"
                                        value={itemSearchQuery}
                                        onChange={(e) => {
                                            setItemSearchQuery(e.target.value);
                                            setFormData((prev) => ({
                                                ...prev,
                                                itemDescription: e.target.value,
                                            }));
                                            setShowItemSuggestions(true);
                                        }}
                                        onFocus={() => setShowItemSuggestions(true)}
                                        required
                                        disabled={isLoading}
                                        className="h-9"
                                    />
                                    {itemSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setItemSearchQuery("");
                                                setFormData((prev) => ({ ...prev, itemDescription: "" }));
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Item Suggestions Dropdown */}
                                {showItemSuggestions &&
                                    filteredInventoryItems.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {filteredInventoryItems.map((item) => (
                                                <button
                                                    key={item._id}
                                                    type="button"
                                                    onClick={() => handleItemSelect(item.itemName, item.unit)}
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between"
                                                >
                                                    <span className="font-medium">{item.itemName}</span>
                                                    {item.unit && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.unit}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* HSN Code */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="hsnCode" className="text-sm">
                                        HSN Code{" "}
                                        <span className="text-muted-foreground text-xs">(optional)</span>
                                    </Label>
                                    <Input
                                        id="hsnCode"
                                        placeholder="e.g. 2523"
                                        value={formData.hsnCode}
                                        onChange={(e) =>
                                            setFormData({ ...formData, hsnCode: e.target.value })
                                        }
                                        disabled={isLoading}
                                        className="h-9"
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="quantity" className="text-sm">
                                        Quantity *
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        value={formData.quantity || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantity: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        required
                                        disabled={isLoading}
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Unit with Suggestions */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="unit" className="text-sm">
                                        Unit *
                                    </Label>
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, unit: value })
                                        }
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COMMON_UNITS.map((unit) => (
                                                <SelectItem key={unit} value={unit}>
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Delivery Site with Geoapify */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="deliverySite" className="text-sm">
                                        Delivery Site *
                                    </Label>
                                    <Select
                                        value={formData.deliverySite}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, deliverySite: value })
                                        }
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sites?.map((site) => (
                                                <SelectItem key={site._id} value={site._id}>
                                                    {site.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Vendor & Pricing Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                                Vendor & Pricing
                            </h3>

                            {/* Vendor Search with Autocomplete */}
                            <div className="space-y-1.5 relative">
                                <Label htmlFor="vendorName" className="text-sm">
                                    Vendor Name (Type to Search) *
                                </Label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="vendorName"
                                            placeholder="Start typing vendor name..."
                                            value={vendorSearchQuery}
                                            onChange={(e) => {
                                                setVendorSearchQuery(e.target.value);
                                                setShowVendorSuggestions(true);
                                                // Clear vendor selection if user types
                                                if (formData.vendorId) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        vendorId: "",
                                                        vendorEmail: "",
                                                        gstNumber: "",
                                                        vendorAddress: "",
                                                    }));
                                                }
                                            }}
                                            onFocus={() => setShowVendorSuggestions(true)}
                                            disabled={isLoading}
                                            className="h-9 pl-9"
                                        />

                                        {/* Vendor Suggestions Dropdown */}
                                        {showVendorSuggestions && filteredVendors.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {filteredVendors.map((vendor) => (
                                                    <button
                                                        key={vendor._id}
                                                        type="button"
                                                        onClick={() => handleVendorSelect(vendor._id)}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                                                    >
                                                        <div className="font-medium">{vendor.companyName}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {vendor.email}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowVendorDialog(true)}
                                        disabled={isLoading}
                                        className="h-9 px-3"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Auto-filled Vendor Details */}
                            {formData.vendorId && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="vendorEmail" className="text-sm">
                                            Vendor Email
                                        </Label>
                                        <Input
                                            id="vendorEmail"
                                            type="email"
                                            value={formData.vendorEmail}
                                            onChange={(e) =>
                                                setFormData({ ...formData, vendorEmail: e.target.value })
                                            }
                                            disabled={isLoading}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="gstNumber" className="text-sm">
                                            GST Number
                                        </Label>
                                        <Input
                                            id="gstNumber"
                                            value={formData.gstNumber}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    gstNumber: e.target.value.toUpperCase(),
                                                })
                                            }
                                            disabled={isLoading}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.vendorId && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="vendorAddress" className="text-sm">
                                        Vendor Address
                                    </Label>
                                    <AddressAutocomplete
                                        value={formData.vendorAddress}
                                        onChange={(address) =>
                                            setFormData({ ...formData, vendorAddress: address })
                                        }
                                        disabled={isLoading}
                                        placeholder="Search address or type manually..."
                                        id="vendorAddress"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {/* Unit Price */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="unitPrice" className="text-sm">
                                        Unit Price (₹) *
                                    </Label>
                                    <Input
                                        id="unitPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        value={formData.unitPrice || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                unitPrice: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        required
                                        disabled={isLoading}
                                        className="h-9"
                                    />
                                </div>

                                {/* Tax Rate */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="taxRate" className="text-sm">
                                        Tax Rate (%) *
                                    </Label>
                                    <Select
                                        value={formData.taxRate}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, taxRate: value })
                                        }
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TAX_RATES.map((rate) => (
                                                <SelectItem key={rate.value} value={rate.value}>
                                                    {rate.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Valid Till */}
                            <div className="space-y-1.5">
                                <Label htmlFor="validTill" className="text-sm">
                                    Valid Till (PO Expiry) *
                                </Label>
                                <Input
                                    id="validTill"
                                    type="date"
                                    value={formData.validTill}
                                    onChange={(e) =>
                                        setFormData({ ...formData, validTill: e.target.value })
                                    }
                                    required
                                    disabled={isLoading}
                                    className="h-9"
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            {/* Total Amount Display */}
                            {formData.quantity > 0 && formData.unitPrice > 0 && (
                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-medium">
                                            ₹{(formData.quantity * formData.unitPrice).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Tax ({formData.taxRate}%):
                                        </span>
                                        <span className="font-medium">
                                            ₹
                                            {(
                                                (formData.quantity *
                                                    formData.unitPrice *
                                                    parseFloat(formData.taxRate)) /
                                                100
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold border-t pt-2">
                                        <span>Total Amount:</span>
                                        <span className="text-primary">₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-sm">
                                Notes{" "}
                                <span className="text-muted-foreground text-xs">(optional)</span>
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Internal notes..."
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                disabled={isLoading}
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="mr-2">Generating...</span>
                                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    </>
                                ) : (
                                    "Generate Direct PO"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Vendor Creation Dialog */}
            <VendorFormDialog
                open={showVendorDialog}
                onOpenChange={setShowVendorDialog}
            />
        </>
    );
}
