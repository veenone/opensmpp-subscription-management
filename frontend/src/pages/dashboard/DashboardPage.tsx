import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  People,
  PauseCircle,
  Cancel,
  Refresh,
  TrendingUp,
  Assessment,
  Schedule,
} from '@mui/icons-material';
import { subscriptionApi } from '../../services/subscriptionService';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend,
  loading = false 
icon => {
  return (
    <Card elevation={2} sx={{ height: '100%', minHeight: 150 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={80} height={40} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
            )}
            {trend !== undefined && !loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp
                  fontSize="small"
                  sx={{ 
                    color: trend >= 0 ? 'success.main' : 'error.main',
                    mr: 0.5,
                    transform: trend < 0 ? 'rotate(180deg)' : 'none'
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {
              
            icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const {
    data: statistics,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['subscriptions', 'statistics'],
    queryFn: () => subscriptionApi.getStatistics(),
    refetchInterval: 30000,
    staleTime: 15000,
  icon;

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to the SMPP Subscription Management System
          </Typography>
        </Box>
        <IconButton 
          onClick={handleRefresh} 
          disabled={isRefetching}
          sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { boxShadow: 2 }
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          }
        >
          Failed to load dashboard data. Please try refreshing.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title="Total Subscriptions"
            value={statistics?.total || 0}
            icon={<Assessment />}
            color="#1976d2"
            trend={5.2}
            loading={isLoading}
          />
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title="Active Subscriptions"
            value={statistics?.active || 0}
            icon={<People />}
            color="#4caf50"
            trend={2.1}
            loading={isLoading}
          />
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title="Suspended"
            value={statistics?.suspended || 0}
            icon={<PauseCircle />}
            color="#ff9800"
            trend={-1.3}
            loading={isLoading}
          />
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title="Terminated"
            value={statistics?.terminated || 0}
            icon={<Cancel />}
            color="#f44336"
            trend={-8.7}
            loading={isLoading}
          />
        </Box>
      </Box>

      {/* Quick Actions and Status */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Quick Actions */}
        <Box sx={{ flex: '1 1 300px' }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
                elevation={0}
                onClick={() => window.location.href = '/subscriptions/create'}
              >
                <Schedule sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Create Subscription
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add a new mobile subscription
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Box>

        {/* System Status */}
        <Box sx={{ flex: '1 1 300px' }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              System Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">API Service</Typography>
                <Chip label="Operational" color="success" size="small" />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Database</Typography>
                <Chip label="Operational" color="success" size="small" />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Cache</Typography>
                <Chip label="Operational" color="success" size="small" />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}