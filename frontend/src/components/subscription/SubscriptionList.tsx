import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as AddSubscriptionIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
} from '@mui/icons-material';

import { Subscription, SubscriptionStatus } from '../../types/subscription';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { StatusIndicator } from '../../theme/motion';
import { 
  TitleLarge, 
  BodyLarge, 
  MonospaceText,
  StatusText,
  DataText 
} from '../../theme/typography';
import { 
  AccessibleButton
} from '../../theme/accessibility';
import { 
  ResponsiveFlex,
  HideOn,
  ShowOn,
  useBreakpoint 
} from '../../theme/responsive';
import { FloatingCard, InteractiveElevationBox } from '../../theme/elevation';

interface SubscriptionListProps {
  onEdit?: (subscription: Subscription) => void;
  onView?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onAdd?: () => void;
  searchQuery?: string;
  statusFilter?: SubscriptionStatus | 'all';
  refreshTrigger?: number;
}

type SortField = keyof Subscription;
type SortOrder = 'asc' | 'desc';

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  onEdit,
  onView,
  onDelete,
  onAdd,
  searchQuery = '',
  statusFilter = 'all',
  refreshTrigger = 0,
}) => {
  const theme = useTheme();
  const { hasPermission } = useAuth();
  const breakpoint = useBreakpoint();

  // State management
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortField, setSortField] = useState<SortField>('msisdn');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; subscription: Subscription } | null>(null);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: rowsPerPage.toString(),
        sort: `${sortField},${sortOrder}`,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await apiClient.get<{ content: Subscription[]; totalElements: number }>(`/api/subscriptions?${params}`);
      setSubscriptions(response.data.content || []);
    } catch (err) {
      setError('Failed to load subscriptions. Please try again.');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortField, sortOrder, searchQuery, statusFilter]);

  // Effects
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions, refreshTrigger]);

  // Handlers
  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, subscription: Subscription) => {
    setMenuAnchor({ element: event.currentTarget, subscription });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action: 'view' | 'edit' | 'delete', subscription: Subscription) => {
    handleMenuClose();
    
    switch (action) {
      case 'view':
        onView?.(subscription);
        break;
      case 'edit':
        onEdit?.(subscription);
        break;
      case 'delete':
        onDelete?.(subscription);
        break;
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'online' as const;
      case 'INACTIVE':
        return 'offline' as const;
      case 'SUSPENDED':
        return 'warning' as const;
      case 'EXPIRED':
        return 'error' as const;
      default:
        return 'offline' as const;
    }
  };

  const formatLastActivity = (date?: string) => {
    if (!date) return 'Unknown';
    try {
      const activityDate = new Date(date);
      const now = new Date();
      const diffInHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  // Loading skeleton
  if (loading && subscriptions.length === 0) {
    return (
      <FloatingCard floating>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width="200px" height={32} />
          </Box>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Skeleton variant="rectangular" height={60} />
            </Box>
          ))}
        </CardContent>
      </FloatingCard>
    );
  }

  return (
    <Box>
      {/* Header */}
      <ResponsiveFlex
        justify={{ xs: 'space-between', sm: 'space-between' }}
        align={{ xs: 'center', sm: 'center' }}
        sx={{ mb: 3 }}
        direction={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
      >
        <TitleLarge>
          Subscription Management
        </TitleLarge>
        
        <ResponsiveFlex gap={{ xs: 1, sm: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchSubscriptions} 
              disabled={loading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <HideOn xs>
            <Tooltip title="Export Data">
              <IconButton color="primary">
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </HideOn>
          
          {hasPermission('subscription:create') && (
            <AccessibleButton
              variant="contained"
              startIcon={<AddSubscriptionIcon />}
              onClick={onAdd}
              size={breakpoint.xs ? 'small' : 'medium'}
            >
              <HideOn xs>Add Subscription</HideOn>
              <ShowOn xs>Add</ShowOn>
            </AccessibleButton>
          )}
        </ResponsiveFlex>
      </ResponsiveFlex>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table Container */}
      <InteractiveElevationBox component="card">
        <FloatingCard>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'msisdn'}
                      direction={sortField === 'msisdn' ? sortOrder : 'asc'}
                      onClick={() => handleSort('msisdn')}
                    >
                      MSISDN
                    </TableSortLabel>
                  </TableCell>
                  
                  <HideOn xs>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === 'impu'}
                        direction={sortField === 'impu' ? sortOrder : 'asc'}
                        onClick={() => handleSort('impu')}
                      >
                        IMPU
                      </TableSortLabel>
                    </TableCell>
                  </HideOn>
                  
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'status'}
                      direction={sortField === 'status' ? sortOrder : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  
                  <HideOn xs sm>
                    <TableCell>Last Activity</TableCell>
                    <TableCell align="right">Messages</TableCell>
                  </HideOn>
                  
                  <TableCell align="center" width="60px">Actions</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow 
                    key={subscription.id}
                    hover
                    sx={{ 
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {/* MSISDN Column */}
                    <TableCell>
                      <Box>
                        <BodyLarge sx={{ fontWeight: 500 }}>
                          {subscription.msisdn}
                        </BodyLarge>
                        <ShowOn xs>
                          <MonospaceText sx={{ fontSize: '12px', color: 'text.secondary' }}>
                            {subscription.impu}
                          </MonospaceText>
                        </ShowOn>
                      </Box>
                    </TableCell>
                    
                    {/* IMPU Column (Hidden on mobile) */}
                    <HideOn xs>
                      <TableCell>
                        <MonospaceText>
                          {subscription.impu}
                        </MonospaceText>
                      </TableCell>
                    </HideOn>
                    
                    {/* Status Column */}
                    <TableCell>
                      <ResponsiveFlex align="center" gap={1}>
                        <StatusIndicator 
                          status={getStatusColor(subscription.status)} 
                          animated={subscription.status === 'ACTIVE'}
                        />
                        <StatusText status={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </StatusText>
                      </ResponsiveFlex>
                    </TableCell>
                    
                    {/* Last Activity Column (Hidden on mobile/tablet) */}
                    <HideOn xs sm>
                      <TableCell>
                        <DataText>
                          {formatLastActivity(subscription.lastActivity || subscription.updatedAt)}
                        </DataText>
                      </TableCell>
                    </HideOn>
                    
                    {/* Message Count Column (Hidden on mobile/tablet) */}
                    <HideOn xs sm>
                      <TableCell align="right">
                        <DataText>
                          {subscription.messageCount?.toLocaleString() || '0'}
                        </DataText>
                      </TableCell>
                    </HideOn>
                    
                    {/* Actions Column */}
                    <TableCell align="center">
                      <Tooltip title="More actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, subscription)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Empty state */}
                {subscriptions.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <BodyLarge color="text.secondary">
                        No subscriptions found
                      </BodyLarge>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {subscriptions.length > 0 && (
            <TablePagination
              component="div"
              count={subscriptions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              showFirstButton
              showLastButton
            />
          )}
        </FloatingCard>
      </InteractiveElevationBox>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 160 }
        }}
      >
        <MenuItem onClick={() => handleAction('view', menuAnchor!.subscription)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {hasPermission('subscription:update') && (
          <MenuItem onClick={() => handleAction('edit', menuAnchor!.subscription)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        
        {hasPermission('subscription:delete') && (
          <MenuItem 
            onClick={() => handleAction('delete', menuAnchor!.subscription)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default SubscriptionList;