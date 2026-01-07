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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Save, Send, AlertCircle, Package, CheckCircle, Building, Info, ExternalLink, Mail, Phone, Hash, MapPin } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { ROLES } from "@/lib/auth/roles";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { VendorCreationForm } from "./vendor-creation-form";
import { LazyImage } from "@/components/ui/lazy-image";
import { ImageSlider } from "@/components/ui/image-slider";
import type { Id } from "@/convex/_generated/dataModel";
import { Edit, Check, X } from "lucide-react";

interface CostComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: Id<"requests">; // Main request ID (used when opening single item)
  requestIds?: Id<"requests">[]; // Multiple request IDs for batch CC viewing
}

interface VendorQuote {
  vendorId: Id<"vendors">;
  unitPrice: number;
  amount?: number;
  unit?: string;
  discountPercent?: number;  // Optional discount percentage
  gstPercent?: number;       // Optional GST percentage
}

// Common unit suggestions for autocomplete
const UNIT_SUGGESTIONS = [
  "kg", "kgs", "kilogram", "kilograms",
  "g", "gm", "gram", "grams",
  "lb", "lbs", "pound", "pounds",
  "ton", "tons", "tonne", "tonnes",
  "m", "meter", "meters", "metre", "metres",
  "cm", "centimeter", "centimeters",
  "mm", "millimeter", "millimeters",
  "ft", "feet", "foot",
  "inch", "inches", "in",
  "l", "liter", "liters", "litre", "litres",
  "ml", "milliliter", "milliliters",
  "gal", "gallon", "gallons",
  "pcs", "pieces", "piece", "pc",
  "box", "boxes",
  "pack", "packs", "packet", "packets",
  "dozen", "dozens",
  "set", "sets",
  "roll", "rolls",
  "sheet", "sheets",
  "bag", "bags",
  "bottle", "bottles",
  "can", "cans",
  "tube", "tubes",
  "unit", "units",
  "each"
];

