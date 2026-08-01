export { FinancialTrustService } from '@/modules/financial/services/FinancialTrustService';

export {
  createReservationSchema,
  holdReservationSchema,
  releaseFundsSchema,
  refundFundsSchema,
  cancelReservationSchema,
  reservationListQuerySchema,
} from '@/modules/financial/validators/financial-schemas';

export type {
  CreateReservationInput,
  HoldReservationInput,
  ReleaseFundsInput,
  RefundFundsInput,
  CancelReservationInput,
  ReservationListQuery,
} from '@/modules/financial/validators/financial-schemas';

export type {
  PaymentReleaseDTO,
  ReservationSummaryDTO,
  ReservationDetailDTO,
} from '@/modules/financial/dto/financial-dto';

export { FinancialTrustStateMachine, getAllowedPaymentTransitions, canTransitionPayment } from '@/modules/financial/workflow/state-machines/FinancialTrustStateMachine';
export type { PaymentStatus, PaymentTransition } from '@/modules/financial/workflow/state-machines/FinancialTrustStateMachine';

import { FinancialTrustService } from '@/modules/financial/services/FinancialTrustService';

export const financialTrustService = new FinancialTrustService();
