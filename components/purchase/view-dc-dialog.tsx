"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Truck, User, Phone, MapPin, FileText, Camera, CreditCard } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface ViewDCDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deliveryId: Id<"deliveries"> | null;
}

export function ViewDCDialog({ open, onOpenChange, deliveryId }: ViewDCDialogProps) {
    const delivery = useQuery(
        api.deliveries.getDeliveryById,
        deliveryId ? { deliveryId } : "skip"
    );

    if (!delivery && open) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Loading...</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 text-center text-muted-foreground">
                        Loading delivery details...
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!delivery) {
        return null;
    }

    const deliveryTypeLabel = {
        private: "Private Vehicle",
        public: "Public/Porter",
        vendor: "From Vendor (Transport)"
    }[delivery.deliveryType] || delivery.deliveryType;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Delivery Challan Details
                    </DialogTitle>
                    <DialogDescription>
                        View delivery information for DC #{delivery.deliveryId}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Delivery ID and Type */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">Delivery ID</p>
                            <p className="font-semibold">{delivery.deliveryId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Delivery Type</p>
                            <Badge variant="outline">{deliveryTypeLabel}</Badge>
                        </div>
                    </div>

                    {/* Delivery Party Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Delivery Party Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                            {delivery.deliveryPerson && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Person Name</p>
                                    <p className="font-medium">{delivery.deliveryPerson}</p>
                                </div>
                            )}
                            {delivery.deliveryContact && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Contact</p>
                                    <p className="font-medium flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {delivery.deliveryContact}
                                    </p>
                                </div>
                            )}
                            {delivery.vehicleNumber && (
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Vehicle Number</p>
                                    <p className="font-medium">{delivery.vehicleNumber}</p>
                                </div>
                            )}
                            {delivery.transportName && (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Transport Name</p>
                                        <p className="font-medium">{delivery.transportName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Transport ID</p>
                                        <p className="font-medium">{delivery.transportId}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Receiver Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Receiver Information
                        </h3>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Receiver Name (Site)</p>
                            <p className="font-medium">{delivery.receiverName}</p>
                        </div>
                    </div>

                    {/* Documentation */}
                    {(delivery.loadingPhoto || delivery.invoicePhoto || delivery.receiptPhoto) && (
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Documentation
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {delivery.loadingPhoto && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Loading Photo</p>
                                        <img
                                            src={delivery.loadingPhoto.imageUrl}
                                            alt="Loading"
                                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(delivery.loadingPhoto!.imageUrl, '_blank')}
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                )}
                                {delivery.invoicePhoto && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Invoice Photo</p>
                                        <img
                                            src={delivery.invoicePhoto.imageUrl}
                                            alt="Invoice"
                                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(delivery.invoicePhoto!.imageUrl, '_blank')}
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                )}
                                {delivery.receiptPhoto && (
                                    <div className="p-3 border rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Receipt Photo</p>
                                        <img
                                            src={delivery.receiptPhoto.imageUrl}
                                            alt="Receipt"
                                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(delivery.receiptPhoto!.imageUrl, '_blank')}
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    {delivery.paymentAmount && (
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payment Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-semibold text-lg">₹{delivery.paymentAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={delivery.paymentStatus === "paid" ? "default" : "secondary"}>
                                        {delivery.paymentStatus}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="text-xs text-muted-foreground pt-4 border-t">
                        <p>Created: {new Date(delivery.createdAt).toLocaleString()}</p>
                        {delivery.purchaserName && <p>Purchaser: {delivery.purchaserName}</p>}
                        {delivery.approvedByRole && <p>Approved By: {delivery.approvedByRole === "manager" ? "Manager (Account)" : "Purchase Executive (PE)"}</p>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
