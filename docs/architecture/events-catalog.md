# Domain Events Catalog

> **Last Updated:** 2026-07-31  
> **ADR Reference:** ADR-013 (Event Naming), ADR-014 (Event Versioning)  
> **Format:** `Domain.Entity.Action` (PascalCase) — version `1`

---

## Core Domain

| Event | Publisher | Payload | Consumers |
|-------|-----------|---------|-----------|
| `Core.User.Created` | `UserService` | `{ userId, email, name }` | — |
| `Core.User.Updated` | `UserService` | `{ userId, changes }` | — |
| `Core.User.Deactivated` | `UserService` | `{ userId }` | — |
| `Core.Organization.Created` | `OrganizationService` | `{ orgId, name, ownerId }` | — |
| `Core.Audit.Created` | `AuditService` | `{ auditId, action, entity, entityId, userId }` | — |

---

## Procurement Domain

### Purchase Request (PR)

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Procurement.PR.Created` | `PurchaseRequestService` | `{ prId, orgId, items, totalAmount }` |
| `Procurement.PR.Submitted` | `PurchaseRequestService` | `{ prId, submittedBy }` |
| `Procurement.PR.Updated` | `PurchaseRequestService` | `{ prId, changes }` |
| `Procurement.PR.Approved` | `PurchaseRequestService` | `{ prId, approvedBy, reason }` |
| `Procurement.PR.Rejected` | `PurchaseRequestService` | `{ prId, approvedBy, reason }` |

### Request for Quotation (RFQ)

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Procurement.RFQ.Created` | `RFQService` | `{ rfqId, title, referenceNumber, orgId, itemsCount, supplierCount }` |
| `Procurement.RFQ.Updated` | `RFQService` | `{ rfqId, changes }` |
| `Procurement.RFQ.Submitted` | `RFQService` | `{ rfqId, submittedBy, referenceNumber }` |
| `Procurement.RFQ.Sent` | `RFQService` | `{ rfqId, referenceNumber, supplierIds, deadlineDate }` |
| `Procurement.RFQ.SupplierInvited` | `RFQService` | `{ rfqId, referenceNumber, supplierId, invitedBy }` |
| `Procurement.RFQ.Awarded` | `RFQService` | `{ rfqId, referenceNumber, supplierId, quotationId, awardedBy }` |
| `Procurement.RFQ.Closed` | `RFQService` | `{ rfqId, referenceNumber, closedBy }` |
| `Procurement.RFQ.Cancelled` | `RFQService` | `{ rfqId, referenceNumber, cancelledBy, reason }` |

### Quotation

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Procurement.Quotation.Created` | `QuotationService` | `{ quotationId, rfqId, supplierId, totalAmount, grandTotal, currency, itemsCount }` |
| `Procurement.Quotation.Updated` | `QuotationService` | `{ quotationId, rfqId, changes }` |
| `Procurement.Quotation.Submitted` | `QuotationService` | `{ quotationId, rfqId, submittedBy, referenceNumber }` |
| `Procurement.Quotation.Withdrawn` | `QuotationService` | `{ quotationId, rfqId, withdrawnBy, referenceNumber }` |
| `Procurement.Quotation.Accepted` | `QuotationService` | `{ quotationId, rfqId, acceptedBy, referenceNumber }` |
| `Procurement.Quotation.Rejected` | `QuotationService` | `{ quotationId, rfqId, rejectedBy, reason, referenceNumber }` |

### Evaluation & Approval

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Procurement.Evaluation.Started` | `EvaluationService` | `{ evaluationId, quotationId, rfqId, evaluatorId }` |
| `Procurement.Evaluation.Scored` | `EvaluationService` | `{ evaluationId, totalScore, scoreCount }` |
| `Procurement.Evaluation.Completed` | `EvaluationService` | `{ evaluationId, quotationId, totalScore, scoreCount }` |
| `Procurement.Approval.Requested` | `EvaluationService` | `{ approvalId, evaluationId, quotationRef, requestedBy }` |
| `Procurement.Approval.Approved` | `EvaluationService` | `{ approvalId, evaluationId, action, comment, decisionBy }` |
| `Procurement.Approval.Rejected` | `EvaluationService` | `{ approvalId, evaluationId, action, comment, decisionBy }` |

