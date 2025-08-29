import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Message as MessageIcon,
  SignalCellular4Bar as SignalIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

import { Subscription } from '../../types/subscription';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { StatusIndicator } from '../../theme/motion';
import { 
  TitleLarge,
  HeadlineMedium,
  BodyLarge,
  MonospaceText,
  StatusText,
  DataText,
  MetricText
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
import { FloatingCard } from '../../theme/elevation';

interface SubscriptionDetailsProps {
  open: boolean;
  onClose: () => void;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  subscriptionId?: string;
  subscription?: Subscription;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subscription-tabpanel-${index}`}
      aria-labelledby={`subscription-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  open,
  onClose,
  onEdit,
  onDelete,
  subscriptionId,
  subscription: initialSubscription,
}) => {
  const { hasPermission } = useAuth();
  const breakpoint = useBreakpoint();

  // State management
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Mock data for demo purposes - would come from API
  const activityData = [
    { timestamp: '2024-01-20T10:30:00Z', event: 'SMS Sent', details: 'Message to +1234567890' },
    { timestamp: '2024-01-20T10:25:00Z', event: 'Registration', details: 'IMS registration successful' },
    { timestamp: '2024-01-20T09:45:00Z', event: 'Status Change', details: 'Changed to ACTIVE' },
  ];

  const usageStats = {
    totalMessages: 1247,
    messagesThisMonth: 89,
    lastActivity: '2024-01-20T10:30:00Z',
    averageDaily: 12.5,
    uptime: 98.7,
  };

  // Fetch subscription details
  const fetchSubscription = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/subscriptions/${id}`) as any;
      setSubscription(response.data);
    } catch (err) {
      setError('Failed to load subscription details. Please try again.');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (open && subscriptionId && !initialSubscription) {
      fetchSubscription(subscriptionId);
    } else if (open && initialSubscription) {
      setSubscription(initialSubscription);
    }

    if (!open) {
      setError(null);
      setTabValue(0);
    }
  }, [open, subscriptionId, initialSubscription]);

  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
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

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (!subscription && !loading) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={breakpoint.xs}
      PaperProps={{
        sx: { minHeight: breakpoint.xs ? '100vh' : '700px' }
      }}
    >
      <DialogTitle>
        <ResponsiveFlex justify={{ xs: "space-between" }} align={{ xs: "center" }}>
          <Box>
            <TitleLarge>
              Subscription Details
            </TitleLarge>
            {subscription && (
              <ResponsiveFlex align={{ xs: "center" }} gap={1} sx={{ mt: 1 }}>
                <MonospaceText sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  ID: {subscription.id}
                </MonospaceText>
                <StatusIndicator 
                  status={getStatusColor(subscription.status)} 
                  animated={subscription.status === 'ACTIVE'}
                />
                <StatusText status={getStatusColor(subscription.status)}>
                  {subscription.status}
                </StatusText>
              </ResponsiveFlex>
            )}
          </Box>
          
          <ResponsiveFlex gap={1}>
            {subscription && hasPermission('subscription:update') && (
              <AccessibleButton
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit?.(subscription)}
                size="small"
              >
                <HideOn xs>Edit</HideOn>
              </AccessibleButton>
            )}
            
            <AccessibleButton
              onClick={onClose}
              size="small"
              variant="text"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </AccessibleButton>
          </ResponsiveFlex>
        </ResponsiveFlex>
      </DialogTitle>

      <DialogContent dividers>
        {loading && <LinearProgress />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {subscription && (
          <>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant={breakpoint.xs ? "scrollable" : "standard"}
                scrollButtons="auto"
              >
                <Tab label="Overview" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Technical" icon={<SettingsIcon />} iconPosition="start" />
                <Tab label="Usage" icon={<TimelineIcon />} iconPosition="start" />
                <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                <Tab label="Activity" icon={<MessageIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Basic Information Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FloatingCard floating>
                    <CardContent>
                      <HeadlineMedium gutterBottom>
                        Basic Information
                      </HeadlineMedium>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="MSISDN"
                            secondary={
                              <MonospaceText>{subscription.msisdn}</MonospaceText>
                            }
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Display Name"
                            secondary={subscription.displayName || 'Not set'}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <SignalIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Status"
                            secondary={
                              <ResponsiveFlex align={{ xs: "center" }} gap={1}>
                                <StatusIndicator 
                                  status={getStatusColor(subscription.status)} 
                                  animated={subscription.status === 'ACTIVE'}
                                />
                                <StatusText status={getStatusColor(subscription.status)}>
                                  {subscription.status}
                                </StatusText>
                              </ResponsiveFlex>
                            }
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <ScheduleIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Created"
                            secondary={formatDateTime(subscription.createdAt || '')}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </FloatingCard>
                </Grid>

                {/* Quick Stats Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FloatingCard floating>
                    <CardContent>
                      <HeadlineMedium gutterBottom>
                        Quick Stats
                      </HeadlineMedium>
                      
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <MetricText>{usageStats.totalMessages.toLocaleString()}</MetricText>
                            <DataText>Total Messages</DataText>
                          </Box>
                        </Grid>
                        
                        <Grid size={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <MetricText>{usageStats.messagesThisMonth}</MetricText>
                            <DataText>This Month</DataText>
                          </Box>
                        </Grid>
                        
                        <Grid size={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <MetricText>{usageStats.averageDaily}</MetricText>
                            <DataText>Daily Average</DataText>
                          </Box>
                        </Grid>
                        
                        <Grid size={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <MetricText>{usageStats.uptime}%</MetricText>
                            <DataText>Uptime</DataText>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <BodyLarge color="text.secondary" sx={{ fontSize: '14px' }}>
                          Last activity: {formatTimeAgo(usageStats.lastActivity)}
                        </BodyLarge>
                      </Box>
                    </CardContent>
                  </FloatingCard>
                </Grid>

                {/* Custom Attributes */}
                {subscription.customAttributes && Object.keys(subscription.customAttributes).length > 0 && (
                  <Grid size={12}>
                    <FloatingCard floating>
                      <CardContent>
                        <HeadlineMedium gutterBottom>
                          Custom Attributes
                        </HeadlineMedium>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(subscription.customAttributes).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </FloatingCard>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            {/* Technical Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FloatingCard floating>
                    <CardContent>
                      <HeadlineMedium gutterBottom>
                        IMS Identities
                      </HeadlineMedium>
                      
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="IMPU (Public Identity)"
                            secondary={
                              <MonospaceText>{subscription.impu}</MonospaceText>
                            }
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText
                            primary="IMPI (Private Identity)"
                            secondary={
                              <MonospaceText>{subscription.impi}</MonospaceText>
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </FloatingCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FloatingCard floating>
                    <CardContent>
                      <HeadlineMedium gutterBottom>
                        Configuration
                      </HeadlineMedium>
                      
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Max Sessions"
                            secondary={subscription.maxSessions || 'Not configured'}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText
                            primary="Service Profile"
                            secondary={subscription.serviceProfile || 'default'}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText
                            primary="Roaming Allowed"
                            secondary={
                              <Chip
                                label={subscription.allowRoaming ? 'Yes' : 'No'}
                                color={subscription.allowRoaming ? 'success' : 'default'}
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </FloatingCard>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Usage Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <FloatingCard floating>
                    <CardContent>
                      <HeadlineMedium gutterBottom>
                        Usage Statistics
                      </HeadlineMedium>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <MessageIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <MetricText>{usageStats.totalMessages.toLocaleString()}</MetricText>
                            <DataText>Total Messages</DataText>
                          </Box>
                        </Grid>
                        
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <TimelineIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                            <MetricText>{usageStats.messagesThisMonth}</MetricText>
                            <DataText>This Month</DataText>
                          </Box>
                        </Grid>
                        
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <StorageIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <MetricText>{usageStats.averageDaily}</MetricText>
                            <DataText>Daily Average</DataText>
                          </Box>
                        </Grid>
                        
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <SignalIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <MetricText>{usageStats.uptime}%</MetricText>
                            <DataText>Uptime</DataText>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3 }}>
                        <BodyLarge gutterBottom>Usage Trend</BodyLarge>
                        <LinearProgress 
                          variant="determinate" 
                          value={(usageStats.messagesThisMonth / 100) * 100} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <DataText>0</DataText>
                          <DataText>Monthly Limit: 1000</DataText>
                        </Box>
                      </Box>
                    </CardContent>
                  </FloatingCard>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={3}>
              {hasPermission('subscription:security') ? (
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <FloatingCard floating>
                      <CardContent>
                        <HeadlineMedium gutterBottom>
                          Security Settings
                        </HeadlineMedium>
                        
                        <List>
                          <ListItem>
                            <ListItemText
                              primary="Encryption Enabled"
                              secondary={
                                <Chip
                                  label={subscription.encryptionEnabled ? 'Enabled' : 'Disabled'}
                                  color={subscription.encryptionEnabled ? 'success' : 'error'}
                                  size="small"
                                />
                              }
                            />
                          </ListItem>
                          
                          <ListItem>
                            <ListItemText
                              primary="Last Password Change"
                              secondary="Not available"
                            />
                          </ListItem>
                          
                          <ListItem>
                            <ListItemText
                              primary="Security Profile"
                              secondary="Standard"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </FloatingCard>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="warning">
                  You don't have permission to view security settings.
                </Alert>
              )}
            </TabPanel>

            {/* Activity Tab */}
            <TabPanel value={tabValue} index={4}>
              <FloatingCard floating>
                <CardContent>
                  <HeadlineMedium gutterBottom>
                    Recent Activity
                  </HeadlineMedium>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Event</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activityData.map((activity, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <MonospaceText sx={{ fontSize: '12px' }}>
                                {formatDateTime(activity.timestamp)}
                              </MonospaceText>
                            </TableCell>
                            <TableCell>
                              <BodyLarge sx={{ fontWeight: 500 }}>
                                {activity.event}
                              </BodyLarge>
                            </TableCell>
                            <TableCell>
                              <DataText>
                                {activity.details}
                              </DataText>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </FloatingCard>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <ResponsiveFlex justify={{ xs: "space-between" }} width="100%">
          <Box>
            {subscription && hasPermission('subscription:delete') && (
              <AccessibleButton
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete?.(subscription)}
              >
                <HideOn xs>Delete</HideOn>
                <ShowOn xs>Delete</ShowOn>
              </AccessibleButton>
            )}
          </Box>
          
          <ResponsiveFlex gap={1}>
            {subscription && hasPermission('subscription:update') && (
              <AccessibleButton
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit?.(subscription)}
              >
                Edit
              </AccessibleButton>
            )}
            
            <AccessibleButton 
              onClick={onClose} 
              variant="contained"
            >
              Close
            </AccessibleButton>
          </ResponsiveFlex>
        </ResponsiveFlex>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionDetails;