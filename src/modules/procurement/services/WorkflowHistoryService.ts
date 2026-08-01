import type {
  WorkflowHistoryEntry,
  WorkflowHistoryRecorder,
  WorkflowHistoryResult,
} from '@/modules/shared/workflow/WorkflowHistoryRecorder';
import { InMemoryWorkflowHistoryRecorder } from '@/modules/shared/workflow/WorkflowHistoryRecorder';

export interface RecordTransitionInput {
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
}

export interface WorkflowHistoryQuery {
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}

export class WorkflowHistoryService {
  private recorder: WorkflowHistoryRecorder;

  constructor(recorder?: WorkflowHistoryRecorder) {
    this.recorder = recorder ?? new InMemoryWorkflowHistoryRecorder();
  }

  getRecorder(): WorkflowHistoryRecorder {
    return this.recorder;
  }

  async record(input: RecordTransitionInput): Promise<WorkflowHistoryEntry> {
    return this.recorder.record(input);
  }

  async list(query: WorkflowHistoryQuery = {}): Promise<{ items: WorkflowHistoryEntry[]; total: number; page: number; limit: number }> {
    const all = await this.recorder.list();

    let filtered = all;
    if (query.entityType && query.entityId) {
      filtered = all.filter((e) => e.entityType === query.entityType && e.entityId === query.entityId);
    } else if (query.entityType) {
      filtered = all.filter((e) => e.entityType === query.entityType);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }

  async listByEntity(entityType: string, entityId: string): Promise<WorkflowHistoryEntry[]> {
    return this.recorder.listByEntity(entityType, entityId);
  }
}
