import React, { useState, useCallback } from 'react';
import {
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from '@mui/material';

import { Subscription } from '../types/subscription';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionList from '../components/subscription/SubscriptionList';
import { SubscriptionForm } from '../components/subscription/SubscriptionForm';
import SubscriptionDetails from '../components/subscription/SubscriptionDetails';
import SubscriptionFilters, { FilterOptions } from '../components/subscription/SubscriptionFilters';
import { apiClient } from '../services/apiClient';
import { 
  HeadlineMedium
} from '../theme/typography';
import { 
  AccessibleButton
} from '../theme/accessibility';
import { 
  ResponsiveFlex,
  ResponsiveContainer,
  useBreakpoint 
} from '../theme/responsive';
import { FloatingCard } from '../theme/elevation';

interface SnackbarMessage {
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const SubscriptionManagement: React.FC = () => {
  const { hasPermission } = useAuth();

  // State management
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    dateRange: { start: '', end: '' },
    messageCountRange: [0, 10000],
    hasCustomAttributes: false,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);

  // Modal states
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    subscription?: Subscription;
  }>({ open: false, mode: 'create' });

  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    subscription?: Subscription;
  }>({ open: false });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    subscription?: Subscription;
  }>({ open: false });

  // Mock data for statistics (would come from API)
  const [stats] = useState({
    total: 1247,
    active: 987,
    inactive: 156,
    suspended: 89,
    expired: 15,
  });

  // Handlers
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleAddSubscription = () => {
    if (!hasPermission('subscription:create')) {
      setSnackbar({
        message: 'You do not have permission to create subscriptions.',
        severity: 'error',
      });
      return;
    }

    setFormModal({ open: true, mode: 'create' });
  };

  const handleEditSubscription = (subscription: Subscription) => {
    if (!hasPermission('subscription:update')) {
      setSnackbar({
        message: 'You do not have permission to edit subscriptions.',
        severity: 'error',
      });
      return;
    }

    setFormModal({ open: true, mode: 'edit', subscription });
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setDetailsModal({ open: true, subscription });
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    if (!hasPermission('subscription:delete')) {
      setSnackbar({
        message: 'You do not have permission to delete subscriptions.',
        severity: 'error',
      });
      return;
    }

    setDeleteDialog({ open: true, subscription });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.subscription) return;

    try {
      await apiClient.delete(`/api/subscriptions/${deleteDialog.subscription.id}`);
      
      setSnackbar({
        message: `Subscription ${deleteDialog.subscription.msisdn} deleted successfully.`,
        severity: 'success',
      });
      
      setRefreshTrigger(prev => prev + 1);
      setDeleteDialog({ open: false });
    } catch (error) {
      setSnackbar({
        message: 'Failed to delete subscription. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleFormSuccess = () => {
    setSnackbar({
      message: `Subscription ${formModal.mode === 'create' ? 'created' : 'updated'} successfully.`,
      severity: 'success',
    });
    
    setRefreshTrigger(prev => prev + 1);
    setFormModal({ open: false, mode: 'create' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const filteredCount = React.useMemo(() => {
    // This would be calculated based on actual filtering logic
    // For now, return mock filtered count based on filters
    let count = stats.total;
    
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'ACTIVE':
          count = stats.active;
          break;
        case 'INACTIVE':
          count = stats.inactive;
          break;
        case 'SUSPENDED':
          count = stats.suspended;
          break;
        case 'EXPIRED':
          count = stats.expired;
          break;
      }
    }
    
    if (filters.search) {
      count = Math.floor(count * 0.7); // Simulate search filtering
    }
    
    return count;
  }, [filters, stats]);

  return (
    <ResponsiveContainer maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <HeadlineMedium gutterBottom>
            Subscription Management
          </HeadlineMedium>
          
          {/* Statistics Cards */}
          <ResponsiveFlex 
            gap={{ xs: 2, sm: 2 }} 
            sx={{ mt: 3 }}
            wrap={{ xs: 'wrap', sm: 'wrap' }}
            justify={{ xs: 'center', sm: 'flex-start' }}
          >
            <FloatingCard floating sx={{ minWidth: '120px', textAlign: 'center' }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ fontSize: '24px', fontWeight: 600, color: 'primary.main' }}>
                  {stats.total.toLocaleString()}
                </Box>
                <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  Total
                </Box>
              </Box>
            </FloatingCard>

            <FloatingCard floating sx={{ minWidth: '120px', textAlign: 'center' }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ fontSize: '24px', fontWeight: 600, color: 'success.main' }}>
                  {stats.active.toLocaleString()}
                </Box>
                <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  Active
                </Box>
              </Box>
            </FloatingCard>

            <FloatingCard floating sx={{ minWidth: '120px', textAlign: 'center' }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ fontSize: '24px', fontWeight: 600, color: 'text.secondary' }}>
                  {stats.inactive.toLocaleString()}
                </Box>
                <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  Inactive
                </Box>
              </Box>
            </FloatingCard>

            <FloatingCard floating sx={{ minWidth: '120px', textAlign: 'center' }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ fontSize: '24px', fontWeight: 600, color: 'warning.main' }}>
                  {stats.suspended.toLocaleString()}
                </Box>
                <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  Suspended
                </Box>
              </Box>
            </FloatingCard>

            <FloatingCard floating sx={{ minWidth: '120px', textAlign: 'center' }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ fontSize: '24px', fontWeight: 600, color: 'error.main' }}>
                  {stats.expired.toLocaleString()}
                </Box>
                <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  Expired
                </Box>
              </Box>
            </FloatingCard>
          </ResponsiveFlex>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <SubscriptionFilters
            onFiltersChange={handleFiltersChange}
            totalCount={stats.total}
            filteredCount={filteredCount}
          />
        </Box>

        {/* Subscription List */}
        <SubscriptionList
          onEdit={handleEditSubscription}
          onView={handleViewSubscription}
          onDelete={handleDeleteSubscription}
          onAdd={handleAddSubscription}
          searchQuery={filters.search}
          statusFilter={filters.status}
          refreshTrigger={refreshTrigger}
        />

        {/* Form Modal */}
        <SubscriptionForm
          open={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'create' })}
          onSuccess={handleFormSuccess}
          subscription={formModal.subscription}
          mode={formModal.mode}
        />

        {/* Details Modal */}
        <SubscriptionDetails
          open={detailsModal.open}
          onClose={() => setDetailsModal({ open: false })}
          onEdit={handleEditSubscription}
          onDelete={handleDeleteSubscription}
          subscription={detailsModal.subscription}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the subscription for{' '}
              <strong>{deleteDialog.subscription?.msisdn}</strong>?
              <br />
              <br />
              This action cannot be undone and will permanently remove all associated data.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <AccessibleButton 
              onClick={() => setDeleteDialog({ open: false })}
              variant="outlined"
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              autoFocus
            >
              Delete Subscription
            </AccessibleButton>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={Boolean(snackbar)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar?.severity || 'info'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar?.message || ''}
          </Alert>
        </Snackbar>
      </Box>
    </ResponsiveContainer>
  );
};

export default SubscriptionManagement;