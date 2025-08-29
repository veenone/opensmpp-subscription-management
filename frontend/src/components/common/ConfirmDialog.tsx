import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Close,
} from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const variantConfig = {
  info: {
    icon: Info,
    color: 'info.main',
    confirmButtonColor: 'primary' as const,
  },
  warning: {
    icon: Warning,
    color: 'warning.main',
    confirmButtonColor: 'warning' as const,
  },
  error: {
    icon: Error,
    color: 'error.main',
    confirmButtonColor: 'error' as const,
  },
  success: {
    icon: CheckCircle,
    color: 'success.main',
    confirmButtonColor: 'success' as const,
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
  loading = false,
  maxWidth = 'sm',
  showCloseButton = true,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pr: showCloseButton ? 6 : 3,
        }}
      >
        <IconComponent sx={{ color: config.color, fontSize: 28 }} />
        <Typography variant="h6" component="span">
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={handleCancel}
            disabled={loading}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          component="div"
          sx={{
            color: 'text.primary',
            '& .MuiTypography-root': {
              mb: 1,
            },
          }}
        >
          {typeof message === 'string' ? (
            <Typography>{message}</Typography>
          ) : (
            message
          )}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="outlined"
          size="large"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          color={config.confirmButtonColor}
          variant="contained"
          size="large"
          autoFocus
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'info' | 'warning' | 'error' | 'success';
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    open: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: () => {},
  });

  const showConfirm = (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'info' | 'warning' | 'error' | 'success';
    confirmText?: string;
    cancelText?: string;
  }) => {
    setDialogState({
      open: true,
      variant: 'warning',
      ...config,
    });
  };

  const hideConfirm = () => {
    setDialogState(prev => ({ ...prev, open: false }));
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      {...dialogState}
      onCancel={hideConfirm}
    />
  );

  return {
    showConfirm,
    hideConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
};
