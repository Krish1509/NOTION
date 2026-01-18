---
description: Add quantity edit feature for Pending PO items
---

# Partial Delivery Quantity Edit Feature

## Overview
Allow managers/purchase officers to reduce the quantity of "Pending PO" items when vendors can't supply the full amount. The remaining quantity stays in "Ready for Delivery" for future ordering.

## Requirements

### 1. UI Changes - Request Details Dialog
- Add "Edit Quantity" button for items with status "pending_po"
- Show dialog to reduce quantity (cannot increase, only decrease)
- Validate: New quantity must be > 0 and < original quantity
- Show split preview: "60 → Delivery, 40 → Stays Ready"

### 2. Backend - New Mutation
File: `convex/requests.ts`

Create mutation: `splitPendingPOQuantity`
- Input: requestId, newQuantity
- Validate: newQuantity < original quantity
- Create new request with remaining quantity (status: "ready_for_cc")
- Update original request with reduced quantity (keep status: "pending_po")
- Add timeline note: "Quantity split: 60 for delivery, 40 remaining"

### 3. Flow
```
Original: 100 bags (pending_po)
         ↓
User edits to: 60 bags
         ↓
Result:
  - Request A: 60 bags (pending_po) → Can proceed to delivery
  - Request B: 40 bags (ready_for_cc) → Available for next order
```

## Implementation Steps

1. Add Edit Quantity button in RequestDetailsDialog for pending_po items
2. Create EditQuantityDialog component
3. Create splitPendingPOQuantity mutation in convex
4. Wire up the dialog to call mutation
5. Show success message and refresh data

## Success Criteria
- Manager can reduce quantity for pending_po items
- Remaining quantity creates new request in ready_for_cc status
- Timeline shows the split action
- Both requests maintain proper linkage (same requestNumber)
