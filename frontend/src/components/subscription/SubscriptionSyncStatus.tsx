/**
 * Subscription Sync Status Component
 * Displays current synchronization status and controls
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  WifiTethering as WifiTetheringIcon,
  WifiTetheringOff as WifiTetheringOffIcon,
} from '@mui/icons-material';
import { useSubscriptionSync } from '../../hooks/useSubscriptionSync';
import { format } from 'date-fns';

export const SubscriptionSyncStatus: React.FC = () => {
  const {
    syncStatus,
    isSyncing,
    hasConflicts,
    syncProgress,
    isConnected,
    triggerSync,
    refetchStatus,
    isTriggeringSync,
    triggerSyncError,
  } = useSubscriptionSync();

  const getStatusIcon = () => {
    if (!syncStatus) return null;

    switch (syncStatus.status) {
      case 'SYNCING':
        return <SyncIcon className="spinning" />;
      case 'COMPLETED':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
      default:
        return <AccessTimeIcon />;
    }
  };

  const getStatusColor = () => {
    if (!syncStatus) return 'default';

    switch (syncStatus.status) {
      case 'SYNCING':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatLastSyncTime = () => {
    if (!syncStatus?.lastSyncTime) return 'Never';
    
    try {
      return format(new Date(syncStatus.lastSyncTime), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            Subscription Synchronization
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}>
              <IconButton size="small">
                {isConnected ? (
                  <WifiTetheringIcon color="success" />
                ) : (
                  <WifiTetheringOffIcon color="disabled" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Status">
              <IconButton onClick={() => refetchStatus()} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Status Display */}
        <Box mb={3}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            {getStatusIcon()}
            <Chip
              label={syncStatus?.status || 'Unknown'}
              color={getStatusColor() as any}
              variant="outlined"
              size="small"
            />
            {syncStatus?.message && (
              <Typography variant="body2" color="textSecondary">
                {syncStatus.message}
              </Typography>
            )}
          </Stack>

          {isSyncing && (
            <LinearProgress
              variant="determinate"
              value={syncProgress}
              sx={{ mb: 2 }}
            />
          )}

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Last Sync
              </Typography>
              <Typography variant="body1">
                {formatLastSyncTime()}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Synced Items
              </Typography>
              <Typography variant="body1">
                {syncStatus?.syncedCount || 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Conflicts
              </Typography>
              <Typography variant="body1" color={hasConflicts ? 'error' : 'inherit'}>
                {syncStatus?.conflictCount || 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={syncStatus?.status || 'Unknown'}
                size="small"
                color={getStatusColor() as any}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Sync Controls */}
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<SyncIcon />}
              onClick={() => triggerSync()}
              disabled={isSyncing || isTriggeringSync}
              size="small"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudDownloadIcon />}
              onClick={() => triggerSync({ forceOverwrite: true })}
              disabled={isSyncing || isTriggeringSync}
              size="small"
            >
              Force Sync from File
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => {
                // This would trigger an export to file
                console.log('Export to file');
              }}
              disabled={isSyncing}
              size="small"
            >
              Export to File
            </Button>
          </Stack>

          {hasConflicts && (
            <Chip
              icon={<WarningIcon />}
              label={`${syncStatus?.conflictCount} Conflicts`}
              color="warning"
              variant="filled"
            />
          )}
        </Stack>

        {/* Error Alert */}
        {triggerSyncError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {triggerSyncError.message || 'Failed to trigger synchronization'}
          </Alert>
        )}

        {/* Conflict Alert */}
        {hasConflicts && !isSyncing && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            There are {syncStatus?.conflictCount} conflicts between the file and database.
            Please resolve them to ensure data consistency.
          </Alert>
        )}

        {/* Success Alert */}
        {syncStatus?.status === 'COMPLETED' && !hasConflicts && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Synchronization completed successfully. {syncStatus.syncedCount} items synced.
          </Alert>
        )}
      </CardContent>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinning {
            animation: spin 2s linear infinite;
          }
        `}
      </style>
    </Card>
  );
};