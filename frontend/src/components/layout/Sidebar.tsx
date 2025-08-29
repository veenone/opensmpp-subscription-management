import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  People,
  
  FileUpload,
  AccountCircle,
  SupervisorAccount,
  Security,
  History,
  Settings,
  ExpandLess,
  ExpandMore,
  Phone,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/authService';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

interface MenuItemConfig {
  label: string;
  icon: React.ReactNode;
  path?: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  children?: MenuItemConfig[];
}

const menuItems: MenuItemConfig[] = [
  {
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/',
    requiredPermissions: ['DASHBOARD_READ'],
  },
  {
    label: 'Subscriptions',
    icon: <Phone />,
    children: [
      {
        label: 'All Subscriptions',
        icon: <People />,
        path: '/subscriptions',
        requiredPermissions: ['SUBSCRIPTION_READ'],
      },
      {
        label: 'Create Subscription',
        icon: <Add />,
        path: '/subscriptions/create',
        requiredPermissions: ['SUBSCRIPTION_CREATE'],
      },
      {
        label: 'Bulk Import',
        icon: <FileUpload />,
        path: '/subscriptions/bulk-import',
        requiredPermissions: ['SUBSCRIPTION_BULK_IMPORT'],
      },
    ],
  },
  {
    label: 'User Management',
    icon: <SupervisorAccount />,
    children: [
      {
        label: 'Users',
        icon: <People />,
        path: '/users',
        requiredPermissions: ['USER_READ'],
      },
      {
        label: 'Roles',
        icon: <Security />,
        path: '/roles',
        requiredPermissions: ['ROLE_READ'],
      },
    ],
  },
  {
    label: 'System',
    icon: <Settings />,
    children: [
      {
        label: 'Audit Logs',
        icon: <History />,
        path: '/audit',
        requiredPermissions: ['AUDIT_READ'],
      },
      {
        label: 'Settings',
        icon: <Settings />,
        path: '/settings',
        requiredPermissions: ['SETTINGS_READ'],
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  drawerWidth,
  isMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const hasPermissionForItem = (item: MenuItemConfig): boolean => {
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      return authApi.hasAnyPermission(user, item.requiredPermissions);
    }
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      return authApi.hasRole(user, item.requiredRoles);
    }
    return true;
  };

  const handleItemClick = (item: MenuItemConfig) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) {
        onClose();
      }
    } else if (item.children) {
      // Toggle expansion
      const isExpanded = expandedItems.includes(item.label);
      if (isExpanded) {
        setExpandedItems(expandedItems.filter(label => label !== item.label));
      } else {
        setExpandedItems([...expandedItems, item.label]);
      }
    }
  };

  const isItemActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderMenuItem = (item: MenuItemConfig, level: number = 0) => {
    if (!hasPermissionForItem(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = item.path ? isItemActive(item.path) : false;

    return (
      <React.Fragment key={item.label}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + level * 2,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
              color: isActive ? theme.palette.primary.contrastText : 'inherit',
              '&:hover': {
                backgroundColor: isActive 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive ? theme.palette.primary.contrastText : 'inherit',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: level > 0 ? '0.875rem' : '1rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(childItem => 
                renderMenuItem(childItem, level + 1)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Phone sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          SMPP Manager
        </Typography>
      </Box>

      {/* User info */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccountCircle sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="subtitle2" noWrap>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.username || 'User'
            }
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {user?.roles?.[0]?.name || 'User'}
        </Typography>
      </Box>

      {/* Navigation menu */}
      <List sx={{ pt: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>

      {/* Profile link at bottom */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate('/profile');
              if (isMobile) onClose();
            }}
            sx={{
              borderRadius: 1,
              mx: 1,
              my: 1,
            }}
          >
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100vh',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};