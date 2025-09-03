/**
 * Material Design 3 Theme Builder
 * Interactive theme customization with live preview
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import {
  createMD3Theme,
  ThemeConfig,
} from './theme';
import {
  brandColorSchemes,
  getContrastRatio,
} from './colorSystem';
import { ContrastIndicator } from './accessibility';
import { ResponsiveContainer } from './responsive';

// Color input component with validation
const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  backgroundColor?: string;
}> = ({ label, value, onChange, backgroundColor = '#ffffff' }) => {
  const [localValue, setLocalValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  const validateColor = useCallback((color: string) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }, []);

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
    const valid = validateColor(newValue);
    setIsValid(valid);
    if (valid) {
      onChange(newValue);
    }
  }, [validateColor, onChange]);

  const contrastRatio = useMemo(() => {
    if (validateColor(localValue) && validateColor(backgroundColor)) {
      return getContrastRatio(backgroundColor, localValue);
    }
    return 0;
  }, [localValue, backgroundColor, validateColor]);

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        error={!isValid}
        helperText={!isValid ? 'Invalid color format' : `Contrast: ${contrastRatio.toFixed(2)}`}
        InputProps={{
          startAdornment: (
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: isValid ? localValue : 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mr: 1,
              }}
            />
          ),
        }}
      />
      {isValid && backgroundColor && (
        <ContrastIndicator
          backgroundColor={backgroundColor}
          textColor={localValue}
          sx={{ mt: 0.5 }}
        />
      )}
    </Box>
  );
};

// Theme preview component
const ThemePreview: React.FC<{ theme: any }> = ({ theme }) => {
  return (
    <ThemeProvider theme={theme}>
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="headlineSmall" gutterBottom>
            Theme Preview
          </Typography>
          
          {/* Color swatches */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="titleMedium" gutterBottom>
              Colors
            </Typography>
            <Grid container spacing={1}>
              {[
                { name: 'Primary', color: theme.palette.primary.main },
                { name: 'Secondary', color: theme.palette.secondary.main },
                { name: 'Tertiary', color: theme.palette.tertiary?.main || theme.palette.info.main },
                { name: 'Error', color: theme.palette.error.main },
                { name: 'Warning', color: theme.palette.warning?.main || '#ff9800' },
                { name: 'Success', color: theme.palette.success?.main || '#4caf50' },
              ].map(({ name, color }) => (
                <Grid size={2} key={name}>
                  <Box
                    sx={{
                      aspectRatio: '1',
                      backgroundColor: color,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getContrastRatio('#ffffff', color) > 4.5 ? '#ffffff' : '#000000',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    {name}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Typography samples */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="titleMedium" gutterBottom>
              Typography
            </Typography>
            <Typography variant="headlineLarge" gutterBottom>
              Headline Large
            </Typography>
            <Typography variant="titleLarge" gutterBottom>
              Title Large
            </Typography>
            <Typography variant="bodyLarge" gutterBottom>
              Body Large - This is a sample of body text that shows how your content will look.
            </Typography>
            <Typography variant="labelMedium">
              Label Medium
            </Typography>
          </Box>

          {/* Components preview */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="titleMedium" gutterBottom>
              Components
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button variant="contained" size="small">
                Primary
              </Button>
              <Button variant="outlined" size="small">
                Secondary
              </Button>
              <Button variant="text" size="small">
                Text
              </Button>
            </Box>
            <TextField
              size="small"
              label="Text Field"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>

          {/* Surface samples */}
          <Box>
            <Typography variant="titleMedium" gutterBottom>
              Surfaces
            </Typography>
            <Grid container spacing={1}>
              {[
                { name: 'Surface', color: theme.palette.surface?.main || theme.palette.background.paper },
                { name: 'Container', color: theme.palette.surface?.container || theme.palette.background.paper },
                { name: 'Container High', color: theme.palette.surface?.containerHigh || theme.palette.background.paper },
              ].map(({ name, color }, index) => (
                <Grid size={4} key={name}>
                  <Box
                    sx={{
                      height: 60,
                      backgroundColor: color,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {name}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

// Main Theme Builder component
export const ThemeBuilder: React.FC<{
  onThemeChange?: (theme: any) => void;
  onConfigChange?: (config: ThemeConfig) => void;
}> = ({ onThemeChange, onConfigChange }) => {
  const currentTheme = useTheme();
  const breakpoint = useBreakpoint();
  
  const [config, setConfig] = useState<ThemeConfig>({
    mode: 'light',
    brandScheme: 'blue',
  });

  const [customColors, setCustomColors] = useState({
    primary: '#006397',
    secondary: '#74777c', 
    tertiary: '#00696f',
  });

  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    reducedMotion: false,
    largeFonts: false,
  });

  // Generate theme from current config
  const generatedTheme = useMemo(() => {
    const themeConfig: ThemeConfig = {
      ...config,
      customColors: config.brandScheme ? undefined : customColors,
      accessibility,
    };
    return createMD3Theme(themeConfig);
  }, [config, customColors, accessibility]);

  // Update parent components when theme changes
  useEffect(() => {
    onThemeChange?.(generatedTheme);
    onConfigChange?.({ ...config, customColors, accessibility });
  }, [generatedTheme, config, customColors, accessibility, onThemeChange, onConfigChange]);

  // Handle config changes
  const handleConfigChange = useCallback((key: keyof ThemeConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCustomColorChange = useCallback((color: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [color]: value }));
  }, []);

  const handleAccessibilityChange = useCallback((key: keyof typeof accessibility, value: boolean) => {
    setAccessibility(prev => ({ ...prev, [key]: value }));
  }, []);

  // Export theme configuration
  const handleExportTheme = useCallback(() => {
    const themeConfig = {
      config,
      customColors,
      accessibility,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(themeConfig, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-config-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [config, customColors, accessibility]);

  // Import theme configuration
  const handleImportTheme = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.config) setConfig(imported.config);
        if (imported.customColors) setCustomColors(imported.customColors);
        if (imported.accessibility) setAccessibility(imported.accessibility);
      } catch (error) {
        console.error('Invalid theme file:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setConfig({ mode: 'light', brandScheme: 'blue' });
    setCustomColors({
      primary: '#006397',
      secondary: '#74777c',
      tertiary: '#00696f',
    });
    setAccessibility({
      highContrast: false,
      reducedMotion: false,
      largeFonts: false,
    });
  }, []);

  return (
    <ResponsiveContainer maxWidth="xl">
      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="headlineSmall" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaletteIcon />
                  Theme Builder
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Export Theme">
                    <IconButton onClick={handleExportTheme} size="small">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Import Theme">
                    <IconButton component="label" size="small">
                      <UploadIcon />
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportTheme}
                        style={{ display: 'none' }}
                      />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Reset to Defaults">
                    <IconButton onClick={handleReset} size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Basic Settings */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="titleMedium">Basic Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Theme Mode</InputLabel>
                        <Select
                          value={config.mode}
                          label="Theme Mode"
                          onChange={(e) => handleConfigChange('mode', e.target.value)}
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Brand Scheme</InputLabel>
                        <Select
                          value={config.brandScheme || 'custom'}
                          label="Brand Scheme"
                          onChange={(e) => handleConfigChange('brandScheme', e.target.value === 'custom' ? undefined : e.target.value)}
                        >
                          <MenuItem value="custom">Custom Colors</MenuItem>
                          {Object.keys(brandColorSchemes).map(scheme => (
                            <MenuItem key={scheme} value={scheme}>
                              {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Custom Colors */}
              {!config.brandScheme && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="titleMedium">Custom Colors</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <ColorInput
                          label="Primary Color"
                          value={customColors.primary}
                          onChange={(value) => handleCustomColorChange('primary', value)}
                          backgroundColor={generatedTheme.palette.background.paper}
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <ColorInput
                          label="Secondary Color"
                          value={customColors.secondary}
                          onChange={(value) => handleCustomColorChange('secondary', value)}
                          backgroundColor={generatedTheme.palette.background.paper}
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <ColorInput
                          label="Tertiary Color"
                          value={customColors.tertiary}
                          onChange={(value) => handleCustomColorChange('tertiary', value)}
                          backgroundColor={generatedTheme.palette.background.paper}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Accessibility Settings */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="titleMedium">Accessibility</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={accessibility.highContrast}
                            onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                          />
                        }
                        label="High Contrast Mode"
                      />
                    </Grid>
                    
                    <Grid size={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={accessibility.largeFonts}
                            onChange={(e) => handleAccessibilityChange('largeFonts', e.target.checked)}
                          />
                        }
                        label="Large Fonts"
                      />
                    </Grid>
                    
                    <Grid size={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={accessibility.reducedMotion}
                            onChange={(e) => handleAccessibilityChange('reducedMotion', e.target.checked)}
                          />
                        }
                        label="Reduced Motion"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Theme Code Export */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="titleMedium">Export Code</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    variant="outlined"
                    label="Theme Configuration"
                    value={JSON.stringify({ config, customColors, accessibility }, null, 2)}
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '12px' },
                    }}
                  />
                  <Button
                    fullWidth
                    startIcon={<CodeIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify({ config, customColors, accessibility }, null, 2));
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ThemePreview theme={generatedTheme} />
        </Grid>
      </Grid>
    </ResponsiveContainer>
  );
};

export default ThemeBuilder;