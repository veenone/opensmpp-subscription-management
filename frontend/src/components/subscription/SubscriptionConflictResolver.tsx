/**
 * Subscription Conflict Resolver Component
 * Allows users to resolve synchronization conflicts between file and database
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Box,
  Chip,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  CompareArrows as CompareArrowsIcon,
  Description as FileIcon,
  Storage as DatabaseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Merge as MergeIcon,
} from '@mui/icons-material';
import { useSubscriptionSync } from '../../hooks/useSubscriptionSync';
import { ConflictResolution } from '../../services/subscriptionSyncService';

interface SubscriptionConflictResolverProps {
  open: boolean;
  onClose: () => void;
}

export const SubscriptionConflictResolver: React.FC<SubscriptionConflictResolverProps> = ({
  open,
  onClose,
}) => {
  const {
    conflicts,
    resolveConflicts,
    resolveAllConflicts,
    isResolvingConflicts,
    resolveConflictsError,
  } = useSubscriptionSync();

  const [resolutions, setResolutions] = useState<Record<string, 'USE_FILE' | 'USE_DATABASE'>>({});
  const [bulkResolution, setBulkResolution] = useState<'USE_FILE' | 'USE_DATABASE' | 'MANUAL'>('MANUAL');

  const handleIndividualResolution = (msisdn: string, resolution: 'USE_FILE' | 'USE_DATABASE') => {
    setResolutions(prev => ({
      ...prev,
      [msisdn]: resolution,
    }));
  };

  const handleBulkResolution = () => {
    if (!conflicts) return;

    const newResolutions: Record<string, 'USE_FILE' | 'USE_DATABASE'> = {};
    conflicts.forEach(conflict => {
      newResolutions[conflict.msisdn] = bulkResolution as 'USE_FILE' | 'USE_DATABASE';
    });
    setResolutions(newResolutions);
  };

  const handleResolve = async () => {
    if (!conflicts) return;

    const conflictResolutions: ConflictResolution[] = conflicts
      .filter(conflict => resolutions[conflict.msisdn])
      .map(conflict => ({
        msisdn: conflict.msisdn,
        resolution: resolutions[conflict.msisdn],
      }));

    if (conflictResolutions.length === 0) {
      alert('Please select resolution for at least one conflict');
      return;
    }

    try {
      await resolveConflicts(conflictResolutions);
      onClose();
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
    }
  };

  const handleResolveAll = async (strategy: 'USE_FILE' | 'USE_DATABASE') => {
    try {
      await resolveAllConflicts(strategy);
      onClose();
    } catch (error) {
      console.error('Failed to resolve all conflicts:', error);
    }
  };

  if (!conflicts || conflicts.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>No Conflicts</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            There are no synchronization conflicts to resolve.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Resolve Synchronization Conflicts</Typography>
          <Chip
            label={`${conflicts.length} Conflicts`}
            color="warning"
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {resolveConflictsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {resolveConflictsError.message || 'Failed to resolve conflicts'}
          </Alert>
        )}

        {/* Bulk Resolution Options */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Bulk Resolution
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FileIcon />}
              onClick={() => handleResolveAll('USE_FILE')}
              disabled={isResolvingConflicts}
            >
              Use All from File
            </Button>
            <Button
              variant="outlined"
              startIcon={<DatabaseIcon />}
              onClick={() => handleResolveAll('USE_DATABASE')}
              disabled={isResolvingConflicts}
            >
              Use All from Database
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Individual Conflict Resolution */}
        <Typography variant="subtitle1" gutterBottom>
          Individual Resolution
        </Typography>

        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>MSISDN</TableCell>
                <TableCell align="center">File Data</TableCell>
                <TableCell align="center">Database Data</TableCell>
                <TableCell align="center">Resolution</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conflicts.map((conflict) => (
                <TableRow key={conflict.msisdn}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {conflict.msisdn}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        IMPI: {conflict.fileData.impi}
                      </Typography>
                      <Typography variant="caption" display="block">
                        IMPU: {conflict.fileData.impu}
                      </Typography>
                      <Chip
                        label={conflict.fileData.status}
                        size="small"
                        color={conflict.fileData.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        IMPI: {conflict.databaseData.impi}
                      </Typography>
                      <Typography variant="caption" display="block">
                        IMPU: {conflict.databaseData.impu}
                      </Typography>
                      <Chip
                        label={conflict.databaseData.status}
                        size="small"
                        color={conflict.databaseData.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center">
                    <FormControl>
                      <RadioGroup
                        row
                        value={resolutions[conflict.msisdn] || ''}
                        onChange={(e) => handleIndividualResolution(
                          conflict.msisdn,
                          e.target.value as 'USE_FILE' | 'USE_DATABASE'
                        )}
                      >
                        <Tooltip title="Use File Data">
                          <FormControlLabel
                            value="USE_FILE"
                            control={<Radio size="small" />}
                            label={<FileIcon fontSize="small" />}
                          />
                        </Tooltip>
                        <Tooltip title="Use Database Data">
                          <FormControlLabel
                            value="USE_DATABASE"
                            control={<Radio size="small" />}
                            label={<DatabaseIcon fontSize="small" />}
                          />
                        </Tooltip>
                      </RadioGroup>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Resolution Summary */}
        <Box mt={2}>
          <Alert severity="info">
            {Object.keys(resolutions).length} of {conflicts.length} conflicts have resolutions selected.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isResolvingConflicts}>
          Cancel
        </Button>
        <Button
          onClick={handleResolve}
          variant="contained"
          disabled={isResolvingConflicts || Object.keys(resolutions).length === 0}
          startIcon={<CheckCircleIcon />}
        >
          {isResolvingConflicts ? 'Resolving...' : 'Resolve Selected'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};