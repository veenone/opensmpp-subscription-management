/**
 * WCAG 2.1 AA Accessibility Utilities
 * Comprehensive accessibility features and compliance tools
 */

import { styled } from '@mui/material/styles';
import { Box, Typography, Button, Link } from '@mui/material';
import { getContrastRatio, isAccessible } from './colorSystem';
import { motionUtils } from './motion';

// WCAG 2.1 AA Compliance Constants
export const WCAG_CONTRAST_RATIOS = {
  AA: {
    normal: 4.5,
    large: 3.0,
  },
  AAA: {
    normal: 7.0,
    large: 4.5,
  },
} as const;

export const WCAG_FONT_SIZES = {
  large: 18, // 18px or larger is considered large text
  bold: 14,  // 14px bold is considered large text
} as const;

// Accessibility utility functions
export const a11yUtils = {
  /**
   * Check if text meets WCAG contrast requirements
   */
  checkContrast: (
    backgroundColor: string,
    textColor: string,
    fontSize: number = 16,
    fontWeight: number = 400,
    level: 'AA' | 'AAA' = 'AA'
  ): {
    isCompliant: boolean;
    ratio: number;
    required: number;
    level: string;
  } => {
    const ratio = getContrastRatio(backgroundColor, textColor);
    const isLargeText = fontSize >= WCAG_FONT_SIZES.large || 
                       (fontSize >= WCAG_FONT_SIZES.bold && fontWeight >= 700);
    const required = WCAG_CONTRAST_RATIOS[level][isLargeText ? 'large' : 'normal'];
    
    return {
      isCompliant: ratio >= required,
      ratio,
      required,
      level: `${level} ${isLargeText ? 'Large' : 'Normal'}`,
    };
  },

  /**
   * Generate high contrast color variant
   */
  generateHighContrast: (baseColor: string, backgroundColor: string): string => {
    const ratio = getContrastRatio(backgroundColor, baseColor);
    if (ratio >= WCAG_CONTRAST_RATIOS.AA.normal) return baseColor;
    
    // If contrast is insufficient, return black or white based on background
    const rgb = backgroundColor.match(/\d+/g);
    if (!rgb) return '#000000';
    
    const luminance = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    return luminance > 128 ? '#000000' : '#ffffff';
  },

  /**
   * Create ARIA label from text content
   */
  createAriaLabel: (text: string, context?: string): string => {
    const cleanText = text.replace(/[^\w\s]/gi, '').trim();
    return context ? `${context}: ${cleanText}` : cleanText;
  },

  /**
   * Generate unique ID for accessibility attributes
   */
  generateA11yId: (prefix: string = 'a11y'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if element should have reduced motion
   */
  shouldReduceMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get appropriate focus ring color
   */
  getFocusRingColor: (backgroundColor: string): string => {
    const ratio = getContrastRatio(backgroundColor, '#0066CC'); // Default focus color
    return ratio >= WCAG_CONTRAST_RATIOS.AA.normal ? '#0066CC' : '#FFD700'; // Gold as high-contrast alternative
  },
};

// Screen reader only content
export const VisuallyHidden = styled('span')({
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
  
  // Show when focused (for skip links)
  '&:focus': {
    position: 'static' as const,
    width: 'auto',
    height: 'auto',
    padding: '0.5rem 1rem',
    margin: 0,
    overflow: 'visible',
    clip: 'auto',
    whiteSpace: 'normal' as const,
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    zIndex: 9999,
  },
});

// High contrast container
export const HighContrastContainer = styled(Box)<{
  highContrast?: boolean;
}>(({ theme, highContrast }) => ({
  ...(highContrast && {
    backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    border: `2px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}`,
    
    '& *': {
      color: 'inherit !important',
      borderColor: 'inherit !important',
    },
    
    '& button, & a': {
      backgroundColor: 'transparent !important',
      border: '2px solid currentColor !important',
      color: 'inherit !important',
      
      '&:hover, &:focus': {
        backgroundColor: 'currentColor !important',
        color: `${theme.palette.mode === 'dark' ? '#000000' : '#ffffff'} !important`,
      },
    },
  }),
}));

// Accessible button with proper focus indicators
export const AccessibleButton = styled(Button)(({ theme }) => {
  const focusColor = a11yUtils.getFocusRingColor(theme.palette.background.default);
  
  return {
    position: 'relative' as const,
    
    // Enhanced focus indicators
    '&:focus-visible': {
      outline: `3px solid ${focusColor}`,
      outlineOffset: '2px',
      boxShadow: `0 0 0 1px ${theme.palette.background.default}, 0 0 0 4px ${focusColor}`,
    },
    
    // High contrast mode adjustments
    '@media (prefers-contrast: high)': {
      border: `2px solid ${theme.palette.text.primary}`,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.text.primary,
        color: theme.palette.background.default,
      },
    },
    
    // Reduced motion considerations
    transition: a11yUtils.shouldReduceMotion() 
      ? 'none' 
      : `all ${theme.customMotion?.duration?.short2 || '150ms'} ease`,
  };
});

// Accessible text with automatic contrast checking
export const AccessibleText = styled(Typography)<{
  backgroundColor?: string;
  autoContrast?: boolean;
  fontSize?: number;
  fontWeight?: number;
}>(({ theme, backgroundColor, autoContrast = true, fontSize = 16, fontWeight = 400 }) => {
  const bgColor = backgroundColor || theme.palette.background.default;
  let textColor = theme.palette.text.primary;
  
  if (autoContrast) {
    const contrast = a11yUtils.checkContrast(bgColor, textColor, fontSize, fontWeight);
    if (!contrast.isCompliant) {
      textColor = a11yUtils.generateHighContrast(textColor, bgColor);
    }
  }
  
  return {
    color: textColor,
    // Ensure text is selectable and readable
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    userSelect: 'text' as const,
    
    // High contrast mode adjustments
    '@media (prefers-contrast: high)': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
      fontWeight: fontWeight < 500 ? 500 : fontWeight,
    },
  };
});

// Skip to content link
export const SkipToContentLink = styled(Link)(({ theme }) => ({
  position: 'absolute' as const,
  top: '-40px',
  left: '6px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: '8px 16px',
  textDecoration: 'none',
  borderRadius: '0 0 4px 4px',
  fontSize: '14px',
  fontWeight: 600,
  zIndex: theme.zIndex?.skipLink || 1600,
  transition: 'top 0.3s ease',
  
  '&:focus': {
    top: '0px',
  },
}));

// Accessible form controls
export const AccessibleFormControl = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  
  '& label': {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
    display: 'block',
    color: theme.palette.text.primary,
  },
  
  '& input, & textarea, & select': {
    fontSize: '16px', // Prevent zoom on iOS
    padding: '12px',
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    transition: 'border-color 0.2s ease',
    
    '&:focus': {
      outline: 'none',
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}40`,
    },
    
    '&:invalid': {
      borderColor: theme.palette.error.main,
    },
  },
  
  '& .error-message': {
    color: theme.palette.error.main,
    fontSize: '14px',
    marginTop: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    
    '&::before': {
      content: '"⚠"',
      fontSize: '16px',
    },
  },
  
  '& .help-text': {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    marginTop: theme.spacing(0.5),
  },
}));

// Landmark regions for screen readers
export const LandmarkRegion = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'landmark',
})<{
  landmark: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary' | 'search' | 'form' | 'region';
  label?: string;
}>(({ landmark, label }) => ({
  // Apply appropriate ARIA role based on landmark type
  role: landmark === 'banner' ? 'banner' :
        landmark === 'navigation' ? 'navigation' :
        landmark === 'main' ? 'main' :
        landmark === 'contentinfo' ? 'contentinfo' :
        landmark === 'complementary' ? 'complementary' :
        landmark === 'search' ? 'search' :
        landmark === 'form' ? 'form' :
        'region',
  
  ...(label && { 'aria-label': label }),
}));

// Focus trap for modals and dialogs
export const FocusTrap = styled(Box)(({ theme }) => ({
  '&[data-focus-trap="true"]': {
    '& :focus-visible': {
      outline: `3px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
  },
}));

