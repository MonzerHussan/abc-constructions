import { buildEventName } from '@/modules/shared/events/types';

export const SupplierNetworkEvents = {
  ProfileCreated: buildEventName('SupplierNetwork', 'Profile', 'Created'),
  ProfileUpdated: buildEventName('SupplierNetwork', 'Profile', 'Updated'),
  ProfileVerified: buildEventName('SupplierNetwork', 'Profile', 'Verified'),
  DocumentUploaded: buildEventName('SupplierNetwork', 'Document', 'Uploaded'),
  DocumentVerified: buildEventName('SupplierNetwork', 'Document', 'Verified'),
  DocumentRejected: buildEventName('SupplierNetwork', 'Document', 'Rejected'),
  DocumentExpired: buildEventName('SupplierNetwork', 'Document', 'Expired'),
  CertificationAdded: buildEventName('SupplierNetwork', 'Certification', 'Added'),
  CapabilityAdded: buildEventName('SupplierNetwork', 'Capability', 'Added'),
  CapabilityUpdated: buildEventName('SupplierNetwork', 'Capability', 'Updated'),
  RelationshipCreated: buildEventName('SupplierNetwork', 'Relationship', 'Created'),
  RelationshipUpdated: buildEventName('SupplierNetwork', 'Relationship', 'Updated'),
  RatingCreated: buildEventName('SupplierNetwork', 'Rating', 'Created'),
} as const;
