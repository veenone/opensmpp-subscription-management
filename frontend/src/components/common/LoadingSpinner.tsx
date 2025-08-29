import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  LinearProgress,
} from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  overlay?: boolean;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 40,
  overlay = false,
  fullScreen = false,
  color = 'primary',
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
        ...(fullScreen && {
          minHeight: '100vh',
          width: '100vw',
        }),
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary" align="center">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        open={true}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

interface LoadingBarProps {
  message?: string;
  progress?: number;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  message = 'Loading...',
  progress,
}) => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {message}
        </Typography>
      )}
      <LinearProgress
        variant={progress !== undefined ? 'determinate' : 'indeterminate'}
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
        }}
      />
      {progress !== undefined && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {Math.round(progress)}%
        </Typography>
      )}
    </Box>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading page...',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        p: 3,
      }}
    >
      <CircularProgress size={48} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

interface InlineLoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'medium',
  message,
}) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
      }}
    >
      <CircularProgress size={sizeMap[size]} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};