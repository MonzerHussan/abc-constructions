export interface LeadWithRelations {
  id: string
  organizationId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  jobTitle: string | null
  source: string
  status: string
  score: number
  tags: string[]
  notes: string | null
  convertedToContactId: string | null
  assignedToId: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
  assignedTo?: { id: string; name: string | null; email: string | null } | null
  createdBy?: { id: string; name: string | null; email: string | null }
}

export interface ContactWithRelations {
  id: string
  organizationId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  jobTitle: string | null
  company: string | null
  linkedUserId: string | null
  ownerId: string | null
  source: string
  tags: string[]
  notes: string | null
  avatar: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  owner?: { id: string; name: string | null; email: string | null } | null
  linkedUser?: { id: string; name: string | null; email: string | null } | null
}

export interface OpportunityWithRelations {
  id: string
  organizationId: string
  name: string
  amount: number
  currency: string
  stage: string
  probability: number
  expectedCloseDate: Date | null
  actualCloseDate: Date | null
  source: string
  notes: string | null
  tags: string[]
  leadId: string | null
  contactId: string | null
  companyName: string | null
  ownerId: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
  owner?: { id: string; name: string | null; email: string | null } | null
  createdBy?: { id: string; name: string | null; email: string | null }
}

export interface ActivityWithRelations {
  id: string
  organizationId: string
  type: string
  subject: string
  description: string | null
  outcome: string | null
  scheduledAt: Date | null
  completedAt: Date | null
  durationMinutes: number | null
  assignedToId: string | null
  createdById: string
  leadId: string | null
  contactId: string | null
  opportunityId: string | null
  createdAt: Date
  updatedAt: Date
  assignedTo?: { id: string; name: string | null; email: string | null } | null
  createdBy?: { id: string; name: string | null; email: string | null }
}

export interface CreateLeadInput {
  firstName: string
  lastName: string
  organizationId: string
  email?: string
  phone?: string
  company?: string
  jobTitle?: string
  source?: string
  status?: string
  score?: number
  tags?: string[]
  notes?: string
  assignedToId?: string
}

export interface UpdateLeadInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  jobTitle?: string
  source?: string
  status?: string
  score?: number
  tags?: string[]
  notes?: string
  assignedToId?: string
}
