import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Button,
  Skeleton,
  Container,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { Subscription } from '../../types/subscription';
import { subscriptionApi } from '../../services/subscriptionService';
import { SubscriptionForm } from '../../components/subscription/SubscriptionForm';
import { useAuth } from '../../contexts/AuthContext';
import { TitleLarge, HeadlineMedium } from '../../theme/typography';
import { AccessibleButton } from '../../theme/accessibility';
import { ResponsiveFlex, useBreakpoint } from '../../theme/responsive';

interface LoadingState {
  subscription: boolean;
  form: boolean;
}

interface ErrorState {
  subscription: string | null;
  permission: string | null;
}

export default function EditSubscriptionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const breakpoint = useBreakpoint();

  // State management
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    subscription: true,
    form: false,
  });
  const [errors, setErrors] = useState<ErrorState>({
    subscription: null,
    permission: null,
  });
  const [showForm, setShowForm] = useState(false);

  // Permission check
  const canEditSubscription = hasPermission('subscriptions:update');

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!id) {
        setErrors(prev => ({
          ...prev,
          subscription: 'Subscription ID is required',
        }));
        setLoading(prev => ({ ...prev, subscription: false }));
        return;
      }

      // Check permissions first
      if (!canEditSubscription) {
        setErrors(prev => ({
          ...prev,
          permission: 'You do not have permission to edit subscriptions',
        }));
        setLoading(prev => ({ ...prev, subscription: false }));
        return;
      }

      try {
        setLoading(prev => ({ ...prev, subscription: true }));
        setErrors({ subscription: null, permission: null });

        const subscriptionData = await subscriptionApi.getSubscriptionById(parseInt(id));
        setSubscription(subscriptionData);
      } catch (error: any) {
        console.error('Failed to fetch subscription:', error);
        
        if (error.status === 404) {
          setErrors(prev => ({
            ...prev,
            subscription: `Subscription with ID "${id}" not found`,
          }));
        } else if (error.status === 403) {
          setErrors(prev => ({
            ...prev,
            permission: 'Access denied: insufficient permissions to view this subscription',
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            subscription: error.message || 'Failed to load subscription data',
          }));
        }
      } finally {
        setLoading(prev => ({ ...prev, subscription: false }));
      }
    };

    fetchSubscription();
  }, [id, canEditSubscription]);

  // Navigation handlers
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToList = () => {
    navigate('/subscriptions');
  };

  const handleGoToDetails = () => {
    if (id) {
      navigate(`/subscriptions/${id}`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Form handlers
  const handleEditClick = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    // Refresh subscription data
    if (id) {
      subscriptionApi.getSubscriptionById(parseInt(id))
        .then(setSubscription)
        .catch(console.error);
    }
  };

  // Render loading state
  if (loading.subscription) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Breadcrumb skeleton */}
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width={300} height={20} />
          </Box>

          {/* Title skeleton */}
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={250} height={40} />
          </Box>

          {/* Content skeleton */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Loading subscription data...
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Render error states
  if (errors.subscription || errors.permission) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="navigation" sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleGoHome}
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={handleGoToList}
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Subscriptions
            </Link>
            <Typography color="text.primary" variant="body2">
              Edit Subscription
            </Typography>
          </Breadcrumbs>

          {/* Title */}
          <TitleLarge
            component="h1"
            gutterBottom
            sx={{ 
              fontWeight: 600,
              mb: 3,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
            }}
          >
            Edit Subscription
          </TitleLarge>

          {/* Error display */}
          <Paper sx={{ p: 3 }}>
            <Alert 
              severity={errors.permission ? "warning" : "error"}
              sx={{ mb: 2 }}
            >
              {errors.permission || errors.subscription}
            </Alert>

            <ResponsiveFlex sx={{ gap: 2, justifyContent: 'flex-start' }}>
              <AccessibleButton
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
              >
                Go Back
              </AccessibleButton>
              <AccessibleButton
                variant="contained"
                startIcon={<ListIcon />}
                onClick={handleGoToList}
              >
                View All Subscriptions
              </AccessibleButton>
            </ResponsiveFlex>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Render success state
  if (subscription) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="navigation" sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleGoHome}
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={handleGoToList}
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Subscriptions
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={handleGoToDetails}
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              {subscription.displayName || subscription.msisdn}
            </Link>
            <Typography color="text.primary" variant="body2">
              Edit
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <ResponsiveFlex sx={{ mb: 3, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <TitleLarge
                component="h1"
                sx={{ 
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                }}
              >
                Edit Subscription
              </TitleLarge>
              <HeadlineMedium
                variant="h6"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
              >
                {subscription.displayName ? (
                  <>
                    {subscription.displayName} ({subscription.msisdn})
                  </>
                ) : (
                  subscription.msisdn
                )}
              </HeadlineMedium>
            </Box>
            
            {breakpoint !== 'xs' && (
              <ResponsiveFlex sx={{ gap: 2, ml: 2 }}>
                <AccessibleButton
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleGoBack}
                >
                  Back
                </AccessibleButton>
              </ResponsiveFlex>
            )}
          </ResponsiveFlex>

          {/* Content */}
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Details
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Click the button below to open the edit form and modify the subscription details.
              </Typography>
              
              {/* Quick info display */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2,
                mt: 2,
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 1,
                textAlign: 'left'
              }}>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    MSISDN
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {subscription.msisdn}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {subscription.status}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {subscription.updatedAt ? new Date(subscription.updatedAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <ResponsiveFlex sx={{ justifyContent: 'center', gap: 2 }}>
              <AccessibleButton
                variant="contained"
                size="large"
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                disabled={!canEditSubscription}
                sx={{ minWidth: 160 }}
              >
                Edit Subscription
              </AccessibleButton>
              {breakpoint === 'xs' && (
                <AccessibleButton
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleGoBack}
                  sx={{ minWidth: 120 }}
                >
                  Back
                </AccessibleButton>
              )}
            </ResponsiveFlex>
          </Paper>

          {/* Subscription Form Dialog */}
          <SubscriptionForm
            open={showForm}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
            subscription={subscription}
            mode="edit"
          />
        </Box>
      </Container>
    );
  }

  // Fallback render (shouldn't reach here)
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Something went wrong. Please try again.
          </Typography>
          <ResponsiveFlex sx={{ justifyContent: 'center', gap: 2, mt: 2 }}>
            <AccessibleButton
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
            >
              Go Back
            </AccessibleButton>
            <AccessibleButton
              variant="contained"
              startIcon={<ListIcon />}
              onClick={handleGoToList}
            >
              View All Subscriptions
            </AccessibleButton>
          </ResponsiveFlex>
        </Paper>
      </Box>
    </Container>
  );
}