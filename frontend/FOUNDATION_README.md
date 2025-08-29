# React Application Foundation

This document describes the comprehensive React application foundation for the SMPP Subscription Management System.

## Architecture Overview

The application follows modern React best practices with a scalable, maintainable architecture:

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (DataTable, ConfirmDialog, etc.)
│   ├── forms/          # Form components with react-hook-form integration
│   ├── layout/         # Layout components (Header, Sidebar, Breadcrumbs)
│   └── auth/           # Authentication components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom hooks
├── pages/              # Page components (lazy-loaded)
├── routes/             # Route configuration
├── services/           # API services and HTTP client
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
└── App.tsx             # Main application component
```

## Core Features

### 1. Authentication System ✅

**Complete JWT-based authentication with:**
- Token management (access/refresh tokens)
- Multi-provider support (Database, LDAP, OAuth2)
- Automatic token refresh
- Protected routes with permission checking
- Role-based access control (RBAC)

**Files:**
- `contexts/AuthContext.tsx` - Authentication context and state management
- `services/authService.ts` - Authentication API service
- `components/auth/ProtectedRoute.tsx` - Route protection component
- `pages/auth/LoginPage.tsx` - Login form with provider selection

### 2. Application Layout ✅

**Responsive layout with:**
- Material-UI based design system
- Collapsible sidebar with role-based navigation
- Header with user profile and theme toggle
- Breadcrumb navigation
- Mobile-responsive design

**Files:**
- `components/layout/Layout.tsx` - Main layout wrapper
- `components/layout/Header.tsx` - Application header
- `components/layout/Sidebar.tsx` - Navigation sidebar
- `components/layout/Breadcrumbs.tsx` - Route breadcrumbs

### 3. API Integration ✅

**Robust HTTP client with:**
- Axios-based API client with interceptors
- Automatic JWT token attachment
- Request/response logging (development)
- Error handling and retry logic
- File upload/download support

**Files:**
- `services/apiClient.ts` - HTTP client configuration
- `services/authService.ts` - Authentication endpoints
- `services/subscriptionService.ts` - Subscription management endpoints

### 4. Theme System ✅

**Comprehensive theming with:**
- Material-UI theme configuration
- Dark/light mode toggle with persistence
- System preference detection
- Custom theme variables and components
- Responsive breakpoints

**Files:**
- `contexts/ThemeContext.tsx` - Theme context and management
- Custom theme tokens and component overrides

### 5. Form Infrastructure ✅

**Advanced form handling with:**
- react-hook-form integration
- Reusable form components (TextField, Select, DatePicker, etc.)
- Validation rules and error handling
- Form drafts and auto-save
- Field-level permissions

**Files:**
- `components/forms/` - All form components
- `utils/validators.ts` - Validation utilities
- `hooks/useFormDraft.ts` - Form draft management

## Additional Foundation Components

### Custom Hooks

**Comprehensive hook library:**
- `useApi` - API call management with loading states
- `useLocalStorage/useSessionStorage` - Persistent storage
- `useDebounce` - Value debouncing
- `useMediaQuery` - Responsive breakpoint detection
- `useClickOutside` - Outside click detection
- `useToggle` - Boolean state management

### Utility Functions

**Rich utility library:**
- **Formatters**: Date, number, currency, file size formatting
- **Validators**: Email, phone, MSISDN, IMPI/IMPU validation
- **Helpers**: Deep clone, array manipulation, file operations
- **Constants**: Application-wide constants and enums

### Common Components

**Reusable UI components:**
- `DataTable` - Advanced data table with sorting, filtering, pagination
- `ConfirmDialog` - Confirmation dialogs with variants
- `LoadingSpinner` - Various loading indicators
- `ErrorBoundary` - Error boundary with development details

## Usage Examples

### Creating a New Page

```tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable, type Column } from '@/components/common/DataTable';
import { useApi } from '@/hooks/useApi';

const MyPage: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, execute } = useApi();

  const columns: Column[] = [
    { id: 'id', label: 'ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'status', label: 'Status', type: 'chip' },
    { id: 'actions', label: 'Actions', type: 'actions' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Page
      </Typography>
      
      <DataTable
        data={data || []}
        columns={columns}
        loading={loading}
        pagination={{
          page: 0,
          rowsPerPage: 20,
          total: data?.length || 0,
          onPageChange: () => {},
          onRowsPerPageChange: () => {},
        }}
      />
    </Box>
  );
};

export default MyPage;
```

### Using Form Components

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import { FormTextField, FormSelect, formFieldConfigs } from '@/components/forms';

interface FormData {
  username: string;
  email: string;
  role: string;
}

const MyForm: React.FC = () => {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Handle form submission
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <FormTextField
        name="username"
        control={control}
        {...formFieldConfigs.username}
      />
      
      <FormTextField
        name="email"
        control={control}
        {...formFieldConfigs.email}
      />
      
      <FormSelect
        name="role"
        control={control}
        label="Role"
        options={[
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
        ]}
        rules={{ required: 'Role is required' }}
      />
      
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
      >
        Submit
      </Button>
    </Box>
  );
};
```

### Using Custom Hooks

```tsx
import React from 'react';
import { useApi, useDebounce, useLocalStorage } from '@/hooks';
import { subscriptionApi } from '@/services/subscriptionService';

const SearchComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useLocalStorage('searchTerm', '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data, loading, execute } = useApi();

  React.useEffect(() => {
    if (debouncedSearchTerm) {
      execute(() => subscriptionApi.searchSubscriptions({
        searchTerm: debouncedSearchTerm
      }));
    }
  }, [debouncedSearchTerm]);

  return (
    // Component implementation
    <div>Search functionality</div>
  );
};
```

## Development Guidelines

### 1. Component Structure

- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow naming conventions (PascalCase for components)
- Include JSDoc comments for complex components
- Export types alongside components

### 2. State Management

- Use React hooks for component state
- Leverage contexts for global state
- Consider React Query for server state
- Implement proper error boundaries

### 3. Styling

- Use Material-UI components and styling
- Follow the established theme structure
- Use responsive breakpoints consistently
- Avoid inline styles (use sx prop instead)

### 4. Testing

- Write unit tests for utilities and hooks
- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Maintain good test coverage

### 5. Performance

- Implement proper memoization (React.memo, useMemo, useCallback)
- Use lazy loading for routes and large components
- Optimize bundle size with code splitting
- Monitor and profile performance regularly

## Configuration

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=SMPP Subscription Management
VITE_ENABLE_DEVTOOLS=true
```

### Build Configuration

The project uses Vite with optimized build configuration:
- Code splitting for vendor libraries
- Asset optimization
- TypeScript compilation
- CSS processing

## Security Considerations

1. **Authentication**: JWT tokens with secure storage
2. **Authorization**: Role-based access control throughout
3. **Input Validation**: Client and server-side validation
4. **XSS Prevention**: Proper data sanitization
5. **CSRF Protection**: Token-based protection
6. **Secure Headers**: Content Security Policy implementation

## Next Steps

This foundation provides a solid base for building the SMPP Subscription Management System. Key areas for extension:

1. **Business Logic**: Implement subscription-specific components
2. **Real-time Features**: Add WebSocket integration for live updates
3. **Advanced Features**: Implement advanced search, bulk operations
4. **Monitoring**: Add application performance monitoring
5. **Internationalization**: Add multi-language support

## Support

For questions about this foundation or implementation guidance:
1. Review the existing code examples
2. Check the TypeScript definitions
3. Refer to Material-UI documentation
4. Follow React best practices documentation

The foundation is designed to be extensible and maintainable, providing a professional-grade base for enterprise application development.