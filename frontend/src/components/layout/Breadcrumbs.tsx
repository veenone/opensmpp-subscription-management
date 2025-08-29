import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

const routeConfig: Record<string, string> = {
  '/': 'Dashboard',
  '/subscriptions': 'Subscriptions',
  '/subscriptions/create': 'Create Subscription',
  '/subscriptions/bulk-import': 'Bulk Import',
  '/profile': 'Profile',
  '/users': 'Users',
  '/roles': 'Roles',
  '/audit': 'Audit Logs',
  '/settings': 'Settings',
};

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Always start with home
  breadcrumbs.push({
    label: 'Home',
    path: '/',
    icon: <Home fontSize="small" />,
  });

  // If we're not on the home page, add breadcrumbs
  if (pathname !== '/') {
    const pathSegments = pathname.split('/').filter(Boolean);
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Check if this is a dynamic route (like /subscriptions/123)
      if (isNaN(Number(segment))) {
        // Static route
        const label = routeConfig[currentPath] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        breadcrumbs.push({
          label,
          path: index === pathSegments.length - 1 ? undefined : currentPath, // Last item has no link
        });
      } else {
        // Dynamic route (ID)
        breadcrumbs.push({
          label: `#${segment}`,
          path: undefined, // Dynamic segments are not clickable
        });
      }
    });

    // Special handling for edit pages
    if (pathname.includes('/edit')) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastBreadcrumb) {
        lastBreadcrumb.label = 'Edit';
      }
    }
  }

  return breadcrumbs;
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Don't show breadcrumbs if we're on the home page only
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <MuiBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
          },
        }}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast || !breadcrumb.path) {
            return (
              <Box
                key={breadcrumb.path || breadcrumb.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {breadcrumb.icon}
                <Typography
                  color={isLast ? 'text.primary' : 'text.secondary'}
                  sx={{ fontWeight: isLast ? 600 : 400 }}
                >
                  {breadcrumb.label}
                </Typography>
              </Box>
            );
          }

          return (
            <Link
              key={breadcrumb.path}
              component={RouterLink}
              to={breadcrumb.path}
              underline="hover"
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {breadcrumb.icon}
              {breadcrumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};