/**
 * Material Design 3 Elevation System
 * Comprehensive elevation and shadow utilities
 */

import { styled, keyframes } from '@mui/material/styles';
import { Box, Paper, Card } from '@mui/material';
import { elevationTokens, motionTokens } from './tokens';

// Elevation levels with Material Design 3 specifications
export const elevationLevels = {
  0: {
    boxShadow: 'none',
    borderColor: 'transparent',
  },
  1: {
    boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  2: {
    boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  3: {
    boxShadow: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  4: {
    boxShadow: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.30)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  5: {
    boxShadow: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.30)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
} as const;

// Elevation utility functions
export const elevationUtils = {
  /**
   * Get elevation styles for a specific level
   */
  getElevation: (level: keyof typeof elevationLevels) => elevationLevels[level],

  /**
   * Create custom elevation with specific blur and spread
   */
  customElevation: (
    offsetY: number,
    blur: number,
    spread: number,
    opacity: number = 0.15
  ) => ({
    boxShadow: `0px ${offsetY}px ${blur}px ${spread}px rgba(0, 0, 0, ${opacity})`,
  }),

  /**
   * Create colored elevation (for brand-specific shadows)
   */
  coloredElevation: (
    level: keyof typeof elevationLevels,
    color: string,
    opacity: number = 0.2
  ) => {
    const baseElevation = elevationLevels[level];
    return {
      boxShadow: baseElevation.boxShadow.replace(/rgba\(0, 0, 0, [\d.]+\)/g, 
        `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
      ),
    };
  },

  /**
   * Create inset elevation (for pressed states)
   */
  insetElevation: (level: number = 1) => ({
    boxShadow: `inset 0px ${level}px ${level * 2}px rgba(0, 0, 0, 0.1)`,
  }),
};

// Animated elevation components
const elevationAnimation = keyframes`
  0% {
    box-shadow: none;
  }
  100% {
    box-shadow: 0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30);
  }
`;

export const AnimatedElevationBox = styled(Box)<{
  elevation?: keyof typeof elevationLevels;
  hoverElevation?: keyof typeof elevationLevels;
  duration?: keyof typeof motionTokens.duration;
}>(({ theme, elevation = 1, hoverElevation, duration = 'short2' }) => ({
  ...elevationLevels[elevation],
  transition: `box-shadow ${motionTokens.duration[duration]} ${motionTokens.easing.standard}`,
  '&:hover': hoverElevation ? {
    ...elevationLevels[hoverElevation],
  } : undefined,
}));

export const FloatingCard = styled(Card)<{
  floating?: boolean;
  hoverFloat?: boolean;
}>(({ theme, floating = false, hoverFloat = true }) => ({
  ...elevationLevels[floating ? 2 : 1],
  transition: `all ${motionTokens.duration.medium1} ${motionTokens.easing.standard}`,
  '&:hover': hoverFloat ? {
    ...elevationLevels[3],
    transform: 'translateY(-2px)',
  } : undefined,
}));

export const DropShadowContainer = styled(Box)<{
  level?: keyof typeof elevationLevels;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
}>(({ theme, level = 2, color }) => {
  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning?.main || '#ff9800';
      case 'success':
        return theme.palette.success?.main || '#4caf50';
      default:
        return 'rgba(0, 0, 0, 0.15)';
    }
  };

  const shadowColor = color ? getColorValue() : undefined;
  
  return {
    ...(shadowColor 
      ? elevationUtils.coloredElevation(level, shadowColor, 0.2)
      : elevationLevels[level]
    ),
    transition: `box-shadow ${motionTokens.duration.short4} ${motionTokens.easing.standard}`,
  };
});

// Surface tint overlay (Material Design 3 feature)
export const SurfaceTintOverlay = styled(Box)<{
  tintColor?: string;
  opacity?: number;
}>(({ theme, tintColor, opacity = 0.05 }) => ({
  position: 'relative' as const,
  '&::before': {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tintColor || theme.palette.primary.main,
    opacity,
    borderRadius: 'inherit',
    pointerEvents: 'none' as const,
    zIndex: 0,
  },
  '& > *': {
    position: 'relative' as const,
    zIndex: 1,
  },
}));

// Elevation state management
export interface ElevationState {
  rest: keyof typeof elevationLevels;
  hover: keyof typeof elevationLevels;
  focus: keyof typeof elevationLevels;
  pressed: keyof typeof elevationLevels;
  dragged: keyof typeof elevationLevels;
}

export const elevationStates = {
  button: {
    rest: 1,
    hover: 2,
    focus: 1,
    pressed: 0,
    dragged: 4,
  } as ElevationState,
  card: {
    rest: 1,
    hover: 2,
    focus: 1,
    pressed: 1,
    dragged: 3,
  } as ElevationState,
  fab: {
    rest: 3,
    hover: 4,
    focus: 3,
    pressed: 2,
    dragged: 5,
  } as ElevationState,
  dialog: {
    rest: 3,
    hover: 3,
    focus: 3,
    pressed: 3,
    dragged: 5,
  } as ElevationState,
  drawer: {
    rest: 2,
    hover: 2,
    focus: 2,
    pressed: 2,
    dragged: 4,
  } as ElevationState,
  appBar: {
    rest: 0,
    hover: 0,
    focus: 0,
    pressed: 0,
    dragged: 0,
  } as ElevationState,
} as const;

export const InteractiveElevationBox = styled(Box)<{
  component?: keyof typeof elevationStates;
  disabled?: boolean;
}>(({ theme, component = 'card', disabled = false }) => {
  const states = elevationStates[component];
  
  return {
    ...elevationLevels[states.rest],
    transition: `all ${motionTokens.duration.short2} ${motionTokens.easing.standard}`,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    
    ...(disabled ? {} : {
      '&:hover': {
        ...elevationLevels[states.hover],
      },
      '&:focus-visible': {
        ...elevationLevels[states.focus],
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
      },
      '&:active': {
        ...elevationLevels[states.pressed],
      },
      '&[data-dragging="true"]': {
        ...elevationLevels[states.dragged],
      },
    }),
  };
});

// Glassmorphism effect (modern elevation alternative)
export const GlassmorphismContainer = styled(Box)<{
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
}>(({ theme, blur = 10, opacity = 0.1, borderOpacity = 0.2 }) => ({
  background: `${theme.palette.background.paper}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: `1px solid ${theme.palette.divider}${Math.round(borderOpacity * 255).toString(16).padStart(2, '0')}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: elevationLevels[1].boxShadow,
  position: 'relative' as const,
  
  '&::before': {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.palette.background.paper}40, transparent)`,
    borderRadius: 'inherit',
    pointerEvents: 'none' as const,
  },
}));

// Neumorphism effect (alternative elevation style)
export const NeumorphicContainer = styled(Box)<{
  inset?: boolean;
  intensity?: number;
}>(({ theme, inset = false, intensity = 1 }) => {
  const isDark = theme.palette.mode === 'dark';
  const baseColor = isDark ? '#1e1e1e' : '#f0f0f0';
  const lightShadow = isDark ? '#2a2a2a' : '#ffffff';
  const darkShadow = isDark ? '#0a0a0a' : '#d1d1d1';
  
  const shadowDistance = 8 * intensity;
  const blurRadius = 16 * intensity;
  
  return {
    backgroundColor: baseColor,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: inset 
      ? `inset ${shadowDistance}px ${shadowDistance}px ${blurRadius}px ${darkShadow}, 
         inset -${shadowDistance}px -${shadowDistance}px ${blurRadius}px ${lightShadow}`
      : `${shadowDistance}px ${shadowDistance}px ${blurRadius}px ${darkShadow}, 
         -${shadowDistance}px -${shadowDistance}px ${blurRadius}px ${lightShadow}`,
    transition: `box-shadow ${motionTokens.duration.short4} ${motionTokens.easing.standard}`,
  };
});

// Ripple effect for Material Design interactions
const rippleKeyframes = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

export const RippleEffect = styled('span')(({ theme }) => ({
  position: 'absolute' as const,
  borderRadius: '50%',
  transform: 'scale(0)',
  animation: `${rippleKeyframes} 600ms linear`,
  backgroundColor: `${theme.palette.action?.active || theme.palette.text.primary}40`,
}));

// Export all elevation components and utilities
export const ElevationComponents = {
  AnimatedElevationBox,
  FloatingCard,
  DropShadowContainer,
  SurfaceTintOverlay,
  InteractiveElevationBox,
  GlassmorphismContainer,
  NeumorphicContainer,
  RippleEffect,
};

export { elevationLevels, elevationUtils, elevationStates };