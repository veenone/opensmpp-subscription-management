/**
 * Example Implementation of Material Design 3 Theme System
 * Demonstrates comprehensive usage of all design system components
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Chip,
  Badge,
  Fab,
  Tooltip,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  NetworkCheck as NetworkIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Contrast as ContrastIcon,
} from '@mui/icons-material';

// Import our design system components
import {
  DisplayLarge,
  HeadlineMedium,
  TitleLarge,
  BodyLarge,
  MonospaceText,
  StatusText,
  MetricText,
  DataText,
} from './typography';
import {
  FloatingCard,
  InteractiveElevationBox,
  DropShadowContainer,
} from './elevation';
import {
  AnimatedBox,
  StaggeredContainer,
  SkeletonLoader,
  StatusIndicator,
  AnimatedProgressBar,
} from './motion';
import {
  AccessibleButton,
  HighContrastContainer,
  ContrastIndicator,
} from './accessibility';
import {
  ResponsiveContainer,
  ResponsiveFlex,
  HideOn,
  ShowOn,
  useBreakpoint,
} from './responsive';
import { useTheme } from '../contexts/ThemeContext';

interface NetworkMetrics {
  messagesPerSecond: number;
  activeConnections: number;
  dataTransferred: number;
  uptime: number;
  status: 'online' | 'warning' | 'error';
}

interface Subscription {
  id: string;
  msisdn: string;
  imsi: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: Date;
  messageCount: number;
}

const ExampleImplementation: React.FC = () => {
  const { mode, toggleTheme, isHighContrast, toggleHighContrast, themeConfig } = useTheme();
  const breakpoint = useBreakpoint();
  
  // Component state
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [notifications] = useState(3);

  // Mock data
  const [metrics] = useState<NetworkMetrics>({
    messagesPerSecond: 1247,
    activeConnections: 156,
    dataTransferred: 45.7,
    uptime: 99.8,
    status: 'online',
  });

  const [subscriptions] = useState<Subscription[]>([
    {
      id: '1',
      msisdn: '+1-555-0123',
      imsi: '310410123456789',
      status: 'active',
      lastActivity: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      messageCount: 1423,
    },
    {
      id: '2',
      msisdn: '+1-555-0124',
      imsi: '310410123456790',
      status: 'inactive',
      lastActivity: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      messageCount: 89,
    },
    {
      id: '3',
      msisdn: '+1-555-0125',
      imsi: '310410123456791',
      status: 'active',
      lastActivity: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      messageCount: 2891,
    },
  ]);

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbarOpen(true);
    }, 2000);
  };

  const formatTimeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'online':
        return 'online' as const;
      case 'inactive':
        return 'offline' as const;
      case 'suspended':
      case 'warning':
        return 'warning' as const;
      case 'error':
        return 'error' as const;
      default:
        return 'offline' as const;
    }
  };

  return (
    <ResponsiveContainer maxWidth="xl">
      {/* Header */}
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <DisplayLarge sx={{ color: 'inherit', fontSize: { xs: '24px', md: '32px' } }}>
              SMPP Management Dashboard
            </DisplayLarge>
          </Box>
          
          <HideOn xs>
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
                <IconButton color="inherit" onClick={toggleTheme}>
                  {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Toggle High Contrast">
                <IconButton 
                  color="inherit" 
                  onClick={toggleHighContrast}
                  sx={{ opacity: isHighContrast ? 1 : 0.7 }}
                >
                  <ContrastIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </HideOn>
          
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <IconButton
            color="inherit"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => setDialogOpen(true)}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ py: 3 }}>
        {/* Status Banner */}
        <AnimatedBox animation="slideInDown" duration="medium" sx={{ mb: 3 }}>
          <Alert 
            severity={metrics.status === 'online' ? 'success' : 'warning'}
            action={
              <AccessibleButton 
                size="small" 
                onClick={handleRefreshData}
                disabled={loading}
                startIcon={loading ? undefined : <RefreshIcon />}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </AccessibleButton>
            }
          >
            <StatusText status={metrics.status}>
              System Status: {metrics.status.toUpperCase()}
            </StatusText>
            {' - '}
            Network uptime: {metrics.uptime}%
          </Alert>
        </AnimatedBox>

        {/* Metrics Dashboard */}
        <StaggeredContainer staggerDelay={150} sx={{ mb: 4 }}>
          <HeadlineMedium gutterBottom>Network Metrics</HeadlineMedium>
          
          <ResponsiveFlex
            gap={2}
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap'
            }}
          >
            <FloatingCard floating hoverFloat sx={{ flex: 1, minWidth: '250px' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <NetworkIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <MetricText>{metrics.messagesPerSecond.toLocaleString()}</MetricText>
                <BodyLarge color="text.secondary">Messages/sec</BodyLarge>
                <AnimatedProgressBar 
                  progress={(metrics.messagesPerSecond / 2000) * 100} 
                  color="primary" 
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </FloatingCard>
            
            <FloatingCard floating hoverFloat sx={{ flex: 1, minWidth: '250px' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SpeedIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <MetricText>{metrics.activeConnections}</MetricText>
                <BodyLarge color="text.secondary">Active Connections</BodyLarge>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                  <StatusIndicator status="online" animated />
                  <DataText>BIND_TRX</DataText>
                </Box>
              </CardContent>
            </FloatingCard>
            
            <FloatingCard floating hoverFloat sx={{ flex: 1, minWidth: '250px' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <StorageIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <MetricText>{metrics.dataTransferred} GB</MetricText>
                <BodyLarge color="text.secondary">Data Transferred</BodyLarge>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </FloatingCard>
          </ResponsiveFlex>
        </StaggeredContainer>

        {/* Subscriptions List */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <InteractiveElevationBox component="card" sx={{ height: '100%' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <TitleLarge>Active Subscriptions</TitleLarge>
                    <ShowOn md>
                      <Chip label={`${subscriptions.length} Total`} variant="outlined" />
                    </ShowOn>
                  </Box>
                  
                  {loading ? (
                    <StaggeredContainer staggerDelay={100}>
                      {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ mb: 2 }}>
                          <SkeletonLoader width="100%" height={60} />
                        </Box>
                      ))}
                    </StaggeredContainer>
                  ) : (
                    <List>
                      {subscriptions.map((subscription, index) => (
                        <AnimatedBox
                          key={subscription.id}
                          animation="slideInLeft"
                          duration="medium"
                          delay={`${index * 100}ms`}
                        >
                          <ListItem 
                            sx={{ 
                              borderRadius: 1, 
                              mb: 1,
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <ListItemIcon>
                              <StatusIndicator 
                                status={getStatusColor(subscription.status)} 
                                animated={subscription.status === 'active'}
                              />
                            </ListItemIcon>
                            
                            <ListItemText
                              primary={
                                <ResponsiveFlex
                                  sx={{
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    alignItems: { xs: 'flex-start', sm: 'center' }
                                  }}
                                  gap={1}
                                >
                                  <Box>
                                    <BodyLarge sx={{ fontWeight: 500 }}>
                                      {subscription.msisdn}
                                    </BodyLarge>
                                    <HideOn xs>
                                      <MonospaceText>
                                        IMSI: {subscription.imsi}
                                      </MonospaceText>
                                    </HideOn>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <StatusText status={getStatusColor(subscription.status)}>
                                      {subscription.status.toUpperCase()}
                                    </StatusText>
                                    <DataText>
                                      {subscription.messageCount.toLocaleString()} msgs
                                    </DataText>
                                  </Box>
                                </ResponsiveFlex>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <BodyLarge color="text.secondary" sx={{ fontSize: '14px' }}>
                                    Last activity: {formatTimeAgo(subscription.lastActivity)}
                                  </BodyLarge>
                                  <ShowOn xs>
                                    <MonospaceText>
                                      IMSI: {subscription.imsi}
                                    </MonospaceText>
                                  </ShowOn>
                                </Box>
                              }
                            />
                          </ListItem>
                        </AnimatedBox>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </InteractiveElevationBox>
          </Grid>
          
          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <DropShadowContainer level={2} color="primary">
              <Card>
                <CardContent>
                  <TitleLarge gutterBottom>System Information</TitleLarge>
                  
                  <MonospaceText>
                    {`Server: smpp-gateway-01
IP: 192.168.1.100
Port: 2775
Protocol: SMPP 3.4
Bind Type: TRX
System Type: SMSC
System ID: GATEWAY01`}
                  </MonospaceText>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <HighContrastContainer highContrast={isHighContrast}>
                    <TitleLarge gutterBottom>Configuration</TitleLarge>
                    
                    <FormControlLabel
                      control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
                      label="Dark Mode"
                    />
                    
                    <FormControlLabel
                      control={<Switch checked={isHighContrast} onChange={toggleHighContrast} />}
                      label="High Contrast"
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <BodyLarge>Current Theme:</BodyLarge>
                      <DataText>{themeConfig.brandScheme || 'Custom'}</DataText>
                    </Box>
                    
                    {/* Contrast validation */}
                    <Box sx={{ mt: 2 }}>
                      <BodyLarge gutterBottom>Theme Validation:</BodyLarge>
                      <ContrastIndicator
                        backgroundColor="#006397"
                        textColor="#ffffff"
                        sx={{ mr: 1 }}
                      />
                      <ContrastIndicator
                        backgroundColor="#74777c"
                        textColor="#ffffff"
                      />
                    </Box>
                  </HighContrastContainer>
                </CardContent>
              </Card>
            </DropShadowContainer>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add subscription"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 32 },
            right: { xs: 16, md: 32 },
          }}
          onClick={() => setDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Example Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={breakpoint.xs}
        >
          <DialogTitle>Add New Subscription</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="MSISDN"
              placeholder="+1-555-0123"
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="IMSI"
              placeholder="310410123456789"
              margin="normal"
              variant="outlined"
            />
            
            <Box sx={{ mt: 2 }}>
              <StatusText status="online">
                Connection will be established automatically
              </StatusText>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <AccessibleButton
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                setSnackbarOpen(true);
              }}
            >
              Add Subscription
            </AccessibleButton>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message="Operation completed successfully!"
          action={
            <Button color="inherit" size="small" onClick={() => setSnackbarOpen(false)}>
              CLOSE
            </Button>
          }
        />
      </Box>
    </ResponsiveContainer>
  );
};

export default ExampleImplementation;