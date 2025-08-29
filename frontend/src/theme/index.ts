/**
 * Material Design 3 Theme System - Main Export
 * Comprehensive design system for SMPP Subscription Management System
 */

// Core Theme System
export * from './tokens';
export * from './colorSystem';
export * from './theme';

// Component Systems
export * from './typography';
export * from './elevation';
export * from './motion';
export * from './accessibility';
export * from './responsive';

// Interactive Components
export { default as ThemeBuilder } from './ThemeBuilder';
export { default as DesignSystemShowcase } from './DesignSystemShowcase';

// Re-export commonly used utilities
export {
  // Theme creation
  createMD3Theme,
  defaultThemeConfigs,
  
  // Color utilities
  generateCustomColorScheme,
  getContrastRatio,
  isAccessible,
  brandColorSchemes,
  
  // Typography components
  TypographyComponents,
  
  // Elevation components
  ElevationComponents,
  
  // Motion components
  MotionComponents,
  
  // Accessibility components
  AccessibilityComponents,
  
  // Responsive components
  ResponsiveComponents,
  useBreakpoint,
  
} from './theme';

// Default theme configurations for quick setup
export const quickThemes = {
  // Light themes
  telecomLight: {
    mode: 'light' as const,
    brandScheme: 'blue' as const,
  },
  
  // Dark themes
  telecomDark: {
    mode: 'dark' as const,
    brandScheme: 'blue' as const,
  },
  
  // High contrast themes
  accessibleLight: {
    mode: 'light' as const,
    brandScheme: 'blue' as const,
    accessibility: {
      highContrast: true,
      largeFonts: true,
    },
  },
  
  accessibleDark: {
    mode: 'dark' as const,
    brandScheme: 'blue' as const,
    accessibility: {
      highContrast: true,
      largeFonts: true,
    },
  },
} as const;