// Status announcements for screen readers
export const StatusAnnouncement = styled('div')<{
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}>(({ priority = 'polite', atomic = true }) => ({
  position: 'absolute' as const,
  left: '-10000px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  'aria-live': priority,
  'aria-atomic': atomic,
}));

// Color contrast indicator
export const ContrastIndicator = styled(Box)<{
  backgroundColor: string;
  textColor: string;
  fontSize?: number;
  fontWeight?: number;
  level?: 'AA' | 'AAA';
}>(({ theme, backgroundColor, textColor, fontSize = 16, fontWeight = 400, level = 'AA' }) => {
  const contrast = a11yUtils.checkContrast(backgroundColor, textColor, fontSize, fontWeight, level);
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.25, 0.5),
    backgroundColor: contrast.isCompliant ? theme.palette.success?.main : theme.palette.error.main,
    color: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    fontSize: '12px',
    fontWeight: 500,
    
    '&::before': {
      content: `"${contrast.isCompliant ? '✓' : '✗'}"`,
    },
    
    '&[title]': {
      cursor: 'help',
    },
  };
});

// Accessibility testing utilities
export const a11yTesting = {
  /**
   * Test color contrast for all text elements
   */
  testColorContrasts: (element: HTMLElement): Array<{
    element: HTMLElement;
    result: ReturnType<typeof a11yUtils.checkContrast>;
  }> => {
    const textElements = element.querySelectorAll('*');
    const results: Array<any> = [];
    
    textElements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      const fontSize = parseFloat(computedStyle.fontSize);
      const fontWeight = parseFloat(computedStyle.fontWeight) || 400;
      
      if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
        const result = a11yUtils.checkContrast(backgroundColor, color, fontSize, fontWeight);
        if (!result.isCompliant) {
          results.push({ element: el, result });
        }
      }
    });
    
    return results;
  },

  /**
   * Check for missing alt attributes on images
   */
  checkImageAlts: (element: HTMLElement): HTMLImageElement[] => {
    const images = element.querySelectorAll('img');
    return Array.from(images).filter(img => !img.alt && img.getAttribute('role') !== 'presentation');
  },

  /**
   * Check for proper heading hierarchy
   */
  checkHeadingHierarchy: (element: HTMLElement): Array<{ element: HTMLElement; issue: string }> => {
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: Array<{ element: HTMLElement; issue: string }> = [];
    let previousLevel = 0;
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          element: heading as HTMLElement,
          issue: `Heading level jumps from h${previousLevel} to h${level}`,
        });
      }
      previousLevel = level;
    });
    
    return issues;
  },

  /**
   * Check for keyboard accessibility
   */
  checkKeyboardAccess: (element: HTMLElement): HTMLElement[] => {
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );
    
    return Array.from(interactiveElements).filter((el) => {
      const tabIndex = el.getAttribute('tabindex');
      return tabIndex === '-1' || (el as HTMLElement).style.display === 'none';
    }) as HTMLElement[];
  },
};

// Export all accessibility components and utilities
export const AccessibilityComponents = {
  VisuallyHidden,
  HighContrastContainer,
  AccessibleButton,
  AccessibleText,
  SkipToContentLink,
  AccessibleFormControl,
  LandmarkRegion,
  FocusTrap,
  StatusAnnouncement,
  ContrastIndicator,
};

export { WCAG_CONTRAST_RATIOS, WCAG_FONT_SIZES, a11yUtils, a11yTesting };