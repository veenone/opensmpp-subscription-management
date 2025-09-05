/**
 * React Hook for Subscription Synchronization
 * Provides sync status, operations, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  subscriptionSyncService,
  SyncStatusResponse,
  SyncConflict,
  SyncTriggerRequest,
  ConflictResolution,
} from '../services/subscriptionSyncService';

export interface UseSubscriptionSyncOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableWebSocket?: boolean;
}

export function useSubscriptionSync(options: UseSubscriptionSyncOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableWebSocket = true,
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Query for sync status
  const {
    data: syncStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery<SyncStatusResponse>(
    'syncStatus',
    () => subscriptionSyncService.getSyncStatus(),
    {
      enabled: autoRefresh,
      refetchInterval: refreshInterval,
      onSuccess: (data) => {
        // Update subscriptions list if sync completed
        if (data.status === 'COMPLETED') {
          queryClient.invalidateQueries('subscriptions');
        }
      },
    }
  );

  // Query for conflicts
  const {
    data: conflicts,
    isLoading: isLoadingConflicts,
    error: conflictsError,
    refetch: refetchConflicts,
  } = useQuery<SyncConflict[]>(
    'syncConflicts',
    () => subscriptionSyncService.getConflicts(),
    {
      enabled: (syncStatus?.conflictCount ?? 0) > 0,
    }
  );

  // Mutation for triggering sync
  const triggerSyncMutation = useMutation<
    SyncStatusResponse,
    Error,
    SyncTriggerRequest | undefined
  >(
    (request) => subscriptionSyncService.triggerSync(request),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('syncStatus', data);
        if (data.status === 'COMPLETED') {
          queryClient.invalidateQueries('subscriptions');
          queryClient.invalidateQueries('syncConflicts');
        }
      },
      onError: (error) => {
        console.error('Failed to trigger sync:', error);
      },
    }
  );

  // Mutation for resolving conflicts
  const resolveConflictsMutation = useMutation<
    void,
    Error,
    ConflictResolution[]
  >(
    (resolutions) => subscriptionSyncService.resolveConflicts(resolutions),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('syncStatus');
        queryClient.invalidateQueries('syncConflicts');
        queryClient.invalidateQueries('subscriptions');
      },
      onError: (error) => {
        console.error('Failed to resolve conflicts:', error);
      },
    }
  );

  // WebSocket subscription for real-time updates
  useEffect(() => {
    if (!enableWebSocket) return;

    const unsubscribe = subscriptionSyncService.subscribeSyncUpdates(
      (status) => {
        queryClient.setQueryData('syncStatus', status);
        setIsConnected(true);
        
        if (status.status === 'COMPLETED') {
          queryClient.invalidateQueries('subscriptions');
          queryClient.invalidateQueries('syncConflicts');
        }
      }
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [enableWebSocket, queryClient]);

  // Trigger sync with options
  const triggerSync = useCallback(
    (options?: SyncTriggerRequest) => {
      return triggerSyncMutation.mutate(options);
    },
    [triggerSyncMutation]
  );

  // Resolve conflicts
  const resolveConflicts = useCallback(
    (resolutions: ConflictResolution[]) => {
      return resolveConflictsMutation.mutate(resolutions);
    },
    [resolveConflictsMutation]
  );

  // Resolve all conflicts with a strategy
  const resolveAllConflicts = useCallback(
    (strategy: 'USE_FILE' | 'USE_DATABASE') => {
      if (!conflicts) return;

      const resolutions: ConflictResolution[] = conflicts.map((conflict) => ({
        msisdn: conflict.msisdn,
        resolution: strategy,
      }));

      return resolveConflictsMutation.mutate(resolutions);
    },
    [conflicts, resolveConflictsMutation]
  );

  // Check if sync is in progress
  const isSyncing = syncStatus?.status === 'SYNCING';

  // Check if there are conflicts
  const hasConflicts = (syncStatus?.conflictCount ?? 0) > 0;

  // Calculate sync progress percentage
  const syncProgress = useCallback(() => {
    if (!syncStatus || syncStatus.status !== 'SYNCING') return 0;
    // This would need backend support to provide progress
    return 50; // Placeholder
  }, [syncStatus]);

  return {
    // Status
    syncStatus,
    conflicts,
    isLoadingStatus,
    isLoadingConflicts,
    statusError,
    conflictsError,
    isConnected,
    isSyncing,
    hasConflicts,
    syncProgress: syncProgress(),

    // Operations
    triggerSync,
    resolveConflicts,
    resolveAllConflicts,
    refetchStatus,
    refetchConflicts,

    // Mutations state
    isTriggeringSync: triggerSyncMutation.isLoading,
    isResolvingConflicts: resolveConflictsMutation.isLoading,
    triggerSyncError: triggerSyncMutation.error,
    resolveConflictsError: resolveConflictsMutation.error,
  };
}

// Hook for subscription source information
export function useSubscriptionSource(msisdn: string) {
  return useQuery(
    ['subscriptionSource', msisdn],
    () => subscriptionSyncService.getSubscriptionSource(msisdn),
    {
      enabled: !!msisdn,
      staleTime: 30000, // Cache for 30 seconds
    }
  );
}

// Hook for sync history
export function useSyncHistory(limit: number = 10) {
  return useQuery(
    ['syncHistory', limit],
    () => subscriptionSyncService.getSyncHistory(limit),
    {
      staleTime: 60000, // Cache for 1 minute
    }
  );
}