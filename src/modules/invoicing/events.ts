import { buildEventName } from '@/modules/shared/events/types';

export const InvoiceEvents = {
  Created: buildEventName('Invoicing', 'Invoice', 'Created'),
  Submitted: buildEventName('Invoicing', 'Invoice', 'Submitted'),
  Verified: buildEventName('Invoicing', 'Invoice', 'Verified'),
  Matched: buildEventName('Invoicing', 'Invoice', 'Matched'),
  PartiallyMatched: buildEventName('Invoicing', 'Invoice', 'PartiallyMatched'),
  Approved: buildEventName('Invoicing', 'Invoice', 'Approved'),
  Authorized: buildEventName('Invoicing', 'Invoice', 'Authorized'),
  Rejected: buildEventName('Invoicing', 'Invoice', 'Rejected'),
  Cancelled: buildEventName('Invoicing', 'Invoice', 'Cancelled'),
  MatchCreated: buildEventName('Invoicing', 'InvoiceMatch', 'Created'),
  MatchUpdated: buildEventName('Invoicing', 'InvoiceMatch', 'Updated'),
} as const;