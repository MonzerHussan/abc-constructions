export type WorkflowHistoryResult = 'SUCCESS' | 'BLOCKED_BY_GUARD' | 'INVALID_TRANSITION' | 'ERROR';

export interface WorkflowHistoryEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  fromStatus: string;
  toStatus: string | null;
  result: WorkflowHistoryResult;
  guardName?: string;
  reason?: string;
  actorId?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface WorkflowHistoryRecorder {
  record(entry: Omit<WorkflowHistoryEntry, 'id' | 'createdAt'>): Promise<WorkflowHistoryEntry>;
  listByEntity(entityType: string, entityId: string): Promise<WorkflowHistoryEntry[]>;
  list(): Promise<WorkflowHistoryEntry[]>;
}

export class InMemoryWorkflowHistoryRecorder implements WorkflowHistoryRecorder {
  private entries: WorkflowHistoryEntry[] = [];

  async record(entry: Omit<WorkflowHistoryEntry, 'id' | 'createdAt'>): Promise<WorkflowHistoryEntry> {
    const stored: WorkflowHistoryEntry = {
      ...entry,
      id: `wh_${this.entries.length + 1}`,
      createdAt: new Date(),
    };
    this.entries.push(stored);
    return stored;
  }

  async listByEntity(entityType: string, entityId: string): Promise<WorkflowHistoryEntry[]> {
    return this.entries
      .filter((entry) => entry.entityType === entityType && entry.entityId === entityId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async list(): Promise<WorkflowHistoryEntry[]> {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}
