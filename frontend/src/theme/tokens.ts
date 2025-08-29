/**
 * Material Design 3 Design Tokens
 * Core design values for consistent theming across the application
 */

// Color Tokens - Material Design 3 Base Colors
export const colorTokens = {
  // Primary Colors (Brand Colors)
  primary: {
    0: '#000000',
    10: '#001d36',
    20: '#003258',
    30: '#004a77',
    40: '#006397',
    50: '#007db8',
    60: '#0098da',
    70: '#4cb4f0',
    80: '#8ccfff',
    90: '#c7e7ff',
    95: '#e3f2ff',
    99: '#fdfcff',
    100: '#ffffff',
  },
  
  // Secondary Colors (Telecommunications accent)
  secondary: {
    0: '#000000',
    10: '#191c20',
    20: '#2e3135',
    30: '#44474b',
    40: '#5c5f63',
    50: '#74777c',
    60: '#8e9196',
    70: '#a8abb0',
    80: '#c4c6cb',
    90: '#e0e2e7',
    95: '#eef0f5',
    99: '#fcfcff',
    100: '#ffffff',
  },

  // Tertiary Colors (Accent for telecommunications)
  tertiary: {
    0: '#000000',
    10: '#002022',
    20: '#00363a',
    30: '#004f54',
    40: '#00696f',
    50: '#00848c',
    60: '#00a0a9',
    70: '#22bcc6',
    80: '#4dd8e2',
    90: '#70f4ff',
    95: '#b3faff',
    99: '#f0fdff',
    100: '#ffffff',
  },

  // Error Colors
  error: {
    0: '#000000',
    10: '#410002',
    20: '#690005',
    30: '#93000a',
    40: '#ba1a1a',
    50: '#de3730',
    60: '#ff5449',
    70: '#ff897d',
    80: '#ffb4ab',
    90: '#ffdad6',
    95: '#ffedea',
    99: '#fffbff',
    100: '#ffffff',
  },

  // Warning Colors
  warning: {
    0: '#000000',
    10: '#291800',
    20: '#452b00',
    30: '#633f00',
    40: '#835400',
    50: '#a46a00',
    60: '#c68200',
    70: '#e89c00',
    80: '#ffb951',
    90: '#ffcc6b',
    95: '#ffe4a3',
    99: '#fffbff',
    100: '#ffffff',
  },

  // Success Colors
  success: {
    0: '#000000',
    10: '#002106',
    20: '#00390d',
    30: '#005313',
    40: '#006e1c',
    50: '#008a24',
    60: '#00a62f',
    70: '#1fc344',
    80: '#4ee05f',
    90: '#6efe7b',
    95: '#a7ff9d',
    99: '#f6fff0',
    100: '#ffffff',
  },

  // Neutral Colors
  neutral: {
    0: '#000000',
    10: '#191c20',
    20: '#2e3135',
    25: '#393c41',
    30: '#44474b',
    35: '#505357',
    40: '#5c5f63',
    50: '#74777c',
    60: '#8e9196',
    70: '#a8abb0',
    80: '#c4c6cb',
    87: '#d3d6db',
    90: '#e0e2e7',
    92: '#e6e8ed',
    94: '#eceff4',
    95: '#eef0f5',
    96: '#f1f3f8',
    98: '#f8f9fe',
    99: '#fcfcff',
    100: '#ffffff',
  },

  // Neutral Variant Colors
  neutralVariant: {
    0: '#000000',
    10: '#16191d',
    20: '#2b2e32',
    25: '#363a3e',
    30: '#414448',
    35: '#4d5054',
    40: '#595c61',
    50: '#717579',
    60: '#8b8e93',
    70: '#a5a9ae',
    80: '#c1c4c9',
    87: '#d0d4d9',
    90: '#dde1e6',
    92: '#e3e7ec',
    94: '#e9edf2',
    95: '#ecf0f5',
    96: '#eff3f8',
    98: '#f6fafb',
    99: '#fafeff',
    100: '#ffffff',
  },
};

// Typography Tokens - Material Design 3 Type Scale
export const typographyTokens = {
  // Display Typography
  displayLarge: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '57px',
    lineHeight: '64px',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '45px',
    lineHeight: '52px',
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '36px',
    lineHeight: '44px',
    letterSpacing: '0px',
  },

  // Headline Typography
  headlineLarge: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '32px',
    lineHeight: '40px',
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '28px',
    lineHeight: '36px',
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '24px',
    lineHeight: '32px',
    letterSpacing: '0px',
  },

  // Title Typography
  titleLarge: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '22px',
    lineHeight: '28px',
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: 'Roboto Medium',
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: 'Roboto Medium',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },

  // Label Typography
  labelLarge: {
    fontFamily: 'Roboto Medium',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: 'Roboto Medium',
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: 'Roboto Medium',
    fontWeight: 500,
    fontSize: '11px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },

  // Body Typography
  bodyLarge: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.4px',
  },
};

// Elevation Tokens - Material Design 3 Elevation System
export const elevationTokens = {
  level0: {
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
  level1: {
    boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  level2: {
    boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  level3: {
    boxShadow: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
    backgroundColor: 'rgba(0, 0, 0, 0.11)',
  },
  level4: {
    boxShadow: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.30)',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  level5: {
    boxShadow: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.30)',
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
  },
};

// Shape Tokens - Material Design 3 Shape System
export const shapeTokens = {
  corner: {
    none: '0px',
    extraSmall: '4px',
    small: '8px',
    medium: '12px',
    large: '16px',
    extraLarge: '28px',
    full: '1000px',
  },
};

// Motion Tokens - Material Design 3 Motion System
export const motionTokens = {
  duration: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
    extraLong1: '700ms',
    extraLong2: '800ms',
    extraLong3: '900ms',
    extraLong4: '1000ms',
  },
  easing: {
    linear: 'cubic-bezier(0.0, 0.0, 1.0, 1.0)',
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  },
};

// Spacing Tokens
export const spacingTokens = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
};

// Breakpoint Tokens - Material Design 3 Responsive Breakpoints
export const breakpointTokens = {
  xs: '0px',
  sm: '600px',
  md: '905px',
  lg: '1240px',
  xl: '1440px',
};

// Z-Index Tokens
export const zIndexTokens = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Telecommunications Industry Specific Tokens
export const telecomTokens = {
  // Network Status Colors
  networkStatus: {
    online: colorTokens.success[60],
    offline: colorTokens.error[60],
    warning: colorTokens.warning[60],
    maintenance: colorTokens.tertiary[60],
    unknown: colorTokens.neutral[60],
  },
  
  // Signal Strength Colors
  signalStrength: {
    excellent: colorTokens.success[60],
    good: colorTokens.success[70],
    fair: colorTokens.warning[60],
    poor: colorTokens.error[70],
    noSignal: colorTokens.error[60],
  },

  // Data Usage Colors
  dataUsage: {
    low: colorTokens.success[60],
    medium: colorTokens.warning[60],
    high: colorTokens.error[70],
    critical: colorTokens.error[60],
  },
};