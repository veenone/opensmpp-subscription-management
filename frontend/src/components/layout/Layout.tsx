import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';

const DRAWER_WIDTH = 280;

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header 
        onSidebarToggle={handleSidebarToggle}
        drawerWidth={DRAWER_WIDTH}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        drawerWidth={DRAWER_WIDTH}
        isMobile={isMobile}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { lg: sidebarOpen ? 0 : `-${DRAWER_WIDTH}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Add top margin to account for fixed header */}
        <Box sx={{ mt: 8 }}>
          {/* Breadcrumbs */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Breadcrumbs />
          </Box>

          {/* Page content */}
          <Box sx={{ p: 3 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};