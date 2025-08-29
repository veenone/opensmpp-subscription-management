import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Collapse,
} from '@mui/material';
import { ErrorOutline, Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Send error to monitoring service
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
  };

  handleToggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
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
                textAlign: 'center',
                borderRadius: 2,
                maxWidth: 600,
                width: '100%',
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />

              <Typography variant="h4" gutterBottom color="error">
                Something went wrong
              </Typography>

              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                We're sorry, but an unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </Typography>

              {import.meta.env.DEV && this.state.error && (
                <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                  <AlertTitle>Error Details (Development Mode)</AlertTitle>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {this.state.error.message}
                  </Typography>
                  
                  <Button
                    size="small"
                    startIcon={<BugReport />}
                    onClick={this.handleToggleDetails}
                    sx={{ mt: 1 }}
                  >
                    {this.state.showDetails ? 'Hide' : 'Show'} Stack Trace
                  </Button>

                  <Collapse in={this.state.showDetails}>
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: 'grey.100',
                        borderRadius: 1,
                        maxHeight: 300,
                        overflow: 'auto',
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                        }}
                      >
                        {this.state.error.stack}
                      </Typography>

                      {this.state.errorInfo && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                            Component Stack:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              whiteSpace: 'pre-wrap',
                              margin: 0,
                            }}
                          >
                            {this.state.errorInfo.componentStack}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Collapse>
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={this.handleRetry}
                  startIcon={<Refresh />}
                >
                  Try Again
                </Button>
                <Button
                  variant="contained"
                  onClick={this.handleReload}
                  startIcon={<Refresh />}
                >
                  Reload Page
                </Button>
              </Box>

              {import.meta.env.PROD && (
                <Typography
                  variant="body2"
                  sx={{ mt: 3, color: 'text.secondary' }}
                >
                  Error ID: {Date.now().toString(36).toUpperCase()}
                </Typography>
              )}
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}