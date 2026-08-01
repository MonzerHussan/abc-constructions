export interface WorkflowContext {
  entityId: string;
  entityType?: string;
  userId: string;
  actorRole?: string;
  reason?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
