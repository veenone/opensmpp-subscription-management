import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/authService';
import { Box, Typography, Button, Paper } from '@mui/material';
import { SecurityOutlined } from '@mui/icons-material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAllPermissions?: boolean; // If true, user must have ALL permissions
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAllPermissions = false,
  fallback,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being verified
  if (isLoading) {
    return null; // LoadingSpinner is handled by parent
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    if (!authApi.hasRole(user, requiredRoles)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <AccessDenied requiredRoles={requiredRoles} />;
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasPermissions = requireAllPermissions
      ? authApi.hasAllPermissions(user, requiredPermissions)
      : authApi.hasAnyPermission(user, requiredPermissions);

    if (!hasPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <AccessDenied requiredPermissions={requiredPermissions} />;
    }
  }

  return <>{children}</>;
};

interface AccessDeniedProps {
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredPermissions, requiredRoles }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <SecurityOutlined
          sx={{
            fontSize: 64,
            color: 'error.main',
            mb: 2,
          }}
        />
        
        <Typography variant="h4" gutterBottom color="error">
          Access Denied
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          You don't have sufficient permissions to access this page.
        </Typography>

        {requiredPermissions && requiredPermissions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Required permissions:
            </Typography>
            <Typography variant="body2" color="primary">
              {requiredPermissions.join(', ')}
            </Typography>
          </Box>
        )}

        {requiredRoles && requiredRoles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Required roles:
            </Typography>
            <Typography variant="body2" color="primary">
              {requiredRoles.join(', ')}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button variant="contained" onClick={handleGoHome}>
            Go Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};