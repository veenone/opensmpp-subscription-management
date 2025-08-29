/**
 * Subscription Management Types
 * TypeScript interfaces for SMPP subscription data models
 */

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';

export interface Subscription {
  id: string;
  msisdn: string;
  impu: string;
  impi: string;
  status: SubscriptionStatus;
  displayName?: string;
  email?: string;
  
  // Configuration
  maxSessions?: number;
  allowRoaming?: boolean;
  serviceProfile?: string;
  
  // Security
  encryptionEnabled?: boolean;
  
  // Custom attributes
  customAttributes?: Record<string, string>;
  
  // Usage statistics
  messageCount?: number;
  lastActivity?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

export interface CreateSubscriptionRequest {
  msisdn: string;
  impu: string;
  impi: string;
  status?: SubscriptionStatus;
  displayName?: string;
  email?: string;
  
  // Configuration
  maxSessions?: number;
  allowRoaming?: boolean;
  serviceProfile?: string;
  
  // Security
  authPassword: string; // Required for new subscriptions
  encryptionEnabled?: boolean;
  
  // Custom attributes
  customAttributes?: Record<string, string>;
}

export interface UpdateSubscriptionRequest {
  msisdn?: string;
  impu?: string;
  impi?: string;
  status?: SubscriptionStatus;
  displayName?: string;
  email?: string;
  
  // Configuration
  maxSessions?: number;
  allowRoaming?: boolean;
  serviceProfile?: string;
  
  // Security
  authPassword?: string; // Optional for updates
  encryptionEnabled?: boolean;
  
  // Custom attributes
  customAttributes?: Record<string, string>;
}

export interface SubscriptionSearchParams {
  search?: string;
  status?: SubscriptionStatus | 'all';
  page?: number;
  size?: number;
  sort?: string;
  createdAfter?: string;
  createdBefore?: string;
  hasCustomAttributes?: boolean;
  encryptionEnabled?: boolean;
  allowRoaming?: boolean;
  serviceProfile?: string;
}

export interface SubscriptionResponse {
  content: Subscription[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface SubscriptionActivity {
  id: string;
  subscriptionId: string;
  timestamp: string;
  eventType: 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED' | 'MESSAGE_SENT' | 'MESSAGE_RECEIVED' | 'LOGIN' | 'LOGOUT' | 'REGISTRATION' | 'DEREGISTRATION';
  description: string;
  details?: Record<string, any>;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SubscriptionUsageStats {
  subscriptionId: string;
  totalMessages: number;
  messagesThisMonth: number;
  messagesThisWeek: number;
  messagesToday: number;
  lastMessageTime?: string;
  averageMessagesPerDay: number;
  peakMessagesPerHour: number;
  uptimePercentage: number;
  lastRegistrationTime?: string;
  registrationCount: number;
}

export interface SubscriptionBulkOperation {
  operation: 'UPDATE_STATUS' | 'DELETE' | 'EXPORT' | 'BULK_UPDATE';
  subscriptionIds: string[];
  parameters?: Record<string, any>;
}

export interface SubscriptionBulkResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{
    subscriptionId: string;
    error: string;
  }>;
}

export interface SubscriptionValidationError {
  field: string;
  message: string;
  code: string;
  rejectedValue?: any;
}

export interface SubscriptionImportData {
  msisdn: string;
  impu?: string;
  impi?: string;
  status?: SubscriptionStatus;
  displayName?: string;
  email?: string;
  maxSessions?: number;
  allowRoaming?: boolean;
  serviceProfile?: string;
  authPassword?: string;
  encryptionEnabled?: boolean;
  customAttributes?: Record<string, string>;
}

export interface SubscriptionImportResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{
    row: number;
    msisdn?: string;
    errors: SubscriptionValidationError[];
  }>;
  warnings?: Array<{
    row: number;
    msisdn?: string;
    message: string;
  }>;
}

export interface SubscriptionExportOptions {
  format: 'CSV' | 'JSON' | 'XML' | 'XLSX';
  includeInactive?: boolean;
  includeCustomAttributes?: boolean;
  includeUsageStats?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  fields?: string[];
}

// Form validation schemas
export interface SubscriptionFormData {
  msisdn: string;
  impu: string;
  impi: string;
  status: SubscriptionStatus;
  displayName: string;
  email: string;
  maxSessions: number;
  allowRoaming: boolean;
  serviceProfile: string;
  authPassword: string;
  encryptionEnabled: boolean;
  customAttributes: Record<string, string>;
}

export interface SubscriptionFormErrors {
  msisdn?: string;
  impu?: string;
  impi?: string;
  status?: string;
  displayName?: string;
  email?: string;
  maxSessions?: string;
  allowRoaming?: string;
  serviceProfile?: string;
  authPassword?: string;
  encryptionEnabled?: string;
  customAttributes?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: SubscriptionValidationError[];
  timestamp: string;
}

// WebSocket message types for real-time updates
export interface SubscriptionWebSocketMessage {
  type: 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED' | 'SUBSCRIPTION_DELETED' | 'SUBSCRIPTION_STATUS_CHANGED' | 'SUBSCRIPTION_ACTIVITY';
  subscriptionId: string;
  data: any;
  timestamp: string;
  userId?: string;
}

// Audit trail
export interface SubscriptionAuditLog {
  id: string;
  subscriptionId: string;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
}

// Service profiles
export interface ServiceProfile {
  id: string;
  name: string;
  description?: string;
  maxSessions: number;
  allowRoaming: boolean;
  qosProfile?: string;
  features: string[];
  restrictions?: string[];
  isDefault: boolean;
  isActive: boolean;
}

export default Subscription;