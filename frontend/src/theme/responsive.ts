/**
 * Material Design 3 Responsive Design System
 * Comprehensive responsive utilities and breakpoint management
 */

import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery, Grid, Container, Box } from '@mui/material';
import { breakpointTokens } from './tokens';

// Breakpoint system based on Material Design 3
export const breakpoints = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 600,    // Small devices (landscape phones)
  md: 905,    // Medium devices (tablets)
  lg: 1240,   // Large devices (small laptops)
  xl: 1440,   // Extra large devices (large laptops/desktops)
  xxl: 1920,  // Extra extra large devices (large desktops)
} as const;

// Container max widths for each breakpoint
export const containerMaxWidths = {
  xs: '100%',
  sm: '540px',
  md: '720px', 
  lg: '960px',
  xl: '1140px',
  xxl: '1320px',
} as const;

// Responsive utility functions
export const responsiveUtils = {
  /**
   * Convert px to rem
   */
  pxToRem: (px: number, baseFontSize: number = 16): string => `${px / baseFontSize}rem`,

  /**
   * Convert px to em
   */
  pxToEm: (px: number, baseFontSize: number = 16): string => `${px / baseFontSize}em`,

  /**
   * Generate media query string
   */
  mediaQuery: (minWidth: number, maxWidth?: number): string => {
    if (maxWidth) {
      return `@media (min-width: ${minWidth}px) and (max-width: ${maxWidth - 1}px)`;
    }
    return `@media (min-width: ${minWidth}px)`;
  },

  /**
   * Generate responsive value based on breakpoints
   */
  responsiveValue: <T>(values: Partial<Record<keyof typeof breakpoints, T>>): Record<string, T> => {
    const result: Record<string, T> = {};
    
    Object.entries(values).forEach(([key, value]) => {
      const bp = key as keyof typeof breakpoints;
      const minWidth = breakpoints[bp];
      
      if (minWidth === 0) {
        result['@media (min-width: 0px)'] = value;
      } else {
        result[`@media (min-width: ${minWidth}px)`] = value;
      }
    });
    
    return result;
  },

  /**
   * Generate fluid typography scale
   */
  fluidTypography: (
    minFontSize: number,
    maxFontSize: number,
    minViewportWidth: number = breakpoints.sm,
    maxViewportWidth: number = breakpoints.xl
  ): string => {
    const minSize = responsiveUtils.pxToRem(minFontSize);
    const maxSize = responsiveUtils.pxToRem(maxFontSize);
    const minVw = responsiveUtils.pxToRem(minViewportWidth);
    const maxVw = responsiveUtils.pxToRem(maxViewportWidth);
    
    return `clamp(${minSize}, ${minSize} + (${maxFontSize - minFontSize}) * ((100vw - ${minVw}) / (${maxViewportWidth - minViewportWidth})), ${maxSize})`;
  },

  /**
   * Generate responsive spacing
   */
  responsiveSpacing: (values: Partial<Record<keyof typeof breakpoints, number | string>>) => {
    return responsiveUtils.responsiveValue(values);
  },

  /**
   * Check if current screen size matches breakpoint
   */
  isBreakpoint: (breakpoint: keyof typeof breakpoints): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints[breakpoint];
  },
};

