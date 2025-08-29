import { apiClient } from './apiClient';

export interface Subscription {
  id: number;
  msisdn: string;
  impi: string;
  impu: string;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export interface SubscriptionRequest {
  msisdn: string;
  impi: string;
  impu: string;
  status?: SubscriptionStatus;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SearchCriteria {
  msisdn?: string;
  impi?: string;
  impu?: string;
  status?: SubscriptionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface BulkImportRequest {
  subscriptions: SubscriptionRequest[];
  batchSize: number;
  skipDuplicates: boolean;
  validateOnly?: boolean;
}

export interface BulkImportResponse {
  totalProcessed: number;
  successfulImports: number;
  failedImports: number;
  skippedDuplicates: number;
  errors: BulkImportError[];
  processingTimeMs: number;
}

export interface BulkImportError {
  lineNumber: number;
  msisdn: string;
  errorMessage: string;
  errorCode: string;
}

export interface SubscriptionStatistics {
  total: number;
  active: number;
  suspended: number;
  terminated: number;
}

class SubscriptionService {
  private readonly basePath = '/subscriptions';

  // Get all subscriptions with pagination
  async getSubscriptions(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<PagedResponse<Subscription>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    };
    
    return apiClient.get(`${this.basePath}`, { params });
  }

  // Get subscription by ID
  async getSubscriptionById(id: number): Promise<Subscription> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  // Get subscription by MSISDN
  async getSubscriptionByMsisdn(msisdn: string): Promise<Subscription> {
    return apiClient.get(`${this.basePath}/msisdn/${encodeURIComponent(msisdn)}`);
  }

  // Create new subscription
  async createSubscription(subscription: SubscriptionRequest): Promise<Subscription> {
    return apiClient.post(`${this.basePath}`, subscription);
  }

  // Update subscription
  async updateSubscription(id: number, subscription: SubscriptionRequest): Promise<Subscription> {
    return apiClient.put(`${this.basePath}/${id}`, subscription);
  }

  // Delete subscription
  async deleteSubscription(id: number): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  // Advanced search
  async searchSubscriptions(criteria: SearchCriteria): Promise<PagedResponse<Subscription>> {
    return apiClient.post(`${this.basePath}/search`, criteria);
  }

  // Bulk import
  async bulkImportSubscriptions(request: BulkImportRequest): Promise<BulkImportResponse> {
    return apiClient.post(`${this.basePath}/bulk-import`, request);
  }

  // Export subscriptions to CSV
  async exportToCsv(status?: SubscriptionStatus, msisdnPattern?: string): Promise<void> {
    const params: any = {};
    if (status) params.status = status;
    if (msisdnPattern) params.msisdnPattern = msisdnPattern;

    return apiClient.downloadFile(`${this.basePath}/export`, 'subscriptions.csv');
  }

  // Export subscriptions to JSON
  async exportToJson(status?: SubscriptionStatus, msisdnPattern?: string): Promise<Subscription[]> {
    const params: any = {};
    if (status) params.status = status;
    if (msisdnPattern) params.msisdnPattern = msisdnPattern;

    return apiClient.get(`${this.basePath}/export/json`, { params });
  }

  // Get subscription statistics
  async getStatistics(): Promise<SubscriptionStatistics> {
    return apiClient.get(`${this.basePath}/statistics`);
  }

  // Validate MSISDN format
  validateMsisdn(msisdn: string): boolean {
    // E.164 format validation: + followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(msisdn);
  }

  // Format MSISDN to E.164
  formatMsisdn(msisdn: string): string {
    // Remove all non-digit characters except +
    const cleaned = msisdn.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  }

  // Validate IMPI format
  validateImpi(impi: string): boolean {
    // Basic email-like format validation for IMPI
    const impiRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return impiRegex.test(impi);
  }

  // Validate IMPU format
  validateImpu(impu: string): boolean {
    // SIP URI format validation for IMPU
    const impuRegex = /^sip:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return impuRegex.test(impu);
  }

  // Generate IMPI from MSISDN
  generateImpi(msisdn: string, domain: string = 'example.com'): string {
    const cleanMsisdn = msisdn.replace(/^\+/, '');
    return `${cleanMsisdn}@${domain}`;
  }

  // Generate IMPU from MSISDN
  generateImpu(msisdn: string, domain: string = 'example.com'): string {
    const cleanMsisdn = msisdn.replace(/^\+/, '');
    return `sip:${cleanMsisdn}@${domain}`;
  }
}

export const subscriptionApi = new SubscriptionService();
export default subscriptionApi;