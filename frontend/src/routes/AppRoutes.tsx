import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Layout } from '../components/layout/Layout';

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const SubscriptionManagementPage = React.lazy(() => import('../pages/SubscriptionManagement'));
const SubscriptionsPage = React.lazy(() => import('../pages/subscriptions/SubscriptionsPage'));
const SubscriptionDetailPage = React.lazy(() => import('../pages/subscriptions/SubscriptionDetailPage'));
const CreateSubscriptionPage = React.lazy(() => import('../pages/subscriptions/CreateSubscriptionPage'));
const EditSubscriptionPage = React.lazy(() => import('../pages/subscriptions/EditSubscriptionPage'));
const BulkImportPage = React.lazy(() => import('../pages/subscriptions/BulkImportPage'));
const ProfilePage = React.lazy(() => import('../pages/profile/ProfilePage'));
const UsersPage = React.lazy(() => import('../pages/users/UsersPage'));
const RolesPage = React.lazy(() => import('../pages/roles/RolesPage'));
const AuditLogsPage = React.lazy(() => import('../pages/audit/AuditLogsPage'));
const SettingsPage = React.lazy(() => import('../pages/settings/SettingsPage'));
const NotFoundPage = React.lazy(() => import('../pages/errors/NotFoundPage'));

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage />
            )
          } 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          
          {/* Subscription Management */}
          <Route path="subscriptions">
            <Route index element={<SubscriptionManagementPage />} />
            <Route path="create" element={
              <ProtectedRoute requiredPermissions={['SUBSCRIPTION_CREATE']}>
                <CreateSubscriptionPage />
              </ProtectedRoute>
            } />
            <Route path="bulk-import" element={
              <ProtectedRoute requiredPermissions={['SUBSCRIPTION_BULK_IMPORT']}>
                <BulkImportPage />
              </ProtectedRoute>
            } />
            <Route path=":id" element={<SubscriptionDetailPage />} />
            <Route path=":id/edit" element={
              <ProtectedRoute requiredPermissions={['SUBSCRIPTION_UPDATE']}>
                <EditSubscriptionPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* User Profile */}
          <Route path="profile" element={<ProfilePage />} />

          {/* User Management (Admin only) */}
          <Route path="users" element={
            <ProtectedRoute requiredPermissions={['USER_READ']}>
              <UsersPage />
            </ProtectedRoute>
          } />

          {/* Role Management (Admin only) */}
          <Route path="roles" element={
            <ProtectedRoute requiredPermissions={['ROLE_READ']}>
              <RolesPage />
            </ProtectedRoute>
          } />

          {/* Audit Logs (Admin only) */}
          <Route path="audit" element={
            <ProtectedRoute requiredPermissions={['AUDIT_READ']}>
              <AuditLogsPage />
            </ProtectedRoute>
          } />

          {/* Settings (Admin only) */}
          <Route path="settings" element={
            <ProtectedRoute requiredPermissions={['SETTINGS_READ']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch all route - 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};