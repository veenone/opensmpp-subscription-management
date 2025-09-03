import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authService';

export const AuthDebugTest: React.FC = () => {
  const { user, login, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    try {
      addDebugInfo('Starting login test...');
      await login({ username: 'admin', password: 'password' });
      addDebugInfo('Login successful!');
    } catch (error: any) {
      addDebugInfo(`Login failed: ${error.message}`);
    }
  };

  const testPermissions = () => {
    addDebugInfo('Testing permission extraction...');
    
    if (!user) {
      addDebugInfo('❌ User is null');
      return;
    }

    addDebugInfo(`✅ User exists: ${user.username}`);
    
    try {
      const hasPermission = authApi.hasAnyPermission(user, ['DASHBOARD_READ']);
      addDebugInfo(`✅ hasAnyPermission test passed: ${hasPermission}`);
      
      const hasMultiplePermissions = authApi.hasAnyPermission(user, ['SUBSCRIPTION_READ', 'USER_READ']);
      addDebugInfo(`✅ hasAnyPermission (multiple) test passed: ${hasMultiplePermissions}`);
      
      const hasNonExistentPermission = authApi.hasAnyPermission(user, ['NON_EXISTENT']);
      addDebugInfo(`✅ hasAnyPermission (non-existent) test passed: ${hasNonExistentPermission}`);

      addDebugInfo(`User roles count: ${user.roles?.length || 0}`);
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach((role, index) => {
          addDebugInfo(`Role ${index}: ${role.name} with ${role.permissions?.length || 0} permissions`);
        });
      }
    } catch (error: any) {
      addDebugInfo(`❌ Permission test failed: ${error.message}`);
      addDebugInfo(`Error stack: ${error.stack}`);
    }
  };

  const clearDebug = () => {
    setDebugInfo([]);
  };

  return (
    <Card sx={{ m: 2, maxWidth: 800 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Authentication Debug Test
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Current Status: {isLoading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </Typography>
          {user && (
            <Typography variant="body2" color="text.secondary">
              User: {user.username} ({user.firstName} {user.lastName})
            </Typography>
          )}
        </Box>

        <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', mb: 2 }}>
          <Button variant="contained" onClick={testLogin} disabled={isLoading}>
            Test Login (admin/password)
          </Button>
          <Button variant="contained" onClick={testPermissions} disabled={!isAuthenticated}>
            Test Permissions
          </Button>
          <Button variant="outlined" onClick={clearDebug}>
            Clear Debug
          </Button>
        </Box>

        {debugInfo.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6">Debug Log:</Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 1 }}>
              {debugInfo.map((info, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {info}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        {user && (
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">User Data Structure</Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <pre style={{ fontSize: '0.7rem', margin: 0 }}>
                  {JSON.stringify(user, null, 2)}
                </pre>
              </Box>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};