### Award

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Procurement.Award.Created` | `RFQService` | `{ rfqId, referenceNumber, supplierId, quotationId, awardedBy }` |
| `Procurement.Award.Accepted` | Orchestrator (Phase 3) | `{ awardId, rfqId, supplierId, quotationId, acceptedBy }` |
| `Procurement.Award.Declined` | Orchestrator (Phase 3) | `{ awardId, rfqId, supplierId, quotationId, declinedBy, reason }` |
| `Procurement.Award.Cancelled` | Orchestrator (Phase 3) | `{ awardId, rfqId, cancelledBy, reason }` |

### Purchase Order (PO)

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Procurement.PO.Created` | `PurchaseOrderService` | `{ poId, poNumber, supplierId, totalAmount, itemCount }` |
| `Procurement.PO.Updated` | `PurchaseOrderService` | `{ poId, poNumber, changes }` |
| `Procurement.PO.Issued` | `PurchaseOrderService` | `{ poId, poNumber, supplierId, issuedBy }` |
| `Procurement.PO.Acknowledged` | `PurchaseOrderService` | `{ poId, poNumber, acknowledgedBy }` |
| `Procurement.PO.Cancelled` | `PurchaseOrderService` | `{ poId, poNumber, cancelledBy, reason }` |
| `Procurement.PO.Completed` | `PurchaseOrderService` | `{ poId, poNumber, completedBy }` |

### Delivery

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Procurement.Delivery.Created` | `DeliveryService` | `{ deliveryId, deliveryNumber, purchaseOrderId }` |
| `Procurement.Delivery.Updated` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |
| `Procurement.Delivery.Deleted` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |
| `Procurement.Delivery.Dispatched` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |
| `Procurement.Delivery.InTransit` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |
| `Procurement.Delivery.Arrived` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |
| `Procurement.Delivery.Received` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |
| `Procurement.Delivery.Completed` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |
| `Procurement.Delivery.Cancelled` | `DeliveryService` | `{ deliveryId, deliveryNumber }` |

---

## Quality Domain

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Quality.Inspection.Created` | `QualityService` | `{ inspectionId, inspectionNumber }` |
| `Quality.Inspection.Started` | `QualityService` | `{ inspectionId, inspectionNumber, status }` |
| `Quality.Inspection.Passed` | `QualityService` | `{ inspectionId, inspectionNumber, status }` |
| `Quality.Inspection.Failed` | `QualityService` | `{ inspectionId, inspectionNumber, status }` |
| `Quality.Inspection.Partial` | `QualityService` | `{ inspectionId, inspectionNumber, status }` |
| `Quality.NCR.Created` | `QualityService` | `{ ncrId, ncrNumber, inspectionId }` |
| `Quality.Acceptance.Issued` | `QualityService` | `{ certificateId, certificateNumber, inspectionId }` |

---

## Financial Domain

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Financial.Reservation.Created` | `FinancialTrustService` | `{ reservationId, poId, amount, currency }` |
| `Financial.Reservation.Held` | `FinancialTrustService` | `{ reservationId, poId, amount }` |
| `Financial.Reservation.PartiallyReleased` | `FinancialTrustService` | `{ reservationId, poId, releasedAmount, heldAmount }` |
| `Financial.Reservation.Released` | `FinancialTrustService` | `{ reservationId, poId, amount }` |
| `Financial.Reservation.Refunded` | `FinancialTrustService` | `{ reservationId, poId, amount }` |
| `Financial.Reservation.Cancelled` | `FinancialTrustService` | `{ reservationId, poId, reason }` |

---

## Invoicing Domain

*(Implemented in Sprint 3.9)*

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Invoicing.Invoice.Created` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId, totalAmount }` |
| `Invoicing.Invoice.Submitted` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Verified` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Matched` | `InvoicingService` | `{ invoiceId, invoiceNumber, referenceType, referenceId, matchStatus, varianceQuantity, varianceAmount }` |
| `Invoicing.Invoice.PartiallyMatched` | `InvoicingService` | `{ invoiceId, invoiceNumber, referenceType, referenceId, matchStatus, varianceQuantity, varianceAmount }` |
| `Invoicing.Invoice.Approved` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Authorized` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Rejected` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId, reason }` |
| `Invoicing.Invoice.Cancelled` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |

