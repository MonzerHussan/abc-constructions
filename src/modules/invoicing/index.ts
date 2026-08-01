import { InvoicingService } from '@/modules/invoicing/services/InvoicingService';

export const invoicingService = new InvoicingService();

export { InvoicingService } from '@/modules/invoicing/services/InvoicingService';
export { InvoiceStateMachine, getAllowedInvoiceTransitions, canTransitionInvoice } from '@/modules/invoicing/workflow/state-machines/InvoiceStateMachine';
export type { InvoiceStatusType, InvoiceTransition } from '@/modules/invoicing/workflow/state-machines/InvoiceStateMachine';
export { InvoiceEvents } from '@/modules/invoicing/events';
export type { CreateInvoiceInput, UpdateInvoiceInput, InvoiceListQuery, RejectInvoiceInput, MatchInvoiceInput } from '@/modules/invoicing/validators/invoice-schemas';
export { createInvoiceSchema, updateInvoiceSchema, invoiceListQuerySchema, rejectInvoiceSchema, matchInvoiceSchema } from '@/modules/invoicing/validators/invoice-schemas';
export type { InvoiceDTO, InvoiceItemDTO, InvoiceMatchDTO } from '@/modules/invoicing/dto/invoice-dto';