export function CostComparisonDialog({
  open,
  onOpenChange,
  requestId,
  requestIds,
}: CostComparisonDialogProps) {
  // Multi-item CC navigation state
  const [currentCCIndex, setCurrentCCIndex] = useState(0);

  // Determine the list of request IDs to work with
  const ccRequestIds = requestIds && requestIds.length > 0 ? requestIds : [requestId];
  const hasMultipleCCs = ccRequestIds.length > 1;

  // Active request ID based on current index
  const activeRequestId = ccRequestIds[currentCCIndex] || requestId;

  const [vendorQuotes, setVendorQuotes] = useState<VendorQuote[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<Id<"vendors"> | "">("");
  const [unitPrice, setUnitPrice] = useState("");
  const [isDirectDelivery, setIsDirectDelivery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [inventoryInfoOpen, setInventoryInfoOpen] = useState(false);
  const [imageSliderOpen, setImageSliderOpen] = useState(false);
  const [imageSliderImages, setImageSliderImages] = useState<Array<{ imageUrl: string; imageKey: string }>>([]);
  const [imageSliderItemName, setImageSliderItemName] = useState("");
  const [imageSliderInitialIndex, setImageSliderInitialIndex] = useState(0);
  const [isCreatingDirectPO, setIsCreatingDirectPO] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("1");
  const [quoteUnit, setQuoteUnit] = useState("");
  const [quoteDiscount, setQuoteDiscount] = useState("");  // Discount percentage
  const [quoteGst, setQuoteGst] = useState("");            // GST percentage
  const [showVendorDetails, setShowVendorDetails] = useState<string | null>(null);
  const [showDirectDeliveryConfirm, setShowDirectDeliveryConfirm] = useState(false);
  const [showCreateVendorDialog, setShowCreateVendorDialog] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [selectedVendorIndex, setSelectedVendorIndex] = useState(-1);
  const [editingQuoteIndex, setEditingQuoteIndex] = useState(-1); // -1 = adding new, >= 0 = editing existing

  // Inventory-based fulfillment state (skip vendor comparison)
  const [useInventoryStock, setUseInventoryStock] = useState(false);

  // Split fulfillment state - for partial inventory fulfillment
  const [quantityFromInventory, setQuantityFromInventory] = useState(0);
  const [quantityFromVendor, setQuantityFromVendor] = useState(0); // Minimum needed from vendor
  const [quantityToBuy, setQuantityToBuy] = useState(0); // Actual quantity to buy (can be >= quantityFromVendor)

  // Unit suggestions state
  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(-1);

  // Item details edit state
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);


  // Item name autocomplete state
  const [showItemNameSuggestions, setShowItemNameSuggestions] = useState(false);
  const [selectedItemNameIndex, setSelectedItemNameIndex] = useState(-1);

  // Manager review state
  const [selectedFinalVendor, setSelectedFinalVendor] = useState<Id<"vendors"> | "">("");
  const [managerNotes, setManagerNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const userRole = useUserRole();
  const isManager = userRole === ROLES.MANAGER;
  const reviewCC = useMutation(api.costComparisons.reviewCostComparison);

  const request = useQuery(
    api.requests.getRequestById,
    activeRequestId ? { requestId: activeRequestId } : "skip"
  );
  const vendors = useQuery(api.vendors.getAllVendors);
  const inventoryItems = useQuery(api.inventory.getAllInventoryItems);

  // Check if item exists in inventory
  const itemInInventory = inventoryItems?.find(
    (item) => item.itemName.toLowerCase() === request?.itemName.toLowerCase()
  );

  // Check if inventory has sufficient stock
  const hasSufficientInventory = itemInInventory && (itemInInventory.centralStock || 0) >= (request?.quantity || 0);

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
    activeRequestId ? { requestId: activeRequestId } : "skip"
  );
  const upsertCC = useMutation(api.costComparisons.upsertCostComparison);
  const submitCC = useMutation(api.costComparisons.submitCostComparison);
  const resubmitCC = useMutation(api.costComparisons.resubmitCostComparison);
  const updateRequestDetails = useMutation(api.requests.updateRequestDetails);
  const updatePurchaseRequestStatus = useMutation(api.requests.updatePurchaseRequestStatus);
  const deductInventoryStock = useMutation(api.inventory.deductInventoryStockByName);

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
      // If there are vendor quotes, user chose external purchase
      setUseInventoryStock(existingCC.vendorQuotes.length === 0);
      // Reset manager notes when opening
      if (isManager) {
        setManagerNotes("");
      }
    } else if (open && !existingCC) {
      // Reset when opening new
      setVendorQuotes([]);
      setIsDirectDelivery(false);
      // Default to inventory stock if sufficient
      setUseInventoryStock(false);
      if (isManager) {
        setManagerNotes("");
      }
    }
  }, [existingCC, open, isManager]);

  // Initialize edit fields when request loads
  useEffect(() => {
    if (request && open) {
      setEditQuantity(request.quantity.toString());
      setEditUnit(request.unit || "");
      setEditDescription(request.description || "");
      setEditItemName(request.itemName);
    }
  }, [request, open]);

  // Initialize split fulfillment quantities when request and inventory loads
  useEffect(() => {
    if (request && itemInInventory && open) {
      const availableStock = itemInInventory.centralStock || 0;
      const requiredQuantity = request.quantity || 0;

      if (availableStock >= requiredQuantity) {
        // Full inventory fulfillment possible
        setQuantityFromInventory(requiredQuantity);
        setQuantityFromVendor(0);
        setQuantityToBuy(0);
      } else if (availableStock > 0) {
        // Partial inventory fulfillment
        const neededFromVendor = requiredQuantity - availableStock;
        setQuantityFromInventory(availableStock);
        setQuantityFromVendor(neededFromVendor);
        setQuantityToBuy(neededFromVendor); // Default to minimum needed
      } else {
        // No inventory, all from vendors
        setQuantityFromInventory(0);
        setQuantityFromVendor(requiredQuantity);
        setQuantityToBuy(requiredQuantity);
      }
    } else if (request && !itemInInventory && open) {
      // New item, all from vendors
      setQuantityFromInventory(0);
      setQuantityFromVendor(request.quantity || 0);
      setQuantityToBuy(request.quantity || 0);
    }
  }, [request, itemInInventory, open]);

  // Get vendor name by ID
  const getVendorName = (vendorId: Id<"vendors">) => {
    return vendors?.find((v) => v._id === vendorId)?.companyName || "Unknown";
  };

  // Add or update vendor quote
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

    // Check for duplicate vendor (only when adding new, not editing)
    if (editingQuoteIndex === -1 && vendorQuotes.some((q) => q.vendorId === selectedVendorId)) {
      toast.error("This vendor is already added");
      return;
    }

    const amount = parseFloat(quoteAmount) || 1;
    const unit = quoteUnit.trim() || request?.unit || itemInInventory?.unit || "units";
    const discount = parseFloat(quoteDiscount) || 0;
    const gst = parseFloat(quoteGst) || 0;

    const newQuote: VendorQuote = {
      vendorId: selectedVendorId as Id<"vendors">,
      unitPrice: price,
      amount: amount,
      unit: unit,
      discountPercent: discount > 0 ? discount : undefined,
      gstPercent: gst > 0 ? gst : undefined,
    };

    let newQuotes: VendorQuote[];
    if (editingQuoteIndex >= 0) {
      // Update existing quote
      newQuotes = [...vendorQuotes];
      newQuotes[editingQuoteIndex] = newQuote;
      setVendorQuotes(newQuotes);
      toast.success("Quote updated");
    } else {
      // Add new quote
      newQuotes = [...vendorQuotes, newQuote];
      setVendorQuotes(newQuotes);
      toast.success("Quote added");
    }

    // Save immediately
    handleSave(true, newQuotes);

    // Reset form
    setSelectedVendorId("");
    setUnitPrice("");
    setQuoteAmount("1");
    setQuoteUnit("");
    setQuoteDiscount("");
    setQuoteGst("");
    setEditingQuoteIndex(-1);
    setVendorSearchTerm("");
    setVendorDialogOpen(false);
  };

  // Edit vendor quote - populate form with existing data
  const handleEditQuote = (index: number) => {
    const quote = vendorQuotes[index];
    if (!quote) return;

    setEditingQuoteIndex(index);
    setSelectedVendorId(quote.vendorId);
    setVendorSearchTerm(getVendorName(quote.vendorId));
    setUnitPrice(quote.unitPrice.toString());
    setQuoteAmount((quote.amount || 1).toString());
    setQuoteUnit(quote.unit || "");
    setQuoteDiscount(quote.discountPercent?.toString() || "");
    setQuoteGst(quote.gstPercent?.toString() || "");
    setVendorDialogOpen(true);
  };

  // Remove vendor quote
  const handleRemoveVendor = (vendorId: Id<"vendors">) => {
    const newQuotes = vendorQuotes.filter((q) => q.vendorId !== vendorId);
    setVendorQuotes(newQuotes);
    toast.success("Quote removed");
    // Save immediately if there are still quotes
    if (newQuotes.length > 0) {
      handleSave(true, newQuotes);
    }
  };

  // Save cost comparison (silent mode for auto-save, accepts quotes parameter for immediate save)
  const handleSave = async (silent: boolean = false, quotesToSave?: VendorQuote[]) => {
    const quotes = quotesToSave || vendorQuotes;
    if (quotes.length === 0) {
      if (!silent) toast.error("Please add at least one vendor quote");
      return;
    }

    setIsSaving(true);
    try {
      await upsertCC({
        requestId: activeRequestId,
        vendorQuotes: quotes,
        isDirectDelivery,
      });
      if (!silent) toast.success("Cost comparison saved");
    } catch (error: any) {
      if (!silent) toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save state - moved isInitialLoad state here
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Reset initial load flag when dialog closes
  useEffect(() => {
    if (!open) {
      setIsInitialLoad(true);
    }
  }, [open]);

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
          requestId: activeRequestId,
          vendorQuotes,
          isDirectDelivery,
        });
        toast.success("Cost comparison resubmitted");
      } else {
        await handleSave();
        await submitCC({ requestId: activeRequestId });
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

  // Calculate price after discount
  const calculatePriceAfterDiscount = (unitPrice: number, discountPercent?: number) => {
    if (!discountPercent || discountPercent <= 0) return unitPrice;
    return unitPrice * (1 - discountPercent / 100);
  };

  // Calculate GST amount
  const calculateGstAmount = (priceAfterDiscount: number, gstPercent?: number) => {
    if (!gstPercent || gstPercent <= 0) return 0;
    return priceAfterDiscount * (gstPercent / 100);
  };

  // Calculate final price with discount and GST
  const calculateFinalPrice = (unitPrice: number, discountPercent?: number, gstPercent?: number) => {
    const priceAfterDiscount = calculatePriceAfterDiscount(unitPrice, discountPercent);
    const gstAmount = calculateGstAmount(priceAfterDiscount, gstPercent);
    return priceAfterDiscount + gstAmount;
  };

  // Calculate total with discount and GST for a quote
  const calculateQuoteTotal = (quote: VendorQuote, quantity: number) => {
    const finalUnitPrice = calculateFinalPrice(quote.unitPrice, quote.discountPercent, quote.gstPercent);
    return finalUnitPrice * quantity;
  };

  // Item edit handlers
  const handleStartEditItem = () => {
    setIsEditingItem(true);
    setEditQuantity(request?.quantity.toString() || "");
    setEditUnit(request?.unit || "");
    setEditDescription(request?.description || "");
  };

  const handleCancelEditItem = () => {
    setIsEditingItem(false);
    setEditQuantity(request?.quantity.toString() || "");
    setEditUnit(request?.unit || "");
    setEditDescription(request?.description || "");
    setEditItemName(request?.itemName || "");
  };

  const handleSaveItemDetails = async () => {
    if (!request) return;

    const quantity = parseFloat(editQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!editItemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    setIsUpdatingItem(true);
    try {
      await updateRequestDetails({
        requestId: activeRequestId,
        quantity,
        unit: editUnit.trim() || undefined,
        description: editDescription.trim() || undefined,
        itemName: editItemName.trim(),
      });
      toast.success("Item details updated successfully");
      setIsEditingItem(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update item details");
    } finally {
      setIsUpdatingItem(false);
    }
  };

  // Unit autocomplete handlers
  const getFilteredUnitSuggestions = (input: string) => {
    if (!input.trim()) return UNIT_SUGGESTIONS.slice(0, 8); // Show first 8 when empty
    return UNIT_SUGGESTIONS.filter(unit =>
      unit.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions
  };

  const handleUnitInputChange = (value: string) => {
    setEditUnit(value);
    setShowUnitSuggestions(true);
    setSelectedUnitIndex(-1); // Reset selection when typing
  };

  const handleUnitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const suggestions = getFilteredUnitSuggestions(editUnit);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedUnitIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedUnitIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedUnitIndex >= 0) {
      e.preventDefault();
      setEditUnit(suggestions[selectedUnitIndex]);
      setShowUnitSuggestions(false);
      setSelectedUnitIndex(-1);
    } else if (e.key === 'Escape') {
      setShowUnitSuggestions(false);
      setSelectedUnitIndex(-1);
    }
  };

  const handleUnitSuggestionClick = (suggestion: string) => {
    setEditUnit(suggestion);
    setShowUnitSuggestions(false);
    setSelectedUnitIndex(-1);
  };

  const handleUnitFocus = () => {
    setShowUnitSuggestions(true);
  };

  const handleUnitBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setShowUnitSuggestions(false), 150);
  };

  // Item name autocomplete handlers
  const getFilteredItemNameSuggestions = (input: string) => {
    if (!inventoryItems) return [];
    if (!input.trim()) return inventoryItems.slice(0, 8); // Show first 8 when empty
    return inventoryItems.filter(item =>
      item.itemName.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions
  };

  const handleItemNameInputChange = (value: string) => {
    setEditItemName(value);
    setShowItemNameSuggestions(true);
    setSelectedItemNameIndex(-1); // Reset selection when typing
  };

  const handleItemNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const suggestions = getFilteredItemNameSuggestions(editItemName);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedItemNameIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedItemNameIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedItemNameIndex >= 0) {
      e.preventDefault();
      setEditItemName(suggestions[selectedItemNameIndex].itemName);
      setShowItemNameSuggestions(false);
      setSelectedItemNameIndex(-1);
    } else if (e.key === 'Escape') {
      setShowItemNameSuggestions(false);
      setSelectedItemNameIndex(-1);
    }
  };

  const handleItemNameSuggestionClick = (suggestion: string) => {
    setEditItemName(suggestion);
    setShowItemNameSuggestions(false);
    setSelectedItemNameIndex(-1);
  };

  const handleItemNameFocus = () => {
    setShowItemNameSuggestions(true);
  };

  const handleItemNameBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setShowItemNameSuggestions(false), 150);
  };

  const canEdit = existingCC?.status === "draft" || existingCC?.status === "cc_rejected" || !existingCC;
  const isSubmitted = existingCC?.status === "cc_pending";
  const isManagerReview = isManager && isSubmitted;

  // Filter vendors based on search term
  const filteredVendors = vendors?.filter(vendor =>
    vendor.companyName.toLowerCase().includes(vendorSearchTerm.toLowerCase())
  ) || [];

  // Filter units based on input for quote
  const getFilteredUnitSuggestionsForQuote = (input: string) => {
    if (!input.trim()) return UNIT_SUGGESTIONS.slice(0, 8); // Show first 8 when empty
    return UNIT_SUGGESTIONS.filter(unit =>
      unit.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions
  };

  // Unit suggestion handlers for quote
  const handleQuoteUnitInputChange = (value: string) => {
    setQuoteUnit(value);
    setShowUnitSuggestions(true);
    setSelectedUnitIndex(-1); // Reset selection when typing
  };

  const handleQuoteUnitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const suggestions = getFilteredUnitSuggestionsForQuote(quoteUnit);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedUnitIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedUnitIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedUnitIndex >= 0) {
      e.preventDefault();
      setQuoteUnit(suggestions[selectedUnitIndex]);
      setShowUnitSuggestions(false);
      setSelectedUnitIndex(-1);
    } else if (e.key === 'Escape') {
      setShowUnitSuggestions(false);
      setSelectedUnitIndex(-1);
    }
  };

  const handleQuoteUnitSuggestionClick = (suggestion: string) => {
    setQuoteUnit(suggestion);
    setShowUnitSuggestions(false);
    setSelectedUnitIndex(-1);
    // Auto-focus back to the input or next field for better UX
  };

  const handleQuoteUnitFocus = () => {
    setShowUnitSuggestions(true);
  };

  const handleQuoteUnitBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setShowUnitSuggestions(false), 150);
  };

  const handleDirectDelivery = async () => {
    if (!request) return;

    // Determine quantity to take from inventory
    const deliveryQuantity = hasSufficientInventory
      ? (request.quantity || 0)  // Full fulfillment from inventory
      : quantityFromInventory;   // Partial fulfillment

    if (deliveryQuantity <= 0) {
      toast.error("Please specify a quantity to deliver from inventory");
      return;
    }

    setIsCreatingDirectPO(true);
    try {
      // Deduct stock from inventory
      const result = await deductInventoryStock({
        itemName: request.itemName,
        quantity: deliveryQuantity,
        reason: `Direct delivery for request ${request.requestNumber}`,
      });

      // If full fulfillment (all from inventory), update request to delivery stage
      if (hasSufficientInventory || quantityFromVendor === 0) {
        await updatePurchaseRequestStatus({
          requestId: activeRequestId,
          status: "delivery_stage",
        });
        toast.success(
          `Direct Delivery created! ${deliveryQuantity} ${request.unit || 'units'} deducted from inventory. ` +
          `Remaining stock: ${result.newStock} ${itemInInventory?.unit || 'units'}`
        );
      } else {
        // Partial fulfillment - still need vendor quotes for remaining quantity
        toast.success(
          `${deliveryQuantity} ${request.unit || 'units'} taken from inventory. ` +
          `Remaining stock: ${result.newStock}. ` +
          `Please add vendor quotes for remaining ${quantityFromVendor} ${request.unit || 'units'}.`
        );
      }

      setShowDirectDeliveryConfirm(false);

      // Only close dialog if full fulfillment
      if (hasSufficientInventory || quantityFromVendor === 0) {
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create Direct PO");
    } finally {
      setIsCreatingDirectPO(false);
    }
  };

  const openImageSlider = (images: Array<{ imageUrl: string; imageKey: string }>, itemName: string, initialIndex: number = 0) => {
    setImageSliderImages(images);
    setImageSliderItemName(itemName);
    setImageSliderInitialIndex(initialIndex);
    setImageSliderOpen(true);
  };

  // Load selected vendor if CC is approved (for manager view)
  useEffect(() => {
    if (existingCC?.selectedVendorId && open && isManager) {
      setSelectedFinalVendor(existingCC.selectedVendorId);
    } else if (open && isManager && !existingCC?.selectedVendorId) {
      setSelectedFinalVendor("");
    }
  }, [existingCC, open, isManager]);

  // Reset CC index when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentCCIndex(0);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">Cost Comparison - {request?.requestNumber}</DialogTitle>
            <DialogDescription className="text-xs">
              {request?.itemName} • {request?.quantity} {request?.unit}
            </DialogDescription>

            {/* CC Navigation Tabs - shown when there are multiple CCs */}
            {hasMultipleCCs && (
              <div className="flex items-center gap-2 pt-2 border-t mt-2">
                <span className="text-xs text-muted-foreground">Items:</span>
                <div className="flex items-center gap-1">
                  {ccRequestIds.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentCCIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentCCIndex(index)}
                      className={`h-7 px-3 text-xs font-medium ${currentCCIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                        }`}
                    >
                      CC{index + 1}
                    </Button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  ({currentCCIndex + 1}/{ccRequestIds.length})
                </span>
              </div>
            )}
          </DialogHeader>

          <div className="space-y-3">
            {/* Item Information Card */}
            {request && (
              <div className="p-3 bg-muted/30 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Item Details</h4>
                  {canEdit && !isManager && !isEditingItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEditItem}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  {isEditingItem && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveItemDetails}
                        disabled={isUpdatingItem}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEditItem}
                        disabled={isUpdatingItem}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  {/* Item Name Row - Full Width */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Item:</span>
                      {!isEditingItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInventoryInfoOpen(true)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          title="View inventory information"
                        >
                          <Info className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {isEditingItem ? (
                      <div className="relative mt-1">
                        <Input
                          type="text"
                          value={editItemName}
                          onChange={(e) => handleItemNameInputChange(e.target.value)}
                          onKeyDown={handleItemNameKeyDown}
                          onFocus={handleItemNameFocus}
                          onBlur={handleItemNameBlur}
                          placeholder="Enter item name..."
                          className="text-sm"
                          disabled={isUpdatingItem}
                        />
                        {showItemNameSuggestions && getFilteredItemNameSuggestions(editItemName).length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {getFilteredItemNameSuggestions(editItemName).map((item, index) => (
                              <button
                                key={item._id}
                                type="button"
                                onClick={() => handleItemNameSuggestionClick(item.itemName)}
                                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors ${index === selectedItemNameIndex ? 'bg-muted font-medium' : ''
                                  }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{item.itemName}</span>
                                  <span className="text-muted-foreground ml-2">
                                    ({item.centralStock || 0} {item.unit || 'units'})
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium mt-1">{request.itemName}</p>
                    )}
                  </div>

                  {/* Quantity and Unit Row - 50/50 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      {isEditingItem ? (
                        <Input
                          type="number"
                          min="1"
                          step="any"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="h-7 text-xs mt-1"
                          disabled={isUpdatingItem}
                        />
                      ) : (
                        <p className="font-medium mt-1">{request.quantity}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit:</span>
                      {isEditingItem ? (
                        <div className="relative mt-1">
                          <Input
                            type="text"
                            placeholder="unit"
                            value={editUnit}
                            onChange={(e) => handleUnitInputChange(e.target.value)}
                            onKeyDown={handleUnitKeyDown}
                            onFocus={handleUnitFocus}
                            onBlur={handleUnitBlur}
                            className="h-7 text-xs"
                            disabled={isUpdatingItem}
                          />
                          {showUnitSuggestions && getFilteredUnitSuggestions(editUnit).length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {getFilteredUnitSuggestions(editUnit).map((suggestion, index) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => handleUnitSuggestionClick(suggestion)}
                                  className={`w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors ${index === selectedUnitIndex ? 'bg-muted font-medium' : ''
                                    }`}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="font-medium mt-1">{request.unit || itemInInventory?.unit || 'units'}</p>
                      )}
                    </div>
                  </div>
                  {/* Description Row - Full Width */}
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    {isEditingItem ? (
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Enter item description..."
                        className="mt-1 text-xs min-h-[60px]"
                        disabled={isUpdatingItem}
                      />
                    ) : (
                      <p className="text-sm mt-1">{request.description || "No description provided"}</p>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Direct Delivery - Shows when item is in inventory with sufficient stock */}
            {hasSufficientInventory && canEdit && !isSubmitted && !isManager && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-300 dark:border-green-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-700 dark:text-green-300">
                        ✓ Item Available in Inventory
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Stock: <span className="font-bold">{itemInInventory?.centralStock || 0}</span> {itemInInventory?.unit || 'units'}
                        <span className="mx-2">•</span>
                        Required: <span className="font-bold">{request?.quantity || 0}</span> {request?.unit || 'units'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDirectDeliveryConfirm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Direct Delivery
                  </Button>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-3 pl-14">
                  No vendor comparison needed. Click "Direct Delivery" to move directly to delivery stage.
                </p>
              </div>
            )}

            {/* Smart Fulfillment - Shows when item is in inventory but with partial stock */}
            {itemInInventory && !hasSufficientInventory && canEdit && !isSubmitted && !isManager && (itemInInventory.centralStock || 0) > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-300 dark:border-blue-700 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                      Smart Fulfillment
                    </span>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    Partial Stock Available
                  </span>
                </div>

                {/* Current Status */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded text-center">
                    <span className="text-green-600 dark:text-green-400 font-medium block">📦 In Stock</span>
                    <span className="font-bold text-green-700 dark:text-green-300 text-xl">{itemInInventory.centralStock || 0}</span>
                    <span className="text-green-600 dark:text-green-400 block">{itemInInventory.unit || 'units'}</span>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded text-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium block">🎯 Required</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-xl">{request?.quantity || 0}</span>
                    <span className="text-blue-600 dark:text-blue-400 block">{request?.unit || 'units'}</span>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded text-center">
                    <span className="text-amber-600 dark:text-amber-400 font-medium block">🛒 Need to Buy</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300 text-xl">{quantityFromVendor}</span>
                    <span className="text-amber-600 dark:text-amber-400 block">{itemInInventory.unit || 'units'}</span>
                  </div>
                </div>

                {/* Smart Controls */}
                <div className="grid grid-cols-2 gap-4">
                  {/* From Inventory - Direct Delivery */}
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm text-green-700 dark:text-green-300">From Inventory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={itemInInventory.centralStock || 0}
                        value={quantityFromInventory}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(Number(e.target.value), itemInInventory.centralStock || 0));
                          setQuantityFromInventory(val);
                          const newNeeded = Math.max(0, (request?.quantity || 0) - val);
                          setQuantityFromVendor(newNeeded);
                          setQuantityToBuy(Math.max(newNeeded, quantityToBuy < newNeeded ? newNeeded : quantityToBuy));
                        }}
                        className="w-20 text-center font-bold"
                      />
                      <span className="text-sm text-green-600 dark:text-green-400">{itemInInventory.unit || 'units'}</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Available: {itemInInventory.centralStock || 0}
                    </p>
                    {quantityFromInventory > 0 && (
                      <Button
                        onClick={() => setShowDirectDeliveryConfirm(true)}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Direct Delivery ({quantityFromInventory})
                      </Button>
                    )}
                  </div>

                  {/* From Vendors - Can buy more than needed */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm text-blue-700 dark:text-blue-300">Purchase from Vendors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={quantityToBuy}
                        onChange={(e) => setQuantityToBuy(Math.max(1, Number(e.target.value) || 0))}
                        className="w-20 text-center font-bold"
                      />
                      <span className="text-sm text-blue-600 dark:text-blue-400">{request?.unit || 'units'}</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Min: {quantityFromVendor} required (can buy more)
                    </p>
                    {quantityToBuy < quantityFromVendor && quantityToBuy > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        ⚠️ Need at least {quantityFromVendor} to fulfill request
                      </p>
                    )}
                  </div>
                </div>

                {/* Extra to Inventory Preview */}
                {quantityToBuy > quantityFromVendor && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400">📈</span>
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Extra → Inventory</span>
                      </div>
                      <span className="font-bold text-purple-700 dark:text-purple-300">
                        +{quantityToBuy - quantityFromVendor} {itemInInventory.unit || 'units'}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      After delivery, inventory will have: {Math.max(0, (itemInInventory.centralStock || 0) - quantityFromInventory) + (quantityToBuy - quantityFromVendor)} {itemInInventory.unit || 'units'}
                    </p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuantityFromInventory(itemInInventory.centralStock || 0);
                      const newNeeded = Math.max(0, (request?.quantity || 0) - (itemInInventory.centralStock || 0));
                      setQuantityFromVendor(newNeeded);
                      setQuantityToBuy(newNeeded);
                    }}
                    className="text-xs"
                  >
                    Use All Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuantityFromInventory(0);
                      setQuantityFromVendor(request?.quantity || 0);
                      setQuantityToBuy(request?.quantity || 0);
                    }}
                    className="text-xs"
                  >
                    Buy All from Vendors
                  </Button>
                </div>
              </div>
            )}

            {/* Out of Stock - Item in inventory but 0 stock */}
            {itemInInventory && !hasSufficientInventory && (itemInInventory.centralStock || 0) === 0 && canEdit && !isSubmitted && !isManager && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-300 dark:border-amber-700 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-sm text-amber-700 dark:text-amber-300">
                      Out of Stock - Purchase Required
                    </span>
                  </div>
                  <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                    0 in inventory
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded text-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium block text-xs">🎯 Required</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-xl">{request?.quantity || 0}</span>
                    <span className="text-blue-600 dark:text-blue-400 block text-xs">{request?.unit || 'units'}</span>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded">
                    <span className="text-green-600 dark:text-green-400 font-medium block text-xs text-center">🛒 Quantity to Buy</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <Input
                        type="number"
                        min="1"
                        value={quantityToBuy}
                        onChange={(e) => setQuantityToBuy(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-center font-bold"
                      />
                      <span className="text-sm text-green-600 dark:text-green-400">{request?.unit || 'units'}</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                      Min: {request?.quantity || 0} (can buy more)
                    </p>
                  </div>
                </div>

                {/* Extra to Inventory Preview */}
                {quantityToBuy > (request?.quantity || 0) && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400">📈</span>
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Extra → Inventory</span>
                      </div>
                      <span className="font-bold text-purple-700 dark:text-purple-300">
                        +{quantityToBuy - (request?.quantity || 0)} {itemInInventory.unit || 'units'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* New Item - Not in inventory */}
            {!itemInInventory && canEdit && !isSubmitted && !isManager && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-300 dark:border-blue-700 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                      New Item - Will be Added to Inventory
                    </span>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    Not in inventory
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded text-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium block text-xs">🎯 Required</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-xl">{request?.quantity || 0}</span>
                    <span className="text-blue-600 dark:text-blue-400 block text-xs">{request?.unit || 'units'}</span>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded">
                    <span className="text-green-600 dark:text-green-400 font-medium block text-xs text-center">🛒 Quantity to Buy</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <Input
                        type="number"
                        min="1"
                        value={quantityToBuy}
                        onChange={(e) => setQuantityToBuy(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-center font-bold"
                      />
                      <span className="text-sm text-green-600 dark:text-green-400">{request?.unit || 'units'}</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                      Min: {request?.quantity || 0} (can buy more)
                    </p>
                  </div>
                </div>

                {/* Extra to Inventory Preview */}
                {quantityToBuy > (request?.quantity || 0) && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400">📈</span>
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Extra → Inventory</span>
                      </div>
                      <span className="font-bold text-purple-700 dark:text-purple-300">
                        +{quantityToBuy - (request?.quantity || 0)} {request?.unit || 'units'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded text-xs text-blue-600 dark:text-blue-400">
                  💡 After purchase, this item will be added to inventory with the selected vendor relationship.
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

            {/* Vendor Quotes - Only show when there's NOT sufficient inventory (need to purchase from vendors) */}
            {(!hasSufficientInventory || isManagerReview) && (
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
                  <div className="space-y-4">
                    {vendorQuotes.length === 1 && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 text-center py-2 px-3 bg-amber-50 dark:bg-amber-950/50 rounded border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Add 1 more vendor to enable cost comparison submission
                      </div>
                    )}
                    {isManagerReview ? (
                      // Manager view: Clickable cards to select/deselect final vendor
                      <div className="space-y-3">
                        {vendorQuotes.map((quote) => (
                          <div
                            key={quote.vendorId}
                            onClick={() => {
                              // Toggle behavior: click to select, click again to deselect
                              if (selectedFinalVendor === quote.vendorId) {
                                setSelectedFinalVendor("");
                              } else {
                                setSelectedFinalVendor(quote.vendorId);
                              }
                            }}
                            className={`p-4 border rounded-lg transition-colors cursor-pointer ${selectedFinalVendor === quote.vendorId
                              ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                              : "hover:bg-muted/50 border-border"
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${selectedFinalVendor === quote.vendorId
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                                }`}>
                                {selectedFinalVendor === quote.vendorId && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="space-y-2">
                                  <p className="font-semibold text-base">{getVendorName(quote.vendorId)}</p>

                                  {/* Price breakdown */}
                                  <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">
                                      Base: ₹{quote.unitPrice.toFixed(2)}/{quote.amount || 1} {quote.unit || 'units'}
                                    </span>
                                    {quote.discountPercent && quote.discountPercent > 0 && (
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                        -{quote.discountPercent}% Discount
                                      </span>
                                    )}
                                    {quote.gstPercent && quote.gstPercent > 0 && (
                                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                                        +{quote.gstPercent}% GST
                                      </span>
                                    )}
                                  </div>

                                  {/* Final calculated price */}
                                  <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-sm text-muted-foreground">
                                      Final Unit Price: ₹{calculateFinalPrice(quote.unitPrice, quote.discountPercent, quote.gstPercent).toFixed(2)}
                                    </span>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                      Total: ₹{calculateQuoteTotal(quote, request?.quantity || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Purchase Officer view: List with remove buttons
                      <div className="border rounded-lg divide-y overflow-hidden">
                        {vendorQuotes.map((quote, index) => (
                          <div key={quote.vendorId} className="p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-base truncate">{getVendorName(quote.vendorId)}</p>
                                </div>

                                {/* Price breakdown */}
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">
                                    ₹{quote.unitPrice.toFixed(2)}/{quote.amount || 1} {quote.unit || 'units'}
                                  </span>
                                  {quote.discountPercent && quote.discountPercent > 0 && (
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                      -{quote.discountPercent}% Discount
                                    </span>
                                  )}
                                  {quote.gstPercent && quote.gstPercent > 0 && (
                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                                      +{quote.gstPercent}% GST
                                    </span>
                                  )}
                                </div>

                                {/* Final price */}
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-muted-foreground">
                                    {(quote.discountPercent || quote.gstPercent) && (
                                      <span>
                                        Final: ₹{calculateFinalPrice(quote.unitPrice, quote.discountPercent, quote.gstPercent).toFixed(2)}/{quote.amount || 1} {quote.unit || 'units'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    Total: ₹{calculateQuoteTotal(quote, request?.quantity || 0).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              {canEdit && (
                                <div className="flex gap-1 shrink-0 ml-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditQuote(index)}
                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
                                    title="Edit quote"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveVendor(quote.vendorId)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    title="Remove vendor"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Best Price Recommendation */}
                    {vendorQuotes.length >= 2 && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Recommendation (Based on Final Price)</span>
                        </div>
                        {(() => {
                          // Sort by final calculated price (after discount and GST)
                          const sortedQuotes = [...vendorQuotes].sort((a, b) =>
                            calculateFinalPrice(a.unitPrice, a.discountPercent, a.gstPercent) -
                            calculateFinalPrice(b.unitPrice, b.discountPercent, b.gstPercent)
                          );
                          const bestQuote = sortedQuotes[0];
                          const nextBestQuote = sortedQuotes[1];
                          const bestVendor = getVendorName(bestQuote.vendorId);
                          const bestFinalPrice = calculateFinalPrice(bestQuote.unitPrice, bestQuote.discountPercent, bestQuote.gstPercent);
                          const nextFinalPrice = calculateFinalPrice(nextBestQuote.unitPrice, nextBestQuote.discountPercent, nextBestQuote.gstPercent);
                          const savings = nextFinalPrice - bestFinalPrice;
                          const totalSavings = savings * (request?.quantity || 0);

                          return (
                            <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                              <p className="font-medium">Best Price: {bestVendor}</p>
                              <p>
                                Final: ₹{bestFinalPrice.toFixed(2)}/{bestQuote.amount || 1} {bestQuote.unit || 'unit'}
                                {bestQuote.discountPercent && bestQuote.discountPercent > 0 && (
                                  <span className="text-xs"> (after {bestQuote.discountPercent}% discount)</span>
                                )}
                                {bestQuote.gstPercent && bestQuote.gstPercent > 0 && (
                                  <span className="text-xs"> (+{bestQuote.gstPercent}% GST)</span>
                                )}
                              </p>
                              <p className="font-semibold">
                                💰 Save ₹{savings.toFixed(2)}/unit • Total Savings: ₹{totalSavings.toFixed(2)}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-3 space-y-1">
                    <p>No vendors added</p>
                    <p>Add at least 2 vendors to enable cost comparison submission</p>
                  </div>
                )}

                {/* Simplified Vendor Selection Dialog */}
                <Dialog open={vendorDialogOpen && canEdit} onOpenChange={(open) => {
                  if (canEdit) {
                    setVendorDialogOpen(open);
                    // Reset form when closing
                    if (!open) {
                      setSelectedVendorId("");
                      setUnitPrice("");
                      setQuoteAmount("1");
                      setQuoteUnit(request?.unit || itemInInventory?.unit || "");
                      setShowVendorDetails(null);
                      setShowCreateVendorDialog(false);
                      setVendorSearchTerm("");
                      setShowVendorDropdown(false);
                      setSelectedVendorIndex(-1);
                      setShowUnitSuggestions(false);
                      setSelectedUnitIndex(-1);
                      setShowUnitSuggestions(false);
                      setSelectedUnitIndex(-1);
                    }
                  }
                }}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingQuoteIndex >= 0 ? 'Edit Vendor Quote' : 'Add Vendor Quote'}</DialogTitle>
                      <DialogDescription>
                        {editingQuoteIndex >= 0 ? 'Update the quote details.' : 'Select vendor and enter quote details.'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Vendor Selection Row */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Vendor</Label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              type="text"
                              placeholder="Search and select vendor..."
                              value={vendorSearchTerm}
                              onChange={(e) => setVendorSearchTerm(e.target.value)}
                              onKeyDown={(e) => {
                                const suggestions = vendorSearchTerm.trim() ? [
                                  ...filteredVendors,
                                  { _id: 'create', companyName: `Create "${vendorSearchTerm}" as new vendor` }
                                ] : filteredVendors;

                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setSelectedVendorIndex(prev =>
                                    prev < suggestions.length - 1 ? prev + 1 : prev
                                  );
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setSelectedVendorIndex(prev => prev > 0 ? prev - 1 : -1);
                                } else if (e.key === 'Enter' && selectedVendorIndex >= 0) {
                                  e.preventDefault();
                                  const selected = suggestions[selectedVendorIndex];
                                  if (selected._id === 'create') {
                                    setShowCreateVendorDialog(true);
                                    setShowVendorDropdown(false);
                                  } else {
                                    setSelectedVendorId(selected._id as Id<"vendors">);
                                    setVendorSearchTerm(selected.companyName);
                                    setShowVendorDropdown(false);
                                  }
                                  setSelectedVendorIndex(-1);
                                } else if (e.key === 'Escape') {
                                  setShowVendorDropdown(false);
                                  setSelectedVendorIndex(-1);
                                }
                              }}
                              className="text-sm"
                              onFocus={() => setShowVendorDropdown(true)}
                              onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                              required
                            />
                            {showVendorDropdown && (
                              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {filteredVendors.length > 0 ? (
                                  filteredVendors.map((vendor, index) => (
                                    <div
                                      key={vendor._id}
                                      onClick={() => {
                                        setSelectedVendorId(vendor._id);
                                        setVendorSearchTerm(vendor.companyName);
                                        setShowVendorDropdown(false);
                                      }}
                                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between cursor-pointer ${index === selectedVendorIndex ? 'bg-muted' : ''
                                        }`}
                                    >
                                      <span>{vendor.companyName}</span>
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowVendorDetails(vendor._id);
                                        }}
                                        className="opacity-60 hover:opacity-100 p-1 rounded"
                                      >
                                        <Info className="h-3 w-3" />
                                      </div>
                                    </div>
                                  ))
                                ) : vendorSearchTerm.trim() ? (
                                  <div
                                    onClick={() => {
                                      setShowCreateVendorDialog(true);
                                      setShowVendorDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer ${filteredVendors.length === selectedVendorIndex ? 'bg-blue-50 dark:bg-blue-950/50' : ''
                                      }`}
                                  >
                                    <Plus className="h-3 w-3 inline mr-1" />
                                    Create "{vendorSearchTerm}" as new vendor
                                  </div>
                                ) : (
                                  <div className="px-3 py-2 text-sm text-muted-foreground">
                                    No vendors available
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setVendorSearchTerm("");
                              setSelectedVendorId("");
                            }}
                            disabled={!vendorSearchTerm}
                            className="px-3 opacity-60 hover:opacity-100"
                            title="Clear vendor selection"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateVendorDialog(true)}
                          className="px-3"
                          title="Add new vendor"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Amount, Unit, Price Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Amount *</Label>
                        <Input
                          type="number"
                          min="1"
                          step="any"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                          placeholder="1"
                          className="text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Unit *</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={quoteUnit}
                            onChange={(e) => handleQuoteUnitInputChange(e.target.value)}
                            onKeyDown={handleQuoteUnitKeyDown}
                            onFocus={handleQuoteUnitFocus}
                            onBlur={handleQuoteUnitBlur}
                            placeholder={request?.unit || itemInInventory?.unit || "kg"}
                            className="text-sm"
                            required
                          />
                          {showUnitSuggestions && getFilteredUnitSuggestionsForQuote(quoteUnit).length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {getFilteredUnitSuggestionsForQuote(quoteUnit).map((suggestion, index) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => handleQuoteUnitSuggestionClick(suggestion)}
                                  className={`w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors ${index === selectedUnitIndex ? 'bg-muted font-medium' : ''
                                    }`}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Price (₹) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                          placeholder="0.00"
                          className="text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    {/* Discount and GST Row (Optional) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Discount %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={quoteDiscount}
                          onChange={(e) => setQuoteDiscount(e.target.value)}
                          placeholder="0"
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Optional discount percentage</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">GST %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={quoteGst}
                          onChange={(e) => setQuoteGst(e.target.value)}
                          placeholder="0"
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Optional GST percentage</p>
                      </div>
                    </div>

                    {/* Price Calculation Preview */}
                    {unitPrice && (
                      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Price Calculation Preview</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base Price:</span>
                            <span className="font-medium">₹{parseFloat(unitPrice || "0").toFixed(2)}</span>
                          </div>
                          {parseFloat(quoteDiscount || "0") > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount ({quoteDiscount}%):</span>
                              <span>-₹{(parseFloat(unitPrice || "0") * parseFloat(quoteDiscount || "0") / 100).toFixed(2)}</span>
                            </div>
                          )}
                          {parseFloat(quoteDiscount || "0") > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">After Discount:</span>
                              <span className="font-medium">₹{calculatePriceAfterDiscount(parseFloat(unitPrice || "0"), parseFloat(quoteDiscount || "0")).toFixed(2)}</span>
                            </div>
                          )}
                          {parseFloat(quoteGst || "0") > 0 && (
                            <div className="flex justify-between text-amber-600">
                              <span>GST ({quoteGst}%):</span>
                              <span>+₹{calculateGstAmount(calculatePriceAfterDiscount(parseFloat(unitPrice || "0"), parseFloat(quoteDiscount || "0")), parseFloat(quoteGst || "0")).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between pt-2 border-t border-muted-foreground/20">
                          <span className="font-semibold">Final Price:</span>
                          <span className="font-bold text-lg text-primary">
                            ₹{calculateFinalPrice(parseFloat(unitPrice || "0"), parseFloat(quoteDiscount || "0"), parseFloat(quoteGst || "0")).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => {
                        setVendorDialogOpen(false);
                        setEditingQuoteIndex(-1);
                        setSelectedVendorId("");
                        setUnitPrice("");
                        setQuoteAmount("1");
                        setQuoteUnit("");
                        setQuoteDiscount("");
                        setQuoteGst("");
                        setVendorSearchTerm("");
                      }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddVendor}
                        disabled={!selectedVendorId || !unitPrice}
                      >
                        {editingQuoteIndex >= 0 ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Update Quote
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Quote
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Create Vendor Dialog */}
                <Dialog open={showCreateVendorDialog} onOpenChange={setShowCreateVendorDialog}>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Vendor</DialogTitle>
                      <DialogDescription>
                        Add a new vendor for this quote.
                      </DialogDescription>
                    </DialogHeader>

                    <VendorCreationForm
                      onVendorCreated={(vendorId) => {
                        const newVendor = vendors?.find(v => v._id === vendorId);
                        if (newVendor) {
                          setSelectedVendorId(vendorId);
                          setVendorSearchTerm(newVendor.companyName);
                          setShowCreateVendorDialog(false);
                          toast.success("Vendor created! You can now add the quote details.");
                        }
                      }}
                      onCancel={() => setShowCreateVendorDialog(false)}
                      itemName={request?.itemName}
                      initialCompanyName={vendorSearchTerm}
                    />
                  </DialogContent>
                </Dialog>

                {/* Inventory Information Dialog */}
                <Dialog open={inventoryInfoOpen} onOpenChange={setInventoryInfoOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Inventory Information
                      </DialogTitle>
                      <DialogDescription>
                        Details for "{request?.itemName}"
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {itemInInventory ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Item exists in inventory</span>
                          </div>

                          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Central Stock:</span>
                                <p className="font-medium">{itemInInventory.centralStock || 0} {itemInInventory.unit || 'units'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Unit:</span>
                                <p className="font-medium">{itemInInventory.unit || 'Not specified'}</p>
                              </div>
                            </div>

                            {itemInInventory.vendorIds && itemInInventory.vendorIds.length > 0 && (
                              <div>
                                <span className="text-muted-foreground text-sm">Associated Vendors:</span>
                                <div className="mt-1 space-y-1">
                                  {itemInInventory.vendorIds.map((vendorId) => {
                                    const vendor = vendors?.find(v => v._id === vendorId);
                                    return vendor ? (
                                      <div key={vendorId} className="flex items-center gap-2 text-sm">
                                        <Building className="h-3 w-3 text-muted-foreground" />
                                        <span>{vendor.companyName}</span>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}

                            {itemInInventory.images && itemInInventory.images.length > 0 && (
                              <div>
                                <span className="text-muted-foreground text-sm">Images:</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {itemInInventory.images.slice(0, 4).map((image, index) => (
                                    <div key={image.imageKey} className="relative group">
                                      <button
                                        type="button"
                                        onClick={() => openImageSlider(itemInInventory.images || [], request?.itemName || 'Item', index)}
                                        className="block"
                                      >
                                        <LazyImage
                                          src={image.imageUrl}
                                          alt={`Image ${index + 1}`}
                                          width={60}
                                          height={45}
                                          className="rounded border hover:border-primary transition-colors object-cover"
                                        />
                                      </button>
                                      {index === 3 && itemInInventory.images && itemInInventory.images.length > 4 && (
                                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                          <span className="text-white text-xs font-medium">
                                            +{itemInInventory.images.length - 4}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {itemInInventory.images.length} image{itemInInventory.images.length !== 1 ? 's' : ''} • Click to view
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="text-sm">
                              <p className="font-medium text-blue-700 dark:text-blue-300">Stock Status</p>
                              <p className="text-blue-600 dark:text-blue-400">
                                {(itemInInventory.centralStock || 0) >= (request?.quantity || 0)
                                  ? 'Sufficient stock available'
                                  : 'Insufficient stock - may need to reorder'
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {(itemInInventory.centralStock || 0)} / {request?.quantity || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">Available / Required</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Item not found in inventory</span>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg text-center">
                            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-3">
                              This item is not currently in your inventory system.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              You may want to add this item to inventory or check if it exists under a different name.
                            </p>
                          </div>

                          <Button
                            onClick={() => {
                              // Navigate to inventory page
                              window.location.href = '/dashboard/inventory';
                            }}
                            className="w-full"
                            variant="outline"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Check Inventory
                          </Button>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInventoryInfoOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Manager Review Actions */}
            {isManagerReview && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-xs font-medium">
                    Manager Notes / Rejection Reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={managerNotes}
                    onChange={(e) => setManagerNotes(e.target.value)}
                    placeholder="Required: Please provide a detailed reason for rejecting this cost comparison..."
                    className="mt-1 text-sm min-h-[80px]"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    onClick={async () => {
                      if (!managerNotes.trim()) {
                        toast.error("Please provide a reason for rejection");
                        return;
                      }

                      setIsReviewing(true);
                      try {
                        await reviewCC({
                          requestId,
                          action: "reject",
                          notes: managerNotes.trim(),
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

            {/* Purchase Officer Actions - Only show vendor workflow when insufficient inventory */}
            {canEdit && !isSubmitted && !isManager && !hasSufficientInventory && (
              <div className="space-y-2 pt-1">
                {/* Auto-save indicator */}
                {isSaving && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="h-3 w-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    Auto-saving...
                  </div>
                )}
                <div className="flex gap-2">
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
                    onClick={handleSubmit}
                    disabled={isSaving || isSubmitting || vendorQuotes.length < 2}
                    size="sm"
                    className="flex-1"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {existingCC?.status === "cc_rejected" ? "Resubmit" : "Submit for Approval"}
                  </Button>
                </div>
              </div>
            )}

            {isSubmitted && !isManagerReview && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Submitted for manager approval
              </p>
            )}
          </div >
        </DialogContent >

        {/* Image Slider */}
        < ImageSlider
          images={imageSliderImages}
          initialIndex={imageSliderInitialIndex}
          open={imageSliderOpen}
          onOpenChange={setImageSliderOpen}
          itemName={imageSliderItemName}
        />
      </Dialog >

      {/* Direct Delivery Confirmation Dialog */}
      < AlertDialog open={showDirectDeliveryConfirm} onOpenChange={setShowDirectDeliveryConfirm} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Confirm Direct Delivery from Inventory
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This will deduct stock from inventory and {hasSufficientInventory || quantityFromVendor === 0 ? 'move to delivery stage' : 'prepare for vendor orders'}.</p>

                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                  <p className="font-semibold text-green-700 dark:text-green-300">{request?.itemName}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <span className="text-muted-foreground block text-xs">Deducting from Inventory</span>
                      <span className="font-bold text-green-600 text-lg">
                        {hasSufficientInventory ? (request?.quantity || 0) : quantityFromInventory}
                      </span>
                      <span className="text-muted-foreground ml-1">{request?.unit || 'units'}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <span className="text-muted-foreground block text-xs">Stock After Deduction</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {Math.max(0, (itemInInventory?.centralStock || 0) - (hasSufficientInventory ? (request?.quantity || 0) : quantityFromInventory))}
                      </span>
                      <span className="text-muted-foreground ml-1">{itemInInventory?.unit || 'units'}</span>
                    </div>
                  </div>

                  {!hasSufficientInventory && quantityFromVendor > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
                      <span className="text-amber-700 dark:text-amber-300 text-xs font-medium">
                        ⚠ Remaining {quantityFromVendor} {request?.unit || 'units'} will need vendor quotes
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {hasSufficientInventory || quantityFromVendor === 0
                    ? 'The request will move directly to delivery stage. No vendor comparison needed.'
                    : 'After this, please add vendor quotes for the remaining quantity.'}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreatingDirectPO}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDirectDelivery}
              disabled={isCreatingDirectPO}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreatingDirectPO ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Confirm Delivery ({hasSufficientInventory ? (request?.quantity || 0) : quantityFromInventory} {request?.unit || 'units'})
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >

      {/* Vendor Details Dialog */}
      < Dialog open={!!showVendorDetails
      } onOpenChange={() => setShowVendorDetails(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Vendor Details
            </DialogTitle>
          </DialogHeader>

          {showVendorDetails && (() => {
            const vendor = vendors?.find(v => v._id === showVendorDetails);
            if (!vendor) return null;

            return (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <h3 className="font-semibold text-lg">{vendor.companyName}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{vendor.email}</p>
                    </div>
                  </div>

                  {vendor.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{vendor.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">GST Number</p>
                      <p className="text-sm text-muted-foreground">{vendor.gstNumber}</p>
                    </div>
                  </div>

                  {vendor.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{vendor.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVendorDetails(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

    </>
  );
}