// Custom hooks for responsive behavior
export const useBreakpoint = () => {
  const theme = useTheme();
  
  return {
    xs: useMediaQuery(theme.breakpoints.up('xs')),
    sm: useMediaQuery(theme.breakpoints.up('sm')),
    md: useMediaQuery(theme.breakpoints.up('md')),
    lg: useMediaQuery(theme.breakpoints.up('lg')),
    xl: useMediaQuery(theme.breakpoints.up('xl')),
    
    // Utility functions
    isXs: useMediaQuery(theme.breakpoints.only('xs')),
    isSm: useMediaQuery(theme.breakpoints.only('sm')),
    isMd: useMediaQuery(theme.breakpoints.only('md')),
    isLg: useMediaQuery(theme.breakpoints.only('lg')),
    isXl: useMediaQuery(theme.breakpoints.up('xl')),
    
    // Range queries
    isSmUp: useMediaQuery(theme.breakpoints.up('sm')),
    isMdUp: useMediaQuery(theme.breakpoints.up('md')),
    isLgUp: useMediaQuery(theme.breakpoints.up('lg')),
    isXlUp: useMediaQuery(theme.breakpoints.up('xl')),
    
    isSmDown: useMediaQuery(theme.breakpoints.down('md')),
    isMdDown: useMediaQuery(theme.breakpoints.down('lg')),
    isLgDown: useMediaQuery(theme.breakpoints.down('xl')),
    
    // Mobile/desktop detection
    isMobile: useMediaQuery(theme.breakpoints.down('md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'lg')),
  };
};

// Responsive container component
export const ResponsiveContainer = styled(Container, {
  shouldForwardProp: (prop) => prop !== 'fluid' && prop !== 'padding',
})<{
  fluid?: boolean;
  padding?: Partial<Record<keyof typeof breakpoints, number | string>>;
}>(({ theme, fluid = false, padding }) => ({
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  
  // Apply responsive padding if provided
  ...(padding && responsiveUtils.responsiveValue(padding)),
  
  // Fluid containers don't have max-width constraints
  ...(fluid ? {} : {
    [theme.breakpoints.up('sm')]: {
      maxWidth: containerMaxWidths.sm,
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: containerMaxWidths.md,
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: containerMaxWidths.lg,
      paddingLeft: theme.spacing(5),
      paddingRight: theme.spacing(5),
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: containerMaxWidths.xl,
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(6),
    },
  }),
}));

// Responsive grid system
export const ResponsiveGrid = styled(Grid)<{
  spacing?: Partial<Record<keyof typeof breakpoints, number>>;
}>(({ theme, spacing }) => ({
  // Apply responsive spacing if provided
  ...(spacing && Object.entries(spacing).reduce((acc, [key, value]) => {
    const bp = key as keyof typeof breakpoints;
    const minWidth = breakpoints[bp];
    
    acc[minWidth === 0 ? '@media (min-width: 0px)' : `@media (min-width: ${minWidth}px)`] = {
      '& > .MuiGrid-item': {
        paddingLeft: theme.spacing(value / 2),
        paddingRight: theme.spacing(value / 2),
        paddingTop: theme.spacing(value / 2),
        paddingBottom: theme.spacing(value / 2),
      },
    };
    
    return acc;
  }, {} as Record<string, any>)),
}));

// Responsive flexbox utilities
export const ResponsiveFlex = styled(Box)<{
  direction?: Partial<Record<keyof typeof breakpoints, 'row' | 'column' | 'row-reverse' | 'column-reverse'>>;
  justify?: Partial<Record<keyof typeof breakpoints, 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>>;
  align?: Partial<Record<keyof typeof breakpoints, 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'>>;
  wrap?: Partial<Record<keyof typeof breakpoints, 'nowrap' | 'wrap' | 'wrap-reverse'>>;
  gap?: Partial<Record<keyof typeof breakpoints, number | string>>;
}>(({ theme, direction, justify, align, wrap, gap }) => ({
  display: 'flex',
  
  // Apply responsive flex direction
  ...(direction && responsiveUtils.responsiveValue(
    Object.entries(direction).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { flexDirection: value };
      return acc;
    }, {} as any)
  )),
  
  // Apply responsive justify content
  ...(justify && responsiveUtils.responsiveValue(
    Object.entries(justify).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { justifyContent: value };
      return acc;
    }, {} as any)
  )),
  
  // Apply responsive align items
  ...(align && responsiveUtils.responsiveValue(
    Object.entries(align).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { alignItems: value };
      return acc;
    }, {} as any)
  )),
  
  // Apply responsive flex wrap
  ...(wrap && responsiveUtils.responsiveValue(
    Object.entries(wrap).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { flexWrap: value };
      return acc;
    }, {} as any)
  )),
  
  // Apply responsive gap
  ...(gap && responsiveUtils.responsiveValue(
    Object.entries(gap).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { 
        gap: typeof value === 'number' ? theme.spacing(value) : value 
      };
      return acc;
    }, {} as any)
  )),
}));

// Responsive text component
export const ResponsiveText = styled(Box)<{
  fontSize?: Partial<Record<keyof typeof breakpoints, number | string>>;
  lineHeight?: Partial<Record<keyof typeof breakpoints, number | string>>;
  textAlign?: Partial<Record<keyof typeof breakpoints, 'left' | 'center' | 'right' | 'justify'>>;
}>(({ fontSize, lineHeight, textAlign }) => ({
  // Apply responsive font size
  ...(fontSize && responsiveUtils.responsiveValue(
    Object.entries(fontSize).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { 
        fontSize: typeof value === 'number' ? `${value}px` : value 
      };
      return acc;
    }, {} as any)
  )),
  
  // Apply responsive line height
  ...(lineHeight && responsiveUtils.responsiveValue(
    Object.entries(lineHeight).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { lineHeight: value };
      return acc;
    }, {} as any)
  )),
  
  // Apply responsive text align
  ...(textAlign && responsiveUtils.responsiveValue(
    Object.entries(textAlign).reduce((acc, [key, value]) => {
      acc[key as keyof typeof breakpoints] = { textAlign: value };
      return acc;
    }, {} as any)
  )),
}));

