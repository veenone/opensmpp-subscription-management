/**
 * Material Design 3 Motion System
 * Comprehensive animation and transition utilities
 */

import { styled, keyframes } from '@mui/material/styles';
import { Box } from '@mui/material';
import { motionTokens } from './tokens';

// Motion duration presets
export const motionDurations = {
  instant: '0ms',
  short: '150ms',
  medium: '300ms',
  long: '500ms',
  extraLong: '700ms',
  ...motionTokens.duration,
} as const;

// Motion easing presets
export const motionEasing = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  ...motionTokens.easing,
} as const;

// Keyframe animations
export const animations = {
  // Entrance animations
  fadeIn: keyframes`
    0% { opacity: 0; }
    100% { opacity: 1; }
  `,
  
  slideInUp: keyframes`
    0% { 
      opacity: 0;
      transform: translateY(20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  `,
  
  slideInDown: keyframes`
    0% { 
      opacity: 0;
      transform: translateY(-20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  `,
  
  slideInLeft: keyframes`
    0% { 
      opacity: 0;
      transform: translateX(-20px);
    }
    100% { 
      opacity: 1;
      transform: translateX(0);
    }
  `,
  
  slideInRight: keyframes`
    0% { 
      opacity: 0;
      transform: translateX(20px);
    }
    100% { 
      opacity: 1;
      transform: translateX(0);
    }
  `,
  
  scaleIn: keyframes`
    0% { 
      opacity: 0;
      transform: scale(0.8);
    }
    100% { 
      opacity: 1;
      transform: scale(1);
    }
  `,
  
  // Loading animations
  pulse: keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  `,
  
  spin: keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `,
  
  bounce: keyframes`
    0%, 20%, 53%, 80%, 100% {
      animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -30px, 0);
    }
    70% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0,-4px,0);
    }
  `,
  
  // Interactive animations
  shake: keyframes`
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  `,
  
  wobble: keyframes`
    0% { transform: translateX(0%); }
    15% { transform: translateX(-25%) rotate(-5deg); }
    30% { transform: translateX(20%) rotate(3deg); }
    45% { transform: translateX(-15%) rotate(-3deg); }
    60% { transform: translateX(10%) rotate(2deg); }
    75% { transform: translateX(-5%) rotate(-1deg); }
    100% { transform: translateX(0%); }
  `,
  
  // Progress animations
  progressBarFill: keyframes`
    0% { width: 0%; }
    100% { width: 100%; }
  `,
  
  // Skeleton loading
  skeletonLoading: keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  `,
  
  // Floating action button animations
  fabScale: keyframes`
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  `,
  
  // Status indicator animations
  statusBlink: keyframes`
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  `,
  
  // Network signal animation
  signalBars: keyframes`
    0% { height: 20%; }
    25% { height: 40%; }
    50% { height: 60%; }
    75% { height: 80%; }
    100% { height: 100%; }
  `,
  
  // Data flow animation
  dataFlow: keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  `,
};

// Animation component utilities
export const AnimatedBox = styled(Box)<{
  animation?: keyof typeof animations;
  duration?: keyof typeof motionDurations;
  easing?: keyof typeof motionEasing;
  delay?: string;
  iterationCount?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}>(({ 
  animation, 
  duration = 'medium', 
  easing = 'standard', 
  delay = '0ms',
  iterationCount = 1,
  direction = 'normal',
  fillMode = 'both'
}) => animation ? ({
  animation: `${animations[animation]} ${motionDurations[duration]} ${motionEasing[easing]} ${delay} ${iterationCount} ${direction} ${fillMode}`,
}) : {});

// Staggered animation container
export const StaggeredContainer = styled(Box)<{
  staggerDelay?: number;
}>(({ staggerDelay = 100 }) => ({
  '& > *': {
    animation: `${animations.slideInUp} ${motionDurations.medium} ${motionEasing.standard} both`,
  },
  '& > *:nth-of-type(1)': { animationDelay: '0ms' },
  '& > *:nth-of-type(2)': { animationDelay: `${staggerDelay}ms` },
  '& > *:nth-of-type(3)': { animationDelay: `${staggerDelay * 2}ms` },
  '& > *:nth-of-type(4)': { animationDelay: `${staggerDelay * 3}ms` },
  '& > *:nth-of-type(5)': { animationDelay: `${staggerDelay * 4}ms` },
  '& > *:nth-of-type(n+6)': { animationDelay: `${staggerDelay * 5}ms` },
}));

// Loading skeleton component
export const SkeletonLoader = styled(Box)<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}>(({ theme, width = '100%', height = '1em', borderRadius = '4px' }) => ({
  width,
  height,
  borderRadius,
  background: `linear-gradient(90deg, ${theme.palette.action?.hover || '#f0f0f0'} 0%, ${theme.palette.action?.selected || '#e0e0e0'} 50%, ${theme.palette.action?.hover || '#f0f0f0'} 100%)`,
  backgroundSize: '200px 100%',
  animation: `${animations.skeletonLoading} 1.2s ease-in-out infinite`,
}));

// Pulsing component for loading states
export const PulsingBox = styled(Box)<{
  pulseColor?: string;
}>(({ theme, pulseColor = theme.palette.primary.main }) => ({
  animation: `${animations.pulse} 2s ${motionEasing.easeInOut} infinite`,
  backgroundColor: pulseColor,
}));

// Rotating component for loading spinners
export const SpinningBox = styled(Box)<{
  speed?: keyof typeof motionDurations;
}>(({ speed = 'long' }) => ({
  animation: `${animations.spin} ${motionDurations[speed]} linear infinite`,
}));

// Floating component for subtle movement
export const FloatingBox = styled(Box)<{
  distance?: number;
  speed?: keyof typeof motionDurations;
}>(({ distance = 10, speed = 'extraLong' }) => ({
  animation: `${keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-${distance}px); }
  `} ${motionDurations[speed]} ${motionEasing.easeInOut} infinite`,
}));

// Morphing component for shape transitions
export const MorphingBox = styled(Box)<{
  fromBorderRadius?: string;
  toBorderRadius?: string;
  duration?: keyof typeof motionDurations;
}>(({ fromBorderRadius = '0px', toBorderRadius = '50%', duration = 'medium' }) => ({
  borderRadius: fromBorderRadius,
  transition: `border-radius ${motionDurations[duration]} ${motionEasing.standard}`,
  '&:hover': {
    borderRadius: toBorderRadius,
  },
}));

// Status indicator with animated dot
export const StatusIndicator = styled(Box)<{
  status?: 'online' | 'offline' | 'warning' | 'error';
  animated?: boolean;
}>(({ theme, status = 'online', animated = true }) => {
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
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: getStatusColor(),
    display: 'inline-block',
    ...(animated && status === 'online' ? {
      animation: `${animations.pulse} 2s ease-in-out infinite`,
    } : {}),
    ...(animated && status === 'error' ? {
      animation: `${animations.statusBlink} 1s ease-in-out infinite`,
    } : {}),
  };
});

// Progress bar with animated fill
export const AnimatedProgressBar = styled(Box)<{
  progress?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  height?: number;
}>(({ theme, progress = 0, color = 'primary', height = 4 }) => ({
  width: '100%',
  height: `${height}px`,
  backgroundColor: theme.palette.action?.hover || '#f0f0f0',
  borderRadius: `${height / 2}px`,
  overflow: 'hidden',
  position: 'relative' as const,
  
  '&::after': {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    backgroundColor: theme.palette[color]?.main || theme.palette.primary.main,
    borderRadius: 'inherit',
    transition: `width ${motionDurations.medium} ${motionEasing.standard}`,
  },
}));

// Parallax scrolling component
export const ParallaxBox = styled(Box)<{
  speed?: number;
}>(({ speed = 0.5 }) => ({
  transform: `translateY(${-window.scrollY * speed}px)`,
  transition: 'transform 0.1s ease-out',
}));

// Transition configurations for common patterns
export const transitionConfigs = {
  // Page transitions
  pageEnter: {
    duration: motionDurations.medium,
    easing: motionEasing.emphasized,
  },
  pageExit: {
    duration: motionDurations.short,
    easing: motionEasing.emphasizedAccelerate,
  },
  
  // Modal transitions
  modalEnter: {
    duration: motionDurations.medium,
    easing: motionEasing.emphasizedDecelerate,
  },
  modalExit: {
    duration: motionDurations.short,
    easing: motionEasing.emphasizedAccelerate,
  },
  
  // Drawer transitions
  drawerEnter: {
    duration: motionDurations.medium,
    easing: motionEasing.standard,
  },
  drawerExit: {
    duration: motionDurations.short,
    easing: motionEasing.standardAccelerate,
  },
  
  // List item transitions
  listItemEnter: {
    duration: motionDurations.short,
    easing: motionEasing.standardDecelerate,
  },
  listItemExit: {
    duration: motionDurations.short,
    easing: motionEasing.standardAccelerate,
  },
};

// Utility functions for motion
export const motionUtils = {
  /**
   * Create a custom transition string
   */
  transition: (
    property: string = 'all',
    duration: keyof typeof motionDurations = 'medium',
    easing: keyof typeof motionEasing = 'standard',
    delay: string = '0ms'
  ) => `${property} ${motionDurations[duration]} ${motionEasing[easing]} ${delay}`,
  
  /**
   * Create multiple transitions
   */
  multiTransition: (transitions: Array<{
    property?: string;
    duration?: keyof typeof motionDurations;
    easing?: keyof typeof motionEasing;
    delay?: string;
  }>) => transitions.map(({ 
    property = 'all', 
    duration = 'medium', 
    easing = 'standard', 
    delay = '0ms' 
  }) => `${property} ${motionDurations[duration]} ${motionEasing[easing]} ${delay}`).join(', '),
  
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  /**
   * Get duration with reduced motion consideration
   */
  safeDuration: (duration: keyof typeof motionDurations) => 
    motionUtils.prefersReducedMotion() ? '0ms' : motionDurations[duration],
    
  /**
   * Create staggered animation delays
   */
  staggerDelay: (index: number, baseDelay: number = 100) => `${index * baseDelay}ms`,
};

// Export all motion components and utilities
export const MotionComponents = {
  AnimatedBox,
  StaggeredContainer,
  SkeletonLoader,
  PulsingBox,
  SpinningBox,
  FloatingBox,
  MorphingBox,
  StatusIndicator,
  AnimatedProgressBar,
  ParallaxBox,
};

