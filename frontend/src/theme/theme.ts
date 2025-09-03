/**
 * Material Design 3 Theme System
 * Advanced theming with dynamic color generation and accessibility
 */

import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import {
  lightColorScheme,
  darkColorScheme,
  generateCustomColorScheme,
  ColorScheme,
  brandColorSchemes,
} from './colorSystem';
import {
  typographyTokens,
  elevationTokens,
  shapeTokens,
  motionTokens,
  spacingTokens,
  breakpointTokens,
  zIndexTokens,
  telecomTokens,
} from './tokens';

// Extend MUI theme interface for custom properties
declare module '@mui/material/styles' {
  interface Theme {
    customSpacing: typeof spacingTokens;
    customMotion: typeof motionTokens;
    customElevation: typeof elevationTokens;
    telecom: typeof telecomTokens;
  }

  interface ThemeOptions {
    customSpacing?: typeof spacingTokens;
    customMotion?: typeof motionTokens;
    customElevation?: typeof elevationTokens;
    telecom?: typeof telecomTokens;
  }

  interface Palette {
    tertiary: Palette['primary'];
    warning: Palette['primary'];
    success: Palette['primary'];
    surfaceVariant: Palette['primary'];
    outline: {
      main: string;
      variant: string;
    };
    surface: {
      main: string;
      dim: string;
      bright: string;
      containerLowest: string;
      containerLow: string;
      container: string;
      containerHigh: string;
      containerHighest: string;
      variant: string;
      tint: string;
      inverse: string;
      inverseOnSurface: string;
    };
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    warning?: PaletteOptions['primary'];
    success?: PaletteOptions['primary'];
    surfaceVariant?: PaletteOptions['primary'];
    outline?: {
      main?: string;
      variant?: string;
    };
    surface?: {
      main?: string;
      dim?: string;
      bright?: string;
      containerLowest?: string;
      containerLow?: string;
      container?: string;
      containerHigh?: string;
      containerHighest?: string;
      variant?: string;
      tint?: string;
      inverse?: string;
      inverseOnSurface?: string;
    };
  }

  interface TypographyVariants {
    displayLarge: React.CSSProperties;
    displayMedium: React.CSSProperties;
    displaySmall: React.CSSProperties;
    headlineLarge: React.CSSProperties;
    headlineMedium: React.CSSProperties;
    headlineSmall: React.CSSProperties;
    titleLarge: React.CSSProperties;
    titleMedium: React.CSSProperties;
    titleSmall: React.CSSProperties;
    labelLarge: React.CSSProperties;
    labelMedium: React.CSSProperties;
    labelSmall: React.CSSProperties;
    bodyLarge: React.CSSProperties;
    bodyMedium: React.CSSProperties;
    bodySmall: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    displayLarge?: React.CSSProperties;
    displayMedium?: React.CSSProperties;
    displaySmall?: React.CSSProperties;
    headlineLarge?: React.CSSProperties;
    headlineMedium?: React.CSSProperties;
    headlineSmall?: React.CSSProperties;
    titleLarge?: React.CSSProperties;
    titleMedium?: React.CSSProperties;
    titleSmall?: React.CSSProperties;
    labelLarge?: React.CSSProperties;
    labelMedium?: React.CSSProperties;
    labelSmall?: React.CSSProperties;
    bodyLarge?: React.CSSProperties;
    bodyMedium?: React.CSSProperties;
    bodySmall?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayLarge: true;
    displayMedium: true;
    displaySmall: true;
    headlineLarge: true;
    headlineMedium: true;
    headlineSmall: true;
    titleLarge: true;
    titleMedium: true;
    titleSmall: true;
    labelLarge: true;
    labelMedium: true;
    labelSmall: true;
    bodyLarge: true;
    bodyMedium: true;
    bodySmall: true;
  }
}

export interface ThemeConfig {
  mode: PaletteMode;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  brandScheme?: keyof typeof brandColorSchemes;
  customColors?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
  };
  accessibility?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
    largeFonts?: boolean;
  };
}

/**
 * Create Material Design 3 palette from color scheme
 */
function createMD3Palette(colorScheme: ColorScheme, mode: PaletteMode) {
  return {
    mode,
    primary: {
      main: colorScheme.primary,
      light: mode === 'light' ? colorScheme.primaryContainer : colorScheme.primary,
      dark: mode === 'light' ? colorScheme.primary : colorScheme.primaryContainer,
      contrastText: colorScheme.onPrimary,
    },
    secondary: {
      main: colorScheme.secondary,
      light: mode === 'light' ? colorScheme.secondaryContainer : colorScheme.secondary,
      dark: mode === 'light' ? colorScheme.secondary : colorScheme.secondaryContainer,
      contrastText: colorScheme.onSecondary,
    },
    tertiary: {
      main: colorScheme.tertiary,
      light: mode === 'light' ? colorScheme.tertiaryContainer : colorScheme.tertiary,
      dark: mode === 'light' ? colorScheme.tertiary : colorScheme.tertiaryContainer,
      contrastText: colorScheme.onTertiary,
    },
    error: {
      main: colorScheme.error,
      light: mode === 'light' ? colorScheme.errorContainer : colorScheme.error,
      dark: mode === 'light' ? colorScheme.error : colorScheme.errorContainer,
      contrastText: colorScheme.onError,
    },
    warning: {
      main: colorScheme.warning,
      light: mode === 'light' ? colorScheme.warningContainer : colorScheme.warning,
      dark: mode === 'light' ? colorScheme.warning : colorScheme.warningContainer,
      contrastText: colorScheme.onWarning,
    },
    success: {
      main: colorScheme.success,
      light: mode === 'light' ? colorScheme.successContainer : colorScheme.success,
      dark: mode === 'light' ? colorScheme.success : colorScheme.successContainer,
      contrastText: colorScheme.onSuccess,
    },
    info: {
      main: colorScheme.tertiary,
      light: mode === 'light' ? colorScheme.tertiaryContainer : colorScheme.tertiary,
      dark: mode === 'light' ? colorScheme.tertiary : colorScheme.tertiaryContainer,
      contrastText: colorScheme.onTertiary,
    },
    background: {
      default: colorScheme.background,
      paper: colorScheme.surface,
    },
    surface: {
      main: colorScheme.surface,
      dim: colorScheme.surfaceDim,
      bright: colorScheme.surfaceBright,
      containerLowest: colorScheme.surfaceContainerLowest,
      containerLow: colorScheme.surfaceContainerLow,
      container: colorScheme.surfaceContainer,
      containerHigh: colorScheme.surfaceContainerHigh,
      containerHighest: colorScheme.surfaceContainerHighest,
      variant: colorScheme.surfaceVariant,
      tint: colorScheme.surfaceTint,
      inverse: colorScheme.inverseSurface,
      inverseOnSurface: colorScheme.inverseOnSurface,
    },
    text: {
      primary: colorScheme.onBackground,
      secondary: colorScheme.onSurfaceVariant,
    },
    outline: {
      main: colorScheme.outline,
      variant: colorScheme.outlineVariant,
    },
    action: {
      active: colorScheme.onSurfaceVariant,
      hover: `${colorScheme.onSurface}08`, // 8% opacity
      selected: `${colorScheme.onSurface}12`, // 12% opacity
      disabled: `${colorScheme.onSurface}38`, // 38% opacity
      disabledBackground: `${colorScheme.onSurface}12`, // 12% opacity
      focus: `${colorScheme.onSurface}12`, // 12% opacity
    },
    divider: colorScheme.outlineVariant,
  };
}

/**
 * Create Material Design 3 typography system
 */
function createMD3Typography() {
  return {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    
    // Material Design 3 Typography Scale
    displayLarge: {
      ...typographyTokens.displayLarge,
      '@media (max-width:600px)': {
        fontSize: '48px',
        lineHeight: '56px',
      },
    },
    displayMedium: {
      ...typographyTokens.displayMedium,
      '@media (max-width:600px)': {
        fontSize: '36px',
        lineHeight: '44px',
      },
    },
    displaySmall: {
      ...typographyTokens.displaySmall,
      '@media (max-width:600px)': {
        fontSize: '28px',
        lineHeight: '36px',
      },
    },
    headlineLarge: {
      ...typographyTokens.headlineLarge,
      '@media (max-width:600px)': {
        fontSize: '28px',
        lineHeight: '36px',
      },
    },
    headlineMedium: {
      ...typographyTokens.headlineMedium,
      '@media (max-width:600px)': {
        fontSize: '24px',
        lineHeight: '32px',
      },
    },
    headlineSmall: {
      ...typographyTokens.headlineSmall,
      '@media (max-width:600px)': {
        fontSize: '20px',
        lineHeight: '28px',
      },
    },
    titleLarge: {
      ...typographyTokens.titleLarge,
    },
    titleMedium: {
      ...typographyTokens.titleMedium,
    },
    titleSmall: {
      ...typographyTokens.titleSmall,
    },
    labelLarge: {
      ...typographyTokens.labelLarge,
    },
    labelMedium: {
      ...typographyTokens.labelMedium,
    },
    labelSmall: {
      ...typographyTokens.labelSmall,
    },
    bodyLarge: {
      ...typographyTokens.bodyLarge,
    },
    bodyMedium: {
      ...typographyTokens.bodyMedium,
    },
    bodySmall: {
      ...typographyTokens.bodySmall,
    },
    
    // Standard MUI variants mapped to MD3
    h1: {
      ...typographyTokens.displayLarge,
    },
    h2: {
      ...typographyTokens.displayMedium,
    },
    h3: {
      ...typographyTokens.displaySmall,
    },
    h4: {
      ...typographyTokens.headlineLarge,
    },
    h5: {
      ...typographyTokens.headlineMedium,
    },
    h6: {
      ...typographyTokens.headlineSmall,
    },
    subtitle1: {
      ...typographyTokens.titleLarge,
    },
    subtitle2: {
      ...typographyTokens.titleMedium,
    },
    body1: {
      ...typographyTokens.bodyLarge,
    },
    body2: {
      ...typographyTokens.bodyMedium,
    },
    caption: {
      ...typographyTokens.bodySmall,
    },
    overline: {
      ...typographyTokens.labelSmall,
    },
    button: {
      ...typographyTokens.labelLarge,
      textTransform: 'none' as const,
    },
  };
}

/**
 * Create Material Design 3 component overrides
 */
function createMD3Components(colorScheme: ColorScheme, mode: PaletteMode) {
  return {
    // Global CSS baseline
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${colorScheme.outline} ${colorScheme.surfaceContainer}`,
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: colorScheme.surfaceContainer,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: colorScheme.outline,
          borderRadius: '4px',
          border: `2px solid ${colorScheme.surfaceContainer}`,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: colorScheme.onSurfaceVariant,
        },
        // Focus indicators for accessibility
        '*:focus-visible': {
          outline: `2px solid ${colorScheme.primary}`,
          outlineOffset: '2px',
        },
        // Reduced motion for accessibility
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },

    // Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          borderRadius: shapeTokens.corner.large,
          padding: '10px 24px',
          height: '40px',
          transition: `all ${motionTokens.duration.short2} ${motionTokens.easing.standard}`,
          '&:focus-visible': {
            outline: `2px solid ${colorScheme.primary}`,
            outlineOffset: '2px',
          },
        },
        contained: {
          boxShadow: elevationTokens.level1.boxShadow,
          '&:hover': {
            boxShadow: elevationTokens.level2.boxShadow,
          },
          '&:active': {
            boxShadow: elevationTokens.level1.boxShadow,
          },
        },
        outlined: {
          borderColor: colorScheme.outline,
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: `${colorScheme.primary}08`,
            borderColor: colorScheme.primary,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: `${colorScheme.primary}08`,
          },
        },
      },
    },

    // Floating Action Button
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: elevationTokens.level3.boxShadow,
          '&:hover': {
            boxShadow: elevationTokens.level4.boxShadow,
          },
          '&:active': {
            boxShadow: elevationTokens.level3.boxShadow,
          },
        },
      },
    },

    // Cards
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colorScheme.surfaceContainer,
          borderRadius: shapeTokens.corner.medium,
          boxShadow: elevationTokens.level1.boxShadow,
          border: `1px solid ${colorScheme.outlineVariant}`,
          transition: `all ${motionTokens.duration.short2} ${motionTokens.easing.standard}`,
          '&:hover': {
            boxShadow: elevationTokens.level2.boxShadow,
          },
        },
      },
    },

    // App Bar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colorScheme.surface,
          color: colorScheme.onSurface,
          boxShadow: 'none',
          borderBottom: `1px solid ${colorScheme.outlineVariant}`,
          backdropFilter: 'blur(8px)',
        },
      },
    },

    // Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colorScheme.surfaceContainer,
          borderRight: `1px solid ${colorScheme.outlineVariant}`,
        },
      },
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colorScheme.surfaceContainer,
          color: colorScheme.onSurface,
        },
        elevation1: {
          boxShadow: elevationTokens.level1.boxShadow,
        },
        elevation2: {
          boxShadow: elevationTokens.level2.boxShadow,
        },
        elevation3: {
          boxShadow: elevationTokens.level3.boxShadow,
        },
        elevation4: {
          boxShadow: elevationTokens.level4.boxShadow,
        },
        elevation5: {
          boxShadow: elevationTokens.level5.boxShadow,
        },
      },
    },

    // Text Fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: shapeTokens.corner.extraSmall,
            backgroundColor: colorScheme.surfaceContainerHighest,
            '& fieldset': {
              borderColor: colorScheme.outline,
            },
            '&:hover fieldset': {
              borderColor: colorScheme.onSurfaceVariant,
            },
            '&.Mui-focused fieldset': {
              borderColor: colorScheme.primary,
              borderWidth: '2px',
            },
          },
        },
      },
    },

    // Chips
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: shapeTokens.corner.small,
          backgroundColor: colorScheme.surfaceContainerLow,
          color: colorScheme.onSurface,
          border: `1px solid ${colorScheme.outlineVariant}`,
          '&:hover': {
            backgroundColor: colorScheme.surfaceContainer,
          },
        },
      },
    },

    // Dialogs
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colorScheme.surfaceContainerHigh,
          borderRadius: shapeTokens.corner.extraLarge,
          boxShadow: elevationTokens.level3.boxShadow,
        },
      },
    },

    // Tooltips
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colorScheme.inverseSurface,
          color: colorScheme.inverseOnSurface,
          borderRadius: shapeTokens.corner.extraSmall,
          fontSize: typographyTokens.bodySmall.fontSize,
          fontWeight: typographyTokens.bodySmall.fontWeight,
        },
      },
    },

    // Lists
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: shapeTokens.corner.small,
          marginBottom: '4px',
          '&:hover': {
            backgroundColor: `${colorScheme.onSurface}08`,
          },
          '&.Mui-selected': {
            backgroundColor: `${colorScheme.primary}12`,
            '&:hover': {
              backgroundColor: `${colorScheme.primary}16`,
            },
          },
        },
      },
    },

    // Tabs
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          minHeight: '48px',
          borderRadius: `${shapeTokens.corner.large} ${shapeTokens.corner.large} 0 0`,
          '&.Mui-selected': {
            color: colorScheme.primary,
          },
        },
      },
    },

    // Progress indicators
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: colorScheme.surfaceContainerHighest,
          borderRadius: shapeTokens.corner.full,
        },
        bar: {
          borderRadius: shapeTokens.corner.full,
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: colorScheme.primary,
        },
      },
    },
  };
}

/**
 * Create Material Design 3 theme
 */
export function createMD3Theme(config: ThemeConfig): Theme {
  const { mode, primaryColor, secondaryColor, tertiaryColor, brandScheme, customColors, accessibility } = config;
  
  let colorScheme: ColorScheme;
  
  // Determine color scheme based on configuration
  if (brandScheme && brandColorSchemes[brandScheme]) {
    const brand = brandColorSchemes[brandScheme];
    colorScheme = generateCustomColorScheme(
      brand.primary,
      brand.secondary,
      brand.tertiary,
      mode === 'dark'
    );
  } else if (customColors?.primary || primaryColor) {
    colorScheme = generateCustomColorScheme(
      customColors?.primary || primaryColor!,
      customColors?.secondary || secondaryColor,
      customColors?.tertiary || tertiaryColor,
      mode === 'dark'
    );
  } else {
    colorScheme = mode === 'dark' ? darkColorScheme : lightColorScheme;
  }

  // Apply accessibility modifications
  if (accessibility?.highContrast) {
    // Increase contrast for better accessibility
    colorScheme = {
      ...colorScheme,
      onSurface: mode === 'dark' ? '#ffffff' : '#000000',
      onBackground: mode === 'dark' ? '#ffffff' : '#000000',
    };
  }

  const themeOptions: ThemeOptions = {
    palette: createMD3Palette(colorScheme, mode),
    typography: createMD3Typography(),
    components: createMD3Components(colorScheme, mode),
    breakpoints: {
      values: {
        xs: parseInt(breakpointTokens.xs),
        sm: parseInt(breakpointTokens.sm),
        md: parseInt(breakpointTokens.md),
        lg: parseInt(breakpointTokens.lg),
        xl: parseInt(breakpointTokens.xl),
      },
    },
    zIndex: zIndexTokens,
    shape: {
      borderRadius: parseInt(shapeTokens.corner.small),
    },
    spacing: 8, // Default MUI spacing unit
    customSpacing: spacingTokens,
    customMotion: motionTokens,
    customElevation: elevationTokens,
    telecom: telecomTokens,
  };

  // Apply accessibility modifications to typography
  if (accessibility?.largeFonts) {
    themeOptions.typography = {
      ...themeOptions.typography,
      htmlFontSize: 18, // Increase base font size
    };
  }

  return createTheme(themeOptions);
}

/**
 * Default theme configurations
 */
export const defaultThemeConfigs: Record<string, ThemeConfig> = {
  light: {
    mode: 'light',
  },
  dark: {
    mode: 'dark',
  },
  telecomBlue: {
    mode: 'light',
    brandScheme: 'blue',
  },
  telecomBlueDark: {
    mode: 'dark',
    brandScheme: 'blue',
  },
  accessible: {
    mode: 'light',
    accessibility: {
      highContrast: true,
      largeFonts: true,
      reducedMotion: true,
    },
  },
};

// Create default theme for immediate use
export const theme = createMD3Theme(defaultThemeConfigs.telecomLight);