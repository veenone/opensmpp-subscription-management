# SMPP Subscription Management System - Frontend

A modern React application built with TypeScript, Material-UI, and React Query for managing SMPP subscriptions in telecommunications environments.

## 🚀 Features

### Core Architecture
- **React 19.1.1** with TypeScript 5.9.2 for type safety
- **Material-UI v7.3.1** for modern, accessible UI components
- **React Router v7.8.2** for client-side routing with protected routes
- **React Query v5.85.5** for server state management and caching
- **React Hook Form v7.48.2** for performant form handling

### Authentication & Security
- JWT-based authentication with automatic token refresh
- Multi-provider authentication support (Database, LDAP, OAuth2)
- Role-based access control (RBAC) with granular permissions
- Protected routes with fallback components
- Secure API client with request/response interceptors

### UI/UX Features
- Responsive design with mobile-first approach
- Dark/light theme switching with persistence
- Comprehensive loading states and error boundaries
- Toast notifications system
- Breadcrumb navigation
- Sidebar navigation with role-based menu items

### Developer Experience
- Hot module replacement with Vite
- Comprehensive TypeScript configuration
- ESLint and Prettier for code quality
- Unit testing with Vitest and React Testing Library
- React Query DevTools for debugging

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication-related components
│   ├── common/          # Common utilities (loading, errors, toast)
│   ├── forms/           # Form components with react-hook-form
│   └── layout/          # Layout components (header, sidebar, breadcrumbs)
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state management
│   └── ThemeContext.tsx # Theme configuration and switching
├── pages/               # Page components (lazy-loaded)
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard and analytics
│   ├── subscriptions/   # Subscription management
│   ├── users/           # User management
│   ├── roles/           # Role and permission management
│   ├── audit/           # Audit logs
│   ├── settings/        # Application settings
│   └── errors/          # Error pages
├── routes/              # Routing configuration
│   └── AppRoutes.tsx    # Main routing setup with protected routes
├── services/            # API services and business logic
│   ├── apiClient.ts     # Axios client with interceptors
│   ├── authService.ts   # Authentication API calls
│   └── subscriptionService.ts # Subscription management API
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run format       # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_ENV=development
VITE_ENABLE_DEVTOOLS=true
```

### API Integration
The application integrates with a Spring Boot backend providing:

- **Authentication endpoints**: Login, logout, token refresh
- **Subscription management**: CRUD operations, bulk import/export
- **User management**: Users, roles, and permissions
- **Audit logging**: Activity tracking and compliance

### Theme Configuration
The app supports dynamic theming with:

- Light/dark mode switching
- Material-UI theme customization
- Persistent theme preferences
- System preference detection

## 🧪 Testing

The application includes comprehensive testing setup:

### Unit Tests
- Component testing with React Testing Library
- Service layer testing with Vitest
- Mock implementations for external dependencies

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Multi-provider support (Database, LDAP, OAuth2)
- Remember me functionality

### Authorization
- Role-based access control (RBAC)
- Granular permission checking
- Protected route components
- Fallback UI for insufficient permissions

### API Security
- Request/response interceptors
- Automatic token injection
- Error handling and retry logic
- Request timeout configuration

## 📱 Responsive Design

The application is built with mobile-first approach:

- Responsive grid layout using Material-UI Grid
- Adaptive sidebar navigation (drawer on mobile)
- Touch-friendly interface elements
- Optimized for tablets and mobile devices

## 🎨 Component Library

### Form Components
- `FormTextField`: Text input with validation
- `FormSelect`: Dropdown with multi-select support  
- `FormDatePicker`: Date and datetime inputs

### Layout Components
- `Layout`: Main application layout
- `Header`: Top navigation with user menu
- `Sidebar`: Collapsible navigation sidebar
- `Breadcrumbs`: Navigation breadcrumb trail

### Common Components
- `LoadingSpinner`: Various loading state indicators
- `ErrorBoundary`: Error handling with fallbacks
- `ProtectedRoute`: Route protection with RBAC
- `Toaster`: Global notification system

## 📊 Performance Optimizations

### Code Splitting
- Lazy-loaded page components
- Vendor chunk separation
- Dynamic imports for large dependencies

### Caching Strategy
- React Query for server state caching
- Stale-while-revalidate pattern
- Optimistic updates for better UX

### Bundle Optimization
- Tree shaking for unused code elimination
- Optimized dependency bundling
- Source map generation for debugging

## 🚦 Production Deployment

### Build Process
```bash
# Create production build
npm run build

# Preview production build locally  
npm run preview
```

### Docker Support
The application includes Docker configuration:

```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine as build
# ... build steps

FROM nginx:alpine
# ... serving configuration
```

### Environment Configuration
Configure environment variables for production:

- `VITE_API_BASE_URL`: Production API endpoint
- `VITE_ENV=production`: Environment flag
- `VITE_ENABLE_DEVTOOLS=false`: Disable dev tools

## 📈 Monitoring & Analytics

### Error Tracking
- Error boundary with detailed error reporting
- Console error logging in development
- Production error reporting (configurable)

### Performance Monitoring
- Web Vitals measurement
- React Query DevTools (development)
- Bundle analysis tools

## 🤝 Contributing

### Code Style
- TypeScript for type safety
- ESLint configuration for consistent code style
- Prettier for automatic code formatting
- Conventional commit messages

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and type checks
4. Submit pull request with clear description

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Vite Documentation](https://vitejs.dev/)

---

Built with ❤️ for telecommunications subscription management.