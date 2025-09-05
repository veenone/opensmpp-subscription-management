/**
 * Subscription Sync Service
 * Handles synchronization between etc/subscriptions.properties and database
 */

import { SubscriptionSource, SyncStatus } from '../types/subscription';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082';

export interface SyncStatusResponse {
  status: 'IDLE' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  lastSyncTime?: string;
  syncedCount: number;
  conflictCount: number;
  message?: string;
}

export interface SyncConflict {
  msisdn: string;
  fileData: {
    impi: string;
    impu: string;
    status: string;
  };
  databaseData: {
    impi: string;
    impu: string;
    status: string;
  };
  detectedAt: string;
}

export interface SyncTriggerRequest {
  forceOverwrite?: boolean;
  resolveConflicts?: 'KEEP_FILE' | 'KEEP_DATABASE' | 'MANUAL';
}

export interface ConflictResolution {
  msisdn: string;
  resolution: 'USE_FILE' | 'USE_DATABASE' | 'MERGE';
  mergedData?: {
    impi: string;
    impu: string;
    status: string;
  };
}

class SubscriptionSyncService {
  private authToken: string | null = null;

  constructor() {
    this.authToken = localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
    };
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatusResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/sync/status`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get sync status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  }

  /**
   * Trigger manual synchronization
   */
  async triggerSync(request?: SyncTriggerRequest): Promise<SyncStatusResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/sync/trigger`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request || {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger sync: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering sync:', error);
      throw error;
    }
  }

  /**
   * Get sync conflicts
   */
  async getConflicts(): Promise<SyncConflict[]> {
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/sync/conflicts`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get conflicts: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      throw error;
    }
  }

  /**
   * Resolve sync conflicts
   */
  async resolveConflicts(resolutions: ConflictResolution[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/sync/resolve`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ resolutions }),
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve conflicts: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      throw error;
    }
  }

  /**
   * Get subscription source information
   */
  async getSubscriptionSource(msisdn: string): Promise<{
    source: SubscriptionSource;
    fileData?: any;
    databaseData?: any;
    lastSyncTime?: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE}/api/subscriptions/source/${encodeURIComponent(msisdn)}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get subscription source: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription source:', error);
      throw error;
    }
  }

  /**
   * Subscribe to sync status updates via WebSocket
   */
  subscribeSyncUpdates(onUpdate: (status: SyncStatusResponse) => void): () => void {
    const ws = new WebSocket(
      `${API_BASE.replace('http', 'ws')}/ws/subscriptions/sync`
    );

    ws.onmessage = (event) => {
      try {
        const status = JSON.parse(event.data);
        onUpdate(status);
      } catch (error) {
        console.error('Error parsing sync update:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Return cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit: number = 10): Promise<Array<{
    id: string;
    timestamp: string;
    status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
    syncedCount: number;
    conflictCount: number;
    errorCount: number;
    duration: number;
  }>> {
    try {
      const response = await fetch(
        `${API_BASE}/api/subscriptions/sync/history?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get sync history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sync history:', error);
      throw error;
    }
  }

  /**
   * Export subscriptions to properties file format
   */
  async exportToPropertiesFormat(): Promise<string> {
    try {
      const response = await fetch(
        `${API_BASE}/api/subscriptions/export/properties`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to export subscriptions: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      throw error;
    }
  }

  /**
   * Import subscriptions from properties format
   */
  async importFromPropertiesFormat(content: string): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const response = await fetch(
        `${API_BASE}/api/subscriptions/import/properties`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to import subscriptions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error importing subscriptions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const subscriptionSyncService = new SubscriptionSyncService();

// Export types for use in components
export type { SubscriptionSyncService };