---

---

## Invoicing Domain

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Invoicing.Invoice.Created` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId, totalAmount }` |
| `Invoicing.Invoice.Submitted` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Verified` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Matched` | `InvoicingService` | `{ invoiceId, invoiceNumber, referenceType, referenceId, matchStatus, varianceQuantity, varianceAmount }` |
| `Invoicing.Invoice.PartiallyMatched` | `InvoicingService` | `{ invoiceId, invoiceNumber, referenceType, referenceId, matchStatus, varianceQuantity, varianceAmount }` |
| `Invoicing.Invoice.Approved` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Authorized` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |
| `Invoicing.Invoice.Rejected` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId, reason }` |
| `Invoicing.Invoice.Cancelled` | `InvoicingService` | `{ invoiceId, invoiceNumber, poId }` |

---

## Phase 2 — Planned Events

### Supplier Network Domain (Sprint 5.1)

| Event | Publisher | Payload |
|-------|-----------|---------|
| `SupplierNetwork.Organization.Registered` | `SupplierNetworkService` | `{ organizationId, supplierType }` |
| `SupplierNetwork.Profile.Completed` | `SupplierNetworkService` | `{ supplierId, organizationId, companyName }` |
| `SupplierNetwork.Verification.Upgraded` | `SupplierNetworkService` | `{ supplierId, fromLevel, toLevel }` |
| `SupplierNetwork.Verification.Rejected` | `SupplierNetworkService` | `{ supplierId, level, reason }` |
| `SupplierNetwork.Document.Uploaded` | `SupplierNetworkService` | `{ documentId, supplierId, docType }` |
| `SupplierNetwork.Document.Verified` | `SupplierNetworkService` | `{ documentId, supplierId, docType }` |
| `SupplierNetwork.Document.Expiring` | `SupplierNetworkService` | `{ documentId, supplierId, docType, expiresAt }` |
| `SupplierNetwork.Document.Expired` | `SupplierNetworkService` | `{ documentId, supplierId, docType }` |
| `SupplierNetwork.Rating.Submitted` | `SupplierNetworkService` | `{ ratingId, supplierId, organizationId, rating }` |

### Product Catalog Domain (Sprint 5.2)

| Event | Publisher | Payload |
|-------|-----------|---------|
| `ProductCatalog.Product.Created` | `ProductCatalogService` | `{ productId, sku, manufacturerId, categoryId }` |
| `ProductCatalog.Product.Updated` | `ProductCatalogService` | `{ productId, sku }` |
| `ProductCatalog.Product.Published` | `ProductCatalogService` | `{ productId, sku }` |
| `ProductCatalog.Product.Archived` | `ProductCatalogService` | `{ productId, sku }` |
| `ProductCatalog.Variant.Created` | `ProductCatalogService` | `{ variantId, productId, sku }` |
| `ProductCatalog.Variant.Updated` | `ProductCatalogService` | `{ variantId, productId }` |
| `ProductCatalog.Specification.Added` | `ProductCatalogService` | `{ specId, productId }` |
| `ProductCatalog.DataSheet.Uploaded` | `ProductCatalogService` | `{ sheetId, productId }` |
| `ProductCatalog.SafetySheet.Uploaded` | `ProductCatalogService` | `{ sheetId, productId }` |
| `ProductCatalog.Image.Uploaded` | `ProductCatalogService` | `{ imageId, productId }` |
| `ProductCatalog.Offering.Created` | `ProductCatalogService` | `{ offeringId, productId, supplierId, price }` |
| `ProductCatalog.Offering.Updated` | `ProductCatalogService` | `{ offeringId, productId, supplierId }` |
| `ProductCatalog.Offering.PriceChanged` | `ProductCatalogService` | `{ offeringId, productId, supplierId, oldPrice, newPrice }` |
| `ProductCatalog.Offering.Discontinued` | `ProductCatalogService` | `{ offeringId, productId, supplierId }` |

