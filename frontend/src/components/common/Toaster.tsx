import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Snackbar,
  Alert,
  AlertColor,
  Slide,
  SlideProps,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface ToastMessage {
  id: string;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
  action?: ReactNode;
}

interface ToastContextType {
  showToast: (message: string, severity: AlertColor, options?: Partial<ToastMessage>) => void;
  success: (message: string, options?: Partial<ToastMessage>) => void;
  error: (message: string, options?: Partial<ToastMessage>) => void;
  warning: (message: string, options?: Partial<ToastMessage>) => void;
  info: (message: string, options?: Partial<ToastMessage>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const showToast = useCallback((
    message: string,
    severity: AlertColor,
    options: Partial<ToastMessage> = {}
  ) => {
    const id = generateId();
    const newToast: ToastMessage = {
      id,
      message,
      severity,
      autoHideDuration: 5000,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast if autoHideDuration is set
    if (newToast.autoHideDuration) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.autoHideDuration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast(message, 'success', options);
  }, [showToast]);

  const error = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast(message, 'error', { autoHideDuration: 8000, ...options });
  }, [showToast]);

  const warning = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast(message, 'warning', { autoHideDuration: 6000, ...options });
  }, [showToast]);

  const info = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast(message, 'info', options);
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    success,
    error,
    warning,
    info,
    hideToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.autoHideDuration}
          onClose={() => hideToast(toast.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiSnackbar-root': {
              position: 'static',
            },
          }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            action={
              toast.action || (
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => hideToast(toast.id)}
                >
                  <Close fontSize="small" />
                </IconButton>
              )
            }
            sx={{
              minWidth: 300,
              maxWidth: 500,
              '& .MuiAlert-message': {
                wordBreak: 'break-word',
              },
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

// Global toast instance for use outside of React components
let globalToastContext: ToastContextType | null = null;

export const setGlobalToastContext = (context: ToastContextType) => {
  globalToastContext = context;
};

export const toast = {
  success: (message: string, options?: Partial<ToastMessage>) => {
    globalToastContext?.success(message, options);
  },
  error: (message: string, options?: Partial<ToastMessage>) => {
    globalToastContext?.error(message, options);
  },
  warning: (message: string, options?: Partial<ToastMessage>) => {
    globalToastContext?.warning(message, options);
  },
  info: (message: string, options?: Partial<ToastMessage>) => {
    globalToastContext?.info(message, options);
  },
};

export const Toaster: React.FC = () => {
  const toastContext = useToast();

  React.useEffect(() => {
    setGlobalToastContext(toastContext);
    return () => setGlobalToastContext(null as any);
  }, [toastContext]);

  return null;
};