// Responsive visibility utilities
export const HideOn = styled(Box, {
  shouldForwardProp: (prop) => !['xs', 'sm', 'md', 'lg', 'xl'].includes(prop as string),
})<{
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
}>(({ theme, xs, sm, md, lg, xl }) => ({
  // Hide on specified breakpoints
  ...(xs && {
    [theme.breakpoints.only('xs')]: {
      display: 'none !important',
    },
  }),
  ...(sm && {
    [theme.breakpoints.only('sm')]: {
      display: 'none !important',
    },
  }),
  ...(md && {
    [theme.breakpoints.only('md')]: {
      display: 'none !important',
    },
  }),
  ...(lg && {
    [theme.breakpoints.only('lg')]: {
      display: 'none !important',
    },
  }),
  ...(xl && {
    [theme.breakpoints.up('xl')]: {
      display: 'none !important',
    },
  }),
}));

export const ShowOn = styled(Box, {
  shouldForwardProp: (prop) => !['xs', 'sm', 'md', 'lg', 'xl'].includes(prop as string),
})<{
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
}>(({ theme, xs, sm, md, lg, xl }) => ({
  display: 'none',
  
  // Show on specified breakpoints
  ...(xs && {
    [theme.breakpoints.only('xs')]: {
      display: 'block',
    },
  }),
  ...(sm && {
    [theme.breakpoints.only('sm')]: {
      display: 'block',
    },
  }),
  ...(md && {
    [theme.breakpoints.only('md')]: {
      display: 'block',
    },
  }),
  ...(lg && {
    [theme.breakpoints.only('lg')]: {
      display: 'block',
    },
  }),
  ...(xl && {
    [theme.breakpoints.up('xl')]: {
      display: 'block',
    },
  }),
}));

// Mobile-first responsive utilities
export const MobileFirst = {
  /**
   * Apply styles starting from mobile
   */
  from: (breakpoint: keyof typeof breakpoints) => (styles: any) => ({
    [`@media (min-width: ${breakpoints[breakpoint]}px)`]: styles,
  }),
  
  /**
   * Apply styles up to a specific breakpoint
   */
  until: (breakpoint: keyof typeof breakpoints) => (styles: any) => ({
    [`@media (max-width: ${breakpoints[breakpoint] - 1}px)`]: styles,
  }),
  
  /**
   * Apply styles between two breakpoints
   */
  between: (min: keyof typeof breakpoints, max: keyof typeof breakpoints) => (styles: any) => ({
    [`@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`]: styles,
  }),
};

// Responsive image component
export const ResponsiveImage = styled('img')<{
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}>(({ aspectRatio, objectFit = 'cover' }) => ({
  width: '100%',
  height: 'auto',
  display: 'block',
  
  ...(aspectRatio && {
    aspectRatio,
    objectFit,
  }),
  
  // Responsive loading optimization
  '@media (max-width: 768px)': {
    imageRendering: 'auto',
  },
  
  '@media (min-width: 769px)': {
    imageRendering: 'crisp-edges',
  },
}));

// Responsive spacing utilities
export const responsiveSpacing = {
  xs: '4px',
  sm: '8px', 
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

// Common responsive patterns for telecommunications UI
export const telecomResponsivePatterns = {
  /**
   * Dashboard layout - sidebar on desktop, bottom nav on mobile
   */
  dashboardLayout: {
    display: 'flex',
    flexDirection: 'column' as const,
    '@media (min-width: 1024px)': {
      flexDirection: 'row' as const,
    },
  },
  
  /**
   * Data table - horizontal scroll on mobile, full table on desktop
   */
  dataTable: {
    overflowX: 'auto' as const,
    '@media (min-width: 768px)': {
      overflowX: 'visible' as const,
    },
  },
  
  /**
   * Metrics cards - stack on mobile, grid on desktop
   */
  metricsGrid: {
    display: 'grid' as const,
    gridTemplateColumns: '1fr',
    gap: '16px',
    '@media (min-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
  
  /**
   * Form layout - full width on mobile, contained on desktop
   */
  formLayout: {
    width: '100%',
    padding: '16px',
    '@media (min-width: 768px)': {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '32px',
    },
  },
};

// Export all responsive components and utilities
export const ResponsiveComponents = {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveText,
  ResponsiveImage,
  HideOn,
  ShowOn,
};