### Inventory Domain (Sprint 5.3)

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Inventory.Warehouse.Created` | `InventoryService` | `{ warehouseId, supplierId, name }` |
| `Inventory.Warehouse.Updated` | `InventoryService` | `{ warehouseId }` |
| `Inventory.Warehouse.StatusChanged` | `InventoryService` | `{ warehouseId, from, to }` |
| `Inventory.Stock.Created` | `InventoryService` | `{ stockItemId, warehouseId, offeringId, availableQty }` |
| `Inventory.Stock.Updated` | `InventoryService` | `{ stockItemId }` |
| `Inventory.Stock.Adjusted` | `InventoryService` | `{ stockItemId, quantity, reason }` |
| `Inventory.Stock.TransferInitiated` | `InventoryService` | `{ offeringId, fromWarehouseId, toWarehouseId, quantity }` |
| `Inventory.Stock.TransferCompleted` | `InventoryService` | `{ offeringId, fromWarehouseId, toWarehouseId, quantity }` |
| `Inventory.Stock.Released` | `InventoryService` | `{ stockItemId, quantity, referenceId }` |
| `Inventory.Transaction.Created` | `InventoryService` | `{ transactionId, stockItemId, type, quantity }` |
| `Inventory.Import.Created` | `InventoryService` | `{ importId, supplierId, fileName }` |
| `Inventory.Import.Completed` | `InventoryService` | `{ importId, status, successRows, errorRows }` |
| `Inventory.Import.Failed` | `InventoryService` | `{ importId }` |
| `Inventory.Stock.LowStockAlert` | `InventoryService` | `{ stockItemId, availableQty, reorderPoint }` |
| `Inventory.Stock.ExpiryAlert` | `InventoryService` | `{ stockItemId, expiryDate }` (reserved) |

### Marketplace Domain (Sprint 5.4)

| Event | Publisher | Payload |
|-------|-----------|---------|
| `Marketplace.Product.Search` | `MarketplaceService` | `{ query, results }` |
| `Marketplace.Compare.Executed` | `MarketplaceService` | `{ productIds, products }` |
| `Marketplace.Review.Submitted` | `MarketplaceService` | `{ reviewId, productId?, supplierId?, organizationId, rating }` |
| `Marketplace.Review.Updated` | `MarketplaceService` | `{ reviewId, organizationId }` |
| `Marketplace.Review.Deleted` | `MarketplaceService` | `{ reviewId, organizationId }` |
| `Marketplace.Favorite.ProductAdded` | `MarketplaceService` | `{ organizationId, productId }` |
| `Marketplace.Favorite.ProductRemoved` | `MarketplaceService` | `{ organizationId, productId }` |
| `Marketplace.Favorite.SupplierAdded` | `MarketplaceService` | `{ organizationId, supplierId }` |
| `Marketplace.Favorite.SupplierRemoved` | `MarketplaceService` | `{ organizationId, supplierId }` |
| `Marketplace.RFQ.Initiated` | `MarketplaceService` | `{ rfqId, productId, referenceNumber, organizationId, itemsCount, supplierCount }` |
| `Marketplace.Supplier.Match` | `MarketplaceService` | `{ productId, suppliers }` (foundation for AI matching) |

---

## Event Metadata Structure

Every event carries the following metadata:

```typescript
{
  timestamp: Date;
  correlationId: string;
  source: string;      // e.g., 'procurement', 'quality', 'core'
  requestId?: string;
  userId?: string;
  orgId?: string;
}
```

## Event Envelope

```typescript
interface IEvent {
  name: string;          // e.g., 'Procurement.PO.Issued'
  version: number;       // currently always 1
  payload: unknown;      // domain-specific (see above)
  metadata: { ... };     // see above
}
```
