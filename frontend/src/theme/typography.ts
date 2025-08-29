/**
 * Material Design 3 Typography System
 * Comprehensive typography utilities and responsive text components
 */

import { styled } from '@mui/material/styles';
import { Typography, TypographyProps } from '@mui/material';
import { typographyTokens } from './tokens';

// Typography utility functions
export const typographyUtils = {
  /**
   * Calculate responsive font size based on viewport width
   */
  responsiveSize: (baseSize: number, scale: number = 0.1): string => {
    const minSize = baseSize * 0.75;
    const maxSize = baseSize * 1.25;
    return `clamp(${minSize}px, ${baseSize}px + ${scale}vw, ${maxSize}px)`;
  },

  /**
   * Create fluid line height based on font size
   */
  fluidLineHeight: (fontSize: number): number => {
    return Math.round(fontSize * 1.4);
  },

  /**
   * Calculate optimal letter spacing for readability
   */
  optimalLetterSpacing: (fontSize: number): string => {
    if (fontSize >= 32) return '-0.01em';
    if (fontSize >= 24) return '0em';
    if (fontSize >= 16) return '0.01em';
    return '0.02em';
  },

  /**
   * Get contrast ratio for text on background
   */
  getTextContrast: (backgroundColor: string): 'light' | 'dark' => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'dark' : 'light';
  },
};

// Styled Typography Components
export const DisplayLarge = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.displayLarge,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '48px',
    lineHeight: '56px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '40px',
    lineHeight: '48px',
  },
}));

export const DisplayMedium = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.displayMedium,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '36px',
    lineHeight: '44px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '32px',
    lineHeight: '40px',
  },
}));

export const DisplaySmall = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.displaySmall,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '28px',
    lineHeight: '36px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '24px',
    lineHeight: '32px',
  },
}));

export const HeadlineLarge = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.headlineLarge,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: {
    fontSize: '28px',
    lineHeight: '36px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '24px',
    lineHeight: '32px',
  },
}));

export const HeadlineMedium = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.headlineMedium,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: {
    fontSize: '24px',
    lineHeight: '32px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '20px',
    lineHeight: '28px',
  },
}));

export const HeadlineSmall = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.headlineSmall,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '20px',
    lineHeight: '28px',
  },
}));

export const TitleLarge = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.titleLarge,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

export const TitleMedium = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.titleMedium,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

export const TitleSmall = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.titleSmall,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const BodyLarge = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.bodyLarge,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  lineHeight: 1.6, // Improved readability
}));

export const BodyMedium = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.bodyMedium,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  lineHeight: 1.5,
}));

export const BodySmall = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.bodySmall,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  lineHeight: 1.4,
}));

export const LabelLarge = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.labelLarge,
  color: theme.palette.text.primary,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}));

export const LabelMedium = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.labelMedium,
  color: theme.palette.text.secondary,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
}));

export const LabelSmall = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...typographyTokens.labelSmall,
  color: theme.palette.text.secondary,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
}));

// Specialized Typography Components for Telecommunications
export const MonospaceText = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontFamily: '"Roboto Mono", "Consolas", "Monaco", monospace',
  fontSize: '14px',
  lineHeight: 1.4,
  backgroundColor: theme.palette.surface?.containerLow || theme.palette.grey[100],
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
}));

export const StatusText = styled(Typography)<
  TypographyProps & { status?: 'online' | 'offline' | 'warning' | 'error' | 'neutral' }
>(({ theme, status = 'neutral' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return theme.palette.success?.main || '#4caf50';
      case 'offline':
        return theme.palette.error?.main || '#f44336';
      case 'warning':
        return theme.palette.warning?.main || '#ff9800';
      case 'error':
        return theme.palette.error?.main || '#f44336';
      default:
        return theme.palette.text.secondary;
    }
  };

  return {
    ...typographyTokens.labelMedium,
    color: getStatusColor(),
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    '&::before': {
      content: '""',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: getStatusColor(),
      display: 'inline-block',
    },
  };
});

export const MetricText = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontFamily: '"Roboto Mono", monospace',
  fontSize: '18px',
  fontWeight: 600,
  color: theme.palette.primary.main,
  textAlign: 'center' as const,
  display: 'block',
}));

export const DataText = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontFamily: '"Roboto Mono", monospace',
  fontSize: '12px',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.surface?.containerLowest || theme.palette.grey[50],
  padding: theme.spacing(0.25, 0.5),
  borderRadius: '4px',
  display: 'inline-block',
  border: `1px solid ${theme.palette.divider}`,
}));

// Typography Scale Hook
export const useTypographyScale = () => {
  const scale = {
    displayLarge: { fontSize: 57, lineHeight: 64, weight: 400 },
    displayMedium: { fontSize: 45, lineHeight: 52, weight: 400 },
    displaySmall: { fontSize: 36, lineHeight: 44, weight: 400 },
    headlineLarge: { fontSize: 32, lineHeight: 40, weight: 400 },
    headlineMedium: { fontSize: 28, lineHeight: 36, weight: 400 },
    headlineSmall: { fontSize: 24, lineHeight: 32, weight: 400 },
    titleLarge: { fontSize: 22, lineHeight: 28, weight: 500 },
    titleMedium: { fontSize: 16, lineHeight: 24, weight: 500 },
    titleSmall: { fontSize: 14, lineHeight: 20, weight: 500 },
    labelLarge: { fontSize: 14, lineHeight: 20, weight: 500 },
    labelMedium: { fontSize: 12, lineHeight: 16, weight: 500 },
    labelSmall: { fontSize: 11, lineHeight: 16, weight: 500 },
    bodyLarge: { fontSize: 16, lineHeight: 24, weight: 400 },
    bodyMedium: { fontSize: 14, lineHeight: 20, weight: 400 },
    bodySmall: { fontSize: 12, lineHeight: 16, weight: 400 },
  };

  return scale;
};

// Reading experience optimization
export const ReadingContainer = styled('div')(({ theme }) => ({
  maxWidth: '65ch', // Optimal reading line length
  lineHeight: 1.6,
  '& p': {
    marginBottom: theme.spacing(2),
  },
  '& p:last-child': {
    marginBottom: 0,
  },
  // Improve text rendering
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
}));

// Text truncation utilities
export const TruncatedText = styled(Typography)<
  TypographyProps & { lines?: number }
>(({ lines = 1 }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical' as const,
  wordBreak: 'break-word',
}));

// Keyboard shortcut display
export const KeyboardShortcut = styled('span')(({ theme }) => ({
  display: 'inline-block',
  padding: theme.spacing(0.25, 0.5),
  fontSize: '11px',
  fontFamily: '"Roboto Mono", monospace',
  backgroundColor: theme.palette.surface?.containerHighest || theme.palette.grey[200],
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  boxShadow: `0 1px 2px ${theme.palette.action?.disabled || 'rgba(0,0,0,0.1)'}`,
  minWidth: '24px',
  textAlign: 'center' as const,
}));

// Export all typography components
export const TypographyComponents = {
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  HeadlineLarge,
  HeadlineMedium,
  HeadlineSmall,
  TitleLarge,
  TitleMedium,
  TitleSmall,
  BodyLarge,
  BodyMedium,
  BodySmall,
  LabelLarge,
  LabelMedium,
  LabelSmall,
  MonospaceText,
  StatusText,
  MetricText,
  DataText,
  ReadingContainer,
  TruncatedText,
  KeyboardShortcut,
};