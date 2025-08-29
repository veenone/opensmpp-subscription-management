import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { createMD3Theme, ThemeConfig, quickThemes } from '../theme';
import type { Theme } from '@mui/material/styles';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
  theme: Theme;
  setThemeConfig: (config: ThemeConfig) => void;
  themeConfig: ThemeConfig;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}


export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme configuration from localStorage or defaults
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('themeConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        return { ...quickThemes.telecomLight, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to parse saved theme config:', error);
    }
    
    // Default to system preference with telecom blue scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? quickThemes.telecomDark : quickThemes.telecomLight;
  });

  // Derived state for backwards compatibility
  const mode = themeConfig.mode;
  const isHighContrast = themeConfig.accessibility?.highContrast || false;

  // Generate Material Design 3 theme
  const theme = React.useMemo(() => {
    return createMD3Theme(themeConfig);
  }, [themeConfig]);

  // Save theme config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('themeConfig', JSON.stringify(themeConfig));
      // Backwards compatibility
      localStorage.setItem('themeMode', themeConfig.mode);
    } catch (error) {
      console.warn('Failed to save theme config:', error);
    }
  }, [themeConfig]);

  // Theme manipulation functions
  const toggleTheme = () => {
    setThemeConfigState(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  const toggleHighContrast = () => {
    setThemeConfigState(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        highContrast: !prev.accessibility?.highContrast,
      },
    }));
  };

  const setThemeConfig = (config: ThemeConfig) => {
    setThemeConfigState(config);
  };

  const resetTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeConfigState(prefersDark ? quickThemes.telecomDark : quickThemes.telecomLight);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a theme
      const hasManualTheme = localStorage.getItem('themeConfig');
      if (!hasManualTheme) {
        setThemeConfigState(prev => ({
          ...prev,
          mode: e.matches ? 'dark' : 'light',
        }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for high contrast preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !isHighContrast) {
        toggleHighContrast();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isHighContrast]);

  const contextValue: ThemeContextType = {
    mode,
    toggleTheme,
    theme,
    setThemeConfig,
    themeConfig,
    isHighContrast,
    toggleHighContrast,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};