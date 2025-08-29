# Material Design 3 Theme System

A comprehensive Material Design 3 implementation for the SMPP Subscription Management System with advanced theming capabilities, accessibility features, and telecommunications-specific components.

## Features

- ✨ **Material Design 3**: Full implementation of Google's latest design system
- 🎨 **Dynamic Color System**: Automatic color generation from seed colors
- 🌓 **Dark/Light Mode**: Seamless theme switching with system preference detection
- ♿ **WCAG 2.1 AA Compliant**: Built-in accessibility features and validation
- 📱 **Responsive Design**: Mobile-first design with Material Design breakpoints
- 🎭 **Theme Builder**: Interactive theme customization with live preview
- 📊 **Telecom Components**: Specialized components for telecommunications data
- 🎬 **Motion Design**: Smooth animations following Material Design principles
- 🔧 **TypeScript**: Full type safety and IntelliSense support

## Quick Start

### Basic Usage

```tsx
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme Builder

```tsx
import { ThemeBuilder } from './theme';

function SettingsPage() {
  return (
    <ThemeBuilder 
      onThemeChange={(theme) => console.log('Theme changed:', theme)}
      onConfigChange={(config) => console.log('Config changed:', config)}
    />
  );
}
```

### Custom Theme Configuration

```tsx
import { createMD3Theme, quickThemes } from './theme';

// Use predefined theme
const theme = createMD3Theme(quickThemes.telecomDark);

// Custom theme configuration
const customTheme = createMD3Theme({
  mode: 'light',
  customColors: {
    primary: '#006397',
    secondary: '#74777c',
    tertiary: '#00696f',
  },
  accessibility: {
    highContrast: true,
    largeFonts: true,
  },
});
```

## Components

### Typography

```tsx
import { 
  DisplayLarge, 
  HeadlineMedium, 
  TitleLarge,
  BodyLarge,
  MonospaceText,
  StatusText,
  MetricText 
} from './theme/typography';

function Example() {
  return (
    <div>
      <DisplayLarge>Display Large Heading</DisplayLarge>
      <HeadlineMedium>Headline Medium</HeadlineMedium>
      <TitleLarge>Title Large</TitleLarge>
      <BodyLarge>Body text for content</BodyLarge>
      
      {/* Telecommunications specific */}
      <MonospaceText>
        IMSI: 310410123456789
        MSISDN: +1-555-0123
      </MonospaceText>
      
      <StatusText status="online">Connection Active</StatusText>
      <MetricText>1,234,567</MetricText>
    </div>
  );
}
```

### Elevation and Surfaces

```tsx
import { 
  FloatingCard, 
  InteractiveElevationBox,
  DropShadowContainer 
} from './theme/elevation';

function ElevationExample() {
  return (
    <div>
      <FloatingCard floating hoverFloat>
        <p>This card floats and hovers</p>
      </FloatingCard>
      
      <InteractiveElevationBox component="card">
        <p>Interactive elevation changes</p>
      </InteractiveElevationBox>
      
      <DropShadowContainer level={3} color="primary">
        <p>Colored drop shadow</p>
      </DropShadowContainer>
    </div>
  );
}
```

### Motion and Animation

```tsx
import { 
  AnimatedBox,
  StaggeredContainer,
  SkeletonLoader,
  StatusIndicator 
} from './theme/motion';

function MotionExample() {
  return (
    <div>
      <AnimatedBox animation="slideInUp" duration="medium">
        <p>Slides in from bottom</p>
      </AnimatedBox>
      
      <StaggeredContainer staggerDelay={100}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </StaggeredContainer>
      
      <SkeletonLoader width="100%" height={20} />
      
      <StatusIndicator status="online" animated />
    </div>
  );
}
```

### Accessibility

```tsx
import { 
  AccessibleButton,
  AccessibleText,
  HighContrastContainer,
  ContrastIndicator 
} from './theme/accessibility';

function AccessibilityExample() {
  return (
    <div>
      <AccessibleButton variant="contained">
        Accessible Button with Focus Ring
      </AccessibleButton>
      
      <AccessibleText autoContrast backgroundColor="#006397">
        This text auto-adjusts for contrast
      </AccessibleText>
      
      <HighContrastContainer highContrast>
        <p>High contrast mode content</p>
      </HighContrastContainer>
      
      <ContrastIndicator 
        backgroundColor="#006397" 
        textColor="#ffffff" 
      />
    </div>
  );
}
```

### Responsive Design

```tsx
import { 
  ResponsiveContainer,
  ResponsiveFlex,
  HideOn,
  ShowOn,
  useBreakpoint 
} from './theme/responsive';

function ResponsiveExample() {
  const breakpoint = useBreakpoint();
  
  return (
    <ResponsiveContainer maxWidth="lg">
      <ResponsiveFlex
        direction={{ xs: 'column', md: 'row' }}
        gap={{ xs: 1, md: 2 }}
        justify="space-between"
      >
        <div>Content 1</div>
        <div>Content 2</div>
        
        <HideOn xs>
          <div>Hidden on mobile</div>
        </HideOn>
        
        <ShowOn md>
          <div>Only visible on tablet and up</div>
        </ShowOn>
      </ResponsiveFlex>
      
      {breakpoint.isMobile && <p>Mobile view</p>}
    </ResponsiveContainer>
  );
}
```

## Theme Hook Usage

```tsx
import { useTheme } from './contexts/ThemeContext';

function ThemeControls() {
  const { 
    mode, 
    toggleTheme, 
    isHighContrast, 
    toggleHighContrast,
    themeConfig,
    setThemeConfig,
    resetTheme 
  } = useTheme();
  
  const handleCustomTheme = () => {
    setThemeConfig({
      mode: 'light',
      brandScheme: 'green',
      accessibility: {
        highContrast: true,
      },
    });
  };
  
  return (
    <div>
      <button onClick={toggleTheme}>
        Switch to {mode === 'light' ? 'Dark' : 'Light'}
      </button>
      
      <button onClick={toggleHighContrast}>
        {isHighContrast ? 'Disable' : 'Enable'} High Contrast
      </button>
      
      <button onClick={handleCustomTheme}>
        Apply Custom Theme
      </button>
      
      <button onClick={resetTheme}>
        Reset to Default
      </button>
    </div>
  );
}
```

## Design System Showcase

View all components and patterns:

```tsx
import { DesignSystemShowcase } from './theme';

function DocumentationPage() {
  return <DesignSystemShowcase />;
}
```

## Color System

### Brand Color Schemes

Pre-defined color schemes optimized for telecommunications:

- `blue` (default) - Professional blue scheme
- `green` - Success and growth focused
- `purple` - Modern and innovative
- `orange` - Energy and connectivity
- `red` - Alerts and critical systems

```tsx
const theme = createMD3Theme({
  mode: 'light',
  brandScheme: 'blue', // or 'green', 'purple', 'orange', 'red'
});
```

### Custom Colors

```tsx
const customTheme = createMD3Theme({
  mode: 'light',
  customColors: {
    primary: '#006397',   // Telecom blue
    secondary: '#74777c', // Neutral gray
    tertiary: '#00696f',  // Accent teal
  },
});
```

### Accessibility Features

- **WCAG 2.1 AA Compliance**: All color combinations meet accessibility standards
- **High Contrast Mode**: Enhanced contrast for better visibility
- **Large Fonts**: Increased font sizes for readability
- **Reduced Motion**: Respects user's motion preferences
- **Focus Indicators**: Clear focus rings for keyboard navigation
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

## Telecommunications Patterns

### Network Status Display

```tsx
<StatusText status="online">Network Online</StatusText>
<StatusText status="warning">High Latency</StatusText>
<StatusText status="error">Connection Failed</StatusText>
```

### Data Display

```tsx
<MonospaceText>
  IP: 192.168.1.100
  Port: 2775
  Bind: TRX
</MonospaceText>

<MetricText>1,234,567</MetricText>
<DataText>SMS_MT: 85%</DataText>
```

### Subscription Management

```tsx
<Card>
  <CardContent>
    <Typography variant="titleMedium">Subscriber Details</Typography>
    <MonospaceText>
      MSISDN: +1-555-0123
      IMSI: 310410123456789
      Status: ACTIVE
    </MonospaceText>
    <StatusText status="online">Connected</StatusText>
  </CardContent>
</Card>
```

## Best Practices

### Performance

- Use `React.useMemo` for theme creation in components
- Leverage CSS-in-JS optimizations with styled components
- Implement lazy loading for theme builder and showcase components

### Accessibility

- Always test color contrast with the built-in `ContrastIndicator`
- Use semantic HTML with proper ARIA attributes
- Test with keyboard navigation and screen readers
- Respect user preferences for motion and contrast

### Responsive Design

- Design mobile-first with progressive enhancement
- Use the responsive utility components for consistent layouts
- Test across all breakpoints defined in the system

### Customization

- Extend the theme system by adding new design tokens
- Create custom components using the provided utilities
- Maintain consistency with Material Design principles

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When adding new components or patterns:

1. Follow Material Design 3 specifications
2. Ensure WCAG 2.1 AA compliance
3. Add TypeScript types and documentation
4. Include examples in the design system showcase
5. Test across all supported breakpoints and themes

## Migration Guide

### From Basic MUI Theme

```tsx
// Before
import { createTheme } from '@mui/material/styles';
const theme = createTheme({...});

// After  
import { createMD3Theme } from './theme';
const theme = createMD3Theme({
  mode: 'light',
  brandScheme: 'blue',
});
```

### From Custom Theme

```tsx
// Before
const customTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// After
const customTheme = createMD3Theme({
  mode: 'light',
  customColors: {
    primary: '#1976d2',
    secondary: '#dc004e',
  },
});
```

## Support

For questions or issues with the design system, please refer to:

- [Material Design 3 Guidelines](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- Component documentation in the design system showcase