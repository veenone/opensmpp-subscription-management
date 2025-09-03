import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Phone,
  Login as LoginIcon,
  Security,
} from '@mui/icons-material';
import { FormTextField } from '../../components/forms/FormTextField';
import { FormSelect } from '../../components/forms/FormSelect';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';
import JwtTest from '../../components/JwtTest';
import { AuthDebugTest } from '../../components/AuthDebugTest';

interface LoginFormData extends LoginRequest {
  rememberMe: boolean;
}

const authProviderOptions = [
  { value: 'DATABASE', label: 'Database' },
  { value: 'LDAP', label: 'LDAP / Active Directory' },
  { value: 'OAUTH2', label: 'OAuth 2.0' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { mode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
      provider: 'DATABASE',
      rememberMe: false,
    },
  });

  const from = (location.state as any)?.from || '/';

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      setIsLoading(true);
      
      await login({
        username: data.username,
        password: data.password,
        provider: data.provider,
        rememberMe: data.rememberMe,
      });

      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: mode === 'light' ? '#f5f5f5' : '#121212',
        backgroundImage: mode === 'light' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                mb: 2,
              }}
            >
              <Phone fontSize="large" />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              SMPP Manager
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Subscription Management System
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Error Alert */}
              {loginError && (
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                  {loginError}
                </Alert>
              )}

              {/* Authentication Provider */}
              <FormSelect
                name="provider"
                control={control}
                label="Authentication Provider"
                options={authProviderOptions}
                emptyOption={false}
                helpText="Select your authentication method"
                rules={{ required: 'Please select an authentication provider' }}
              />

              {/* Username */}
              <FormTextField
                name="username"
                control={control}
                label="Username"
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                fullWidth
                rules={{
                  required: 'Username is required',
                  minLength: {
                    value: 2,
                    message: 'Username must be at least 2 characters',
                  },
                }}
              />

              {/* Password */}
              <FormTextField
                name="password"
                control={control}
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                fullWidth
                showPassword
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
              />

              {/* Remember Me */}
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    color="primary"
                    defaultChecked={false}
                  />
                }
                label="Remember me for 7 days"
                sx={{ alignSelf: 'flex-start' }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || isSubmitting}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <LoginIcon />
                  )
                }
                sx={{
                  py: 1.5,
                  mt: 2,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Need Help?
            </Typography>
          </Divider>

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Link href="#" underline="hover" sx={{ mr: 2 }}>
              Forgot Password?
            </Link>
            <Link href="#" underline="hover">
              Contact Support
            </Link>
          </Box>

          {/* Security Notice */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Security color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Your connection is secured with enterprise-grade encryption
            </Typography>
          </Box>
        </Paper>

        {/* Environment Info */}
        {import.meta.env.DEV && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Development Mode - Default credentials: admin/admin123
            </Typography>
          </Box>
        )}

        {/* JWT Test Component (Development Only) */}
        {import.meta.env.DEV && (
          <Box sx={{ mt: 2 }}>
            <JwtTest />
          </Box>
        )}

        {/* Auth Debug Test Component (Development Only) */}
        {import.meta.env.DEV && (
          <Box sx={{ mt: 2 }}>
            <AuthDebugTest />
          </Box>
        )}
      </Container>
    </Box>
  );
}