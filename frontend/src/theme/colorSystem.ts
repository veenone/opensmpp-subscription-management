/**
 * Material Design 3 Color System
 * Dynamic color generation and palette management
 */

import { colorTokens } from './tokens';

export interface ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  warning: string;
  onWarning: string;
  warningContainer: string;
  onWarningContainer: string;
  
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;
  
  background: string;
  onBackground: string;
  
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  
  outline: string;
  outlineVariant: string;
  
  shadow: string;
  scrim: string;
  
  surfaceTint: string;
}

/**
 * Light color scheme following Material Design 3
 */
export const lightColorScheme: ColorScheme = {
  primary: colorTokens.primary[40],
  onPrimary: colorTokens.primary[100],
  primaryContainer: colorTokens.primary[90],
  onPrimaryContainer: colorTokens.primary[10],
  inversePrimary: colorTokens.primary[80],
  
  secondary: colorTokens.secondary[40],
  onSecondary: colorTokens.secondary[100],
  secondaryContainer: colorTokens.secondary[90],
  onSecondaryContainer: colorTokens.secondary[10],
  
  tertiary: colorTokens.tertiary[40],
  onTertiary: colorTokens.tertiary[100],
  tertiaryContainer: colorTokens.tertiary[90],
  onTertiaryContainer: colorTokens.tertiary[10],
  
  error: colorTokens.error[40],
  onError: colorTokens.error[100],
  errorContainer: colorTokens.error[90],
  onErrorContainer: colorTokens.error[10],
  
  warning: colorTokens.warning[40],
  onWarning: colorTokens.warning[100],
  warningContainer: colorTokens.warning[90],
  onWarningContainer: colorTokens.warning[10],
  
  success: colorTokens.success[40],
  onSuccess: colorTokens.success[100],
  successContainer: colorTokens.success[90],
  onSuccessContainer: colorTokens.success[10],
  
  background: colorTokens.neutral[99],
  onBackground: colorTokens.neutral[10],
  
  surface: colorTokens.neutral[99],
  onSurface: colorTokens.neutral[10],
  surfaceVariant: colorTokens.neutralVariant[90],
  onSurfaceVariant: colorTokens.neutralVariant[30],
  inverseSurface: colorTokens.neutral[20],
  inverseOnSurface: colorTokens.neutral[95],
  
  surfaceDim: colorTokens.neutral[87],
  surfaceBright: colorTokens.neutral[98],
  surfaceContainerLowest: colorTokens.neutral[100],
  surfaceContainerLow: colorTokens.neutral[96],
  surfaceContainer: colorTokens.neutral[94],
  surfaceContainerHigh: colorTokens.neutral[92],
  surfaceContainerHighest: colorTokens.neutral[90],
  
  outline: colorTokens.neutralVariant[50],
  outlineVariant: colorTokens.neutralVariant[80],
  
  shadow: colorTokens.neutral[0],
  scrim: colorTokens.neutral[0],
  
  surfaceTint: colorTokens.primary[40],
};

/**
 * Dark color scheme following Material Design 3
 */
export const darkColorScheme: ColorScheme = {
  primary: colorTokens.primary[80],
  onPrimary: colorTokens.primary[20],
  primaryContainer: colorTokens.primary[30],
  onPrimaryContainer: colorTokens.primary[90],
  inversePrimary: colorTokens.primary[40],
  
  secondary: colorTokens.secondary[80],
  onSecondary: colorTokens.secondary[20],
  secondaryContainer: colorTokens.secondary[30],
  onSecondaryContainer: colorTokens.secondary[90],
  
  tertiary: colorTokens.tertiary[80],
  onTertiary: colorTokens.tertiary[20],
  tertiaryContainer: colorTokens.tertiary[30],
  onTertiaryContainer: colorTokens.tertiary[90],
  
  error: colorTokens.error[80],
  onError: colorTokens.error[20],
  errorContainer: colorTokens.error[30],
  onErrorContainer: colorTokens.error[90],
  
  warning: colorTokens.warning[80],
  onWarning: colorTokens.warning[20],
  warningContainer: colorTokens.warning[30],
  onWarningContainer: colorTokens.warning[90],
  
  success: colorTokens.success[80],
  onSuccess: colorTokens.success[20],
  successContainer: colorTokens.success[30],
  onSuccessContainer: colorTokens.success[90],
  
  background: colorTokens.neutral[10],
  onBackground: colorTokens.neutral[90],
  
  surface: colorTokens.neutral[10],
  onSurface: colorTokens.neutral[90],
  surfaceVariant: colorTokens.neutralVariant[30],
  onSurfaceVariant: colorTokens.neutralVariant[80],
  inverseSurface: colorTokens.neutral[90],
  inverseOnSurface: colorTokens.neutral[20],
  
  surfaceDim: colorTokens.neutral[6],
  surfaceBright: colorTokens.neutral[24],
  surfaceContainerLowest: colorTokens.neutral[4],
  surfaceContainerLow: colorTokens.neutral[10],
  surfaceContainer: colorTokens.neutral[12],
  surfaceContainerHigh: colorTokens.neutral[17],
  surfaceContainerHighest: colorTokens.neutral[22],
  
  outline: colorTokens.neutralVariant[60],
  outlineVariant: colorTokens.neutralVariant[30],
  
  shadow: colorTokens.neutral[0],
  scrim: colorTokens.neutral[0],
  
  surfaceTint: colorTokens.primary[80],
};

/**
 * Utility function to convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Utility function to convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Utility function to convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { 
    r: Math.round(r * 255), 
    g: Math.round(g * 255), 
    b: Math.round(b * 255) 
  };
}

/**
 * Utility function to convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Generate a color palette from a seed color
 */
export function generateColorPalette(seedColor: string): Record<number, string> {
  const rgb = hexToRgb(seedColor);
  if (!rgb) return colorTokens.primary;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const palette: Record<number, string> = {};

  // Generate tones from 0 to 100
  const tones = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100];
  
  tones.forEach(tone => {
    const lightness = tone;
    const newRgb = hslToRgb(hsl.h, hsl.s, lightness);
    palette[tone] = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  });

  return palette;
}

/**
 * Generate a custom color scheme from seed colors
 */
export function generateCustomColorScheme(
  primarySeed: string,
  secondarySeed?: string,
  tertiarySeed?: string,
  isDark: boolean = false
): ColorScheme {
  const primaryPalette = generateColorPalette(primarySeed);
  const secondaryPalette = secondarySeed ? generateColorPalette(secondarySeed) : colorTokens.secondary;
  const tertiaryPalette = tertiarySeed ? generateColorPalette(tertiarySeed) : colorTokens.tertiary;

  if (isDark) {
    return {
      ...darkColorScheme,
      primary: primaryPalette[80],
      onPrimary: primaryPalette[20],
      primaryContainer: primaryPalette[30],
      onPrimaryContainer: primaryPalette[90],
      inversePrimary: primaryPalette[40],
      
      secondary: secondaryPalette[80],
      onSecondary: secondaryPalette[20],
      secondaryContainer: secondaryPalette[30],
      onSecondaryContainer: secondaryPalette[90],
      
      tertiary: tertiaryPalette[80],
      onTertiary: tertiaryPalette[20],
      tertiaryContainer: tertiaryPalette[30],
      onTertiaryContainer: tertiaryPalette[90],
      
      surfaceTint: primaryPalette[80],
    };
  } else {
    return {
      ...lightColorScheme,
      primary: primaryPalette[40],
      onPrimary: primaryPalette[100],
      primaryContainer: primaryPalette[90],
      onPrimaryContainer: primaryPalette[10],
      inversePrimary: primaryPalette[80],
      
      secondary: secondaryPalette[40],
      onSecondary: secondaryPalette[100],
      secondaryContainer: secondaryPalette[90],
      onSecondaryContainer: secondaryPalette[10],
      
      tertiary: tertiaryPalette[40],
      onTertiary: tertiaryPalette[100],
      tertiaryContainer: tertiaryPalette[90],
      onTertiaryContainer: tertiaryPalette[10],
      
      surfaceTint: primaryPalette[40],
    };
  }
}

/**
 * Check color contrast ratio for accessibility compliance
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;

  const luminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG accessibility standards
 */
export function isAccessible(
  backgroundColor: string, 
  textColor: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const contrast = getContrastRatio(backgroundColor, textColor);
  
  if (level === 'AAA') {
    return size === 'large' ? contrast >= 4.5 : contrast >= 7;
  } else {
    return size === 'large' ? contrast >= 3 : contrast >= 4.5;
  }
}

/**
 * Predefined brand color schemes for telecommunications
 */
export const brandColorSchemes = {
  blue: {
    primary: '#006397',
    secondary: '#74777c',
    tertiary: '#00696f',
  },
  green: {
    primary: '#006e1c',
    secondary: '#5c5f63',
    tertiary: '#004f54',
  },
  purple: {
    primary: '#6750a4',
    secondary: '#625b71',
    tertiary: '#7d5260',
  },
  orange: {
    primary: '#a46a00',
    secondary: '#74777c',
    tertiary: '#855300',
  },
  red: {
    primary: '#ba1a1a',
    secondary: '#74777c',
    tertiary: '#93000a',
  },
};