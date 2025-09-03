/**
 * Design System Documentation and Component Showcase
 * Comprehensive showcase of all design system components and patterns
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  TextField,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Alert,
  LinearProgress,
  CircularProgress,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Checkbox,
  Slider,
  Rating,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Breadcrumbs,
  Link,
  Paper,
  AppBar,
  Toolbar,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  TypographyComponents,
  DisplayLarge,
  HeadlineMedium,
  TitleLarge,
  BodyLarge,
  LabelMedium,
  MonospaceText,
  StatusText,
  MetricText,
  DataText,
} from './typography';
import {
  ElevationComponents,
  AnimatedElevationBox,
  FloatingCard,
  DropShadowContainer,
  InteractiveElevationBox,
} from './elevation';
import {
  MotionComponents,
  AnimatedBox,
  SkeletonLoader,
  PulsingBox,
  SpinningBox,
  StatusIndicator,
  AnimatedProgressBar,
} from './motion';
import {
  AccessibilityComponents,
  AccessibleButton,
  AccessibleText,
  HighContrastContainer,
  ContrastIndicator,
} from './accessibility';
import {
  ResponsiveComponents,
  ResponsiveContainer,
  ResponsiveFlex,
  HideOn,
  ShowOn,
} from './responsive';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`showcase-tabpanel-${index}`}
      aria-labelledby={`showcase-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ShowcaseSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <TitleLarge gutterBottom>{title}</TitleLarge>
        {description && (
          <BodyLarge color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </BodyLarge>
        )}
        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
};

const CodeBlock: React.FC<{ children: string }> = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box
      component="pre"
      sx={{
        backgroundColor: theme.palette.surface?.containerLow || theme.palette.grey[100],
        color: theme.palette.text.primary,
        padding: 2,
        borderRadius: 1,
        overflow: 'auto',
        fontSize: '14px',
        fontFamily: 'monospace',
        border: `1px solid ${theme.palette.divider}`,
        mt: 2,
      }}
    >
      <code>{children}</code>
    </Box>
  );
};

export const DesignSystemShowcase: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ResponsiveContainer maxWidth="xl">
      <DisplayLarge gutterBottom>
        Design System Showcase
      </DisplayLarge>
      
      <BodyLarge color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive documentation and examples of the Material Design 3 system components,
        patterns, and utilities for the SMPP Subscription Management System.
      </BodyLarge>

      <Paper elevation={1}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Colors" />
          <Tab label="Typography" />
          <Tab label="Components" />
          <Tab label="Layout" />
          <Tab label="Motion" />
          <Tab label="Accessibility" />
          <Tab label="Patterns" />
        </Tabs>

        {/* Colors Tab */}
        <TabPanel value={tabValue} index={0}>
          <ShowcaseSection
            title="Color Palette"
            description="Material Design 3 color system with dynamic theming support"
          >
            <Grid container spacing={2}>
              {[
                { name: 'Primary', color: theme.palette.primary.main, onColor: theme.palette.primary.contrastText },
                { name: 'Secondary', color: theme.palette.secondary.main, onColor: theme.palette.secondary.contrastText },
                { name: 'Tertiary', color: theme.palette.tertiary?.main || theme.palette.info.main, onColor: theme.palette.info.contrastText },
                { name: 'Error', color: theme.palette.error.main, onColor: theme.palette.error.contrastText },
                { name: 'Warning', color: theme.palette.warning?.main || '#ff9800', onColor: '#000000' },
                { name: 'Success', color: theme.palette.success?.main || '#4caf50', onColor: '#ffffff' },
              ].map(({ name, color, onColor }) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={name}>
                  <Box
                    sx={{
                      aspectRatio: '1',
                      backgroundColor: color,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: onColor,
                      p: 1,
                    }}
                  >
                    <Typography variant="labelMedium" fontWeight="bold">
                      {name}
                    </Typography>
                    <Typography variant="bodySmall" sx={{ mt: 0.5, fontSize: '10px' }}>
                      {color}
                    </Typography>
                  </Box>
                  <ContrastIndicator
                    backgroundColor={color}
                    textColor={onColor}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              ))}
            </Grid>
          </ShowcaseSection>

          <ShowcaseSection
            title="Surface Colors"
            description="Surface color variants for different elevation levels"
          >
            <Grid container spacing={2}>
              {[
                { name: 'Background', color: theme.palette.background.default },
                { name: 'Surface', color: theme.palette.surface?.main || theme.palette.background.paper },
                { name: 'Container', color: theme.palette.surface?.container || theme.palette.background.paper },
                { name: 'Container High', color: theme.palette.surface?.containerHigh || theme.palette.background.paper },
              ].map(({ name, color }) => (
                <Grid size={{ xs: 6, sm: 3 }} key={name}>
                  <Box
                    sx={{
                      height: 80,
                      backgroundColor: color,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.text.primary,
                    }}
                  >
                    <Typography variant="labelMedium">
                      {name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </ShowcaseSection>
        </TabPanel>

        {/* Typography Tab */}
        <TabPanel value={tabValue} index={1}>
          <ShowcaseSection
            title="Typography Scale"
            description="Material Design 3 typography system with responsive scaling"
          >
            <DisplayLarge>Display Large</DisplayLarge>
            <HeadlineMedium>Headline Medium</HeadlineMedium>
            <TitleLarge>Title Large</TitleLarge>
            <BodyLarge>Body Large - This is the primary text used for most content</BodyLarge>
            <LabelMedium>Label Medium</LabelMedium>
            
            <CodeBlock>
{`import { DisplayLarge, HeadlineMedium, TitleLarge } from './theme/typography';

<DisplayLarge>Display Large</DisplayLarge>
<HeadlineMedium>Headline Medium</HeadlineMedium>
<TitleLarge>Title Large</TitleLarge>`}
            </CodeBlock>
          </ShowcaseSection>

          <ShowcaseSection
            title="Specialized Typography"
            description="Custom typography components for telecommunications data"
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MonospaceText>
                  IMSI: 310410123456789{'\n'}
                  MSISDN: +1-555-0123{'\n'}
                  Status: ACTIVE
                </MonospaceText>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <StatusText status="online">Network Online</StatusText>
                <br />
                <StatusText status="warning">High Traffic</StatusText>
                <br />
                <StatusText status="error">Connection Failed</StatusText>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <MetricText>1,234</MetricText>
              <DataText>SMS_MT</DataText>
              <DataText>BIND_TRX</DataText>
            </Box>
          </ShowcaseSection>
        </TabPanel>

        {/* Components Tab */}
        <TabPanel value={tabValue} index={2}>
          <ShowcaseSection
            title="Buttons"
            description="Interactive button variants with proper accessibility"
          >
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button variant="contained">Contained</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
              <AccessibleButton variant="contained" color="primary">
                Accessible Button
              </AccessibleButton>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" size="small">Small</Button>
              <Button variant="contained" size="medium">Medium</Button>
              <Button variant="contained" size="large">Large</Button>
              <Button variant="contained" disabled>Disabled</Button>
            </Box>
          </ShowcaseSection>

          <ShowcaseSection
            title="Form Controls"
            description="Input components with validation and accessibility features"
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Text Field" variant="outlined" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Required Field" variant="outlined" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth 
                  label="Error State" 
                  variant="outlined" 
                  error 
                  helperText="This field has an error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth 
                  label="Disabled" 
                  variant="outlined" 
                  disabled 
                  value="Disabled value"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <FormControlLabel control={<Switch />} label="Switch" />
              <FormControlLabel control={<Checkbox />} label="Checkbox" />
              <FormControlLabel control={<Radio />} label="Radio" />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Slider</Typography>
              <Slider defaultValue={30} />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Rating</Typography>
              <Rating defaultValue={4} />
            </Box>
          </ShowcaseSection>

          <ShowcaseSection
            title="Data Display"
            description="Components for displaying structured data"
          >
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>MSISDN</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell align="right">Messages</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { msisdn: '+1-555-0123', status: 'Active', lastActive: '2 min ago', messages: 142 },
                    { msisdn: '+1-555-0124', status: 'Inactive', lastActive: '1 hour ago', messages: 23 },
                    { msisdn: '+1-555-0125', status: 'Active', lastActive: 'Just now', messages: 891 },
                  ].map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.msisdn}</TableCell>
                      <TableCell>
                        <StatusText status={row.status === 'Active' ? 'online' : 'offline'}>
                          {row.status}
                        </StatusText>
                      </TableCell>
                      <TableCell>{row.lastActive}</TableCell>
                      <TableCell align="right">{row.messages}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label="Active" color="primary" />
              <Chip label="Pending" color="warning" />
              <Chip label="Error" color="error" />
              <Chip label="Processing" variant="outlined" />
              <Chip label="Deletable" onDelete={() => {}} />
              <Chip 
                avatar={<Avatar>U</Avatar>}
                label="With Avatar"
              />
            </Box>
          </ShowcaseSection>

          <ShowcaseSection
            title="Feedback"
            description="Components for user feedback and status communication"
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is an info alert with a message.
                </Alert>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Operation completed successfully!
                </Alert>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Please check your configuration.
                </Alert>
                <Alert severity="error" sx={{ mb: 2 }}>
                  An error occurred while processing.
                </Alert>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography gutterBottom>Linear Progress</Typography>
                <LinearProgress value={60} variant="determinate" sx={{ mb: 2 }} />
                <LinearProgress sx={{ mb: 2 }} />
                <AnimatedProgressBar progress={75} color="primary" />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography gutterBottom>Circular Progress</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <CircularProgress size={24} />
                  <CircularProgress value={60} variant="determinate" />
                  <SpinningBox sx={{ width: 24, height: 24 }}>
                    <CircularProgress size={24} />
                  </SpinningBox>
                </Box>
              </Grid>
            </Grid>
          </ShowcaseSection>
        </TabPanel>

        {/* Layout Tab */}
        <TabPanel value={tabValue} index={3}>
          <ShowcaseSection
            title="Elevation System"
            description="Material Design 3 elevation levels with proper shadows"
          >
            <Grid container spacing={2}>
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={level}>
                  <InteractiveElevationBox
                    component="card"
                    sx={{
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Typography variant="labelMedium">
                      Level {level}
                    </Typography>
                  </InteractiveElevationBox>
                </Grid>
              ))}
            </Grid>
          </ShowcaseSection>

          <ShowcaseSection
            title="Responsive Layout"
            description="Responsive containers and grid system"
          >
            <ResponsiveFlex
              direction={{ xs: 'column', md: 'row' }}
              gap={{ xs: 1, md: 2 }}
              align="stretch"
            >
              <Box sx={{ flex: 1, backgroundColor: 'primary.main', color: 'primary.contrastText', p: 2, borderRadius: 1 }}>
                <Typography>Responsive Flex Item 1</Typography>
                <ShowOn md>
                  <Typography variant="bodySmall">Visible on MD and up</Typography>
                </ShowOn>
              </Box>
              <Box sx={{ flex: 1, backgroundColor: 'secondary.main', color: 'secondary.contrastText', p: 2, borderRadius: 1 }}>
                <Typography>Responsive Flex Item 2</Typography>
                <HideOn xs>
                  <Typography variant="bodySmall">Hidden on XS</Typography>
                </HideOn>
              </Box>
              <Box sx={{ flex: 1, backgroundColor: 'success.main', color: 'success.contrastText', p: 2, borderRadius: 1 }}>
                <Typography>Responsive Flex Item 3</Typography>
              </Box>
            </ResponsiveFlex>
          </ShowcaseSection>

          <ShowcaseSection
            title="Navigation"
            description="Navigation components and patterns"
          >
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link color="inherit" href="#" underline="hover">
                Dashboard
              </Link>
              <Link color="inherit" href="#" underline="hover">
                Subscriptions
              </Link>
              <Typography color="text.primary">Details</Typography>
            </Breadcrumbs>
            
            <List>
              <ListItemButton>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              <ListItemButton selected>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Subscriptions" />
                <Badge badgeContent={4} color="error" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </List>
          </ShowcaseSection>
        </TabPanel>

        {/* Motion Tab */}
        <TabPanel value={tabValue} index={4}>
          <ShowcaseSection
            title="Animated Components"
            description="Motion design with proper accessibility considerations"
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography gutterBottom>Loading States</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <SkeletonLoader width={100} height={20} />
                  <SkeletonLoader width={150} height={20} />
                  <SkeletonLoader width={80} height={20} />
                </Box>
                <PulsingBox sx={{ width: 100, height: 20, borderRadius: 1, mb: 2 }} />
                <SpinningBox sx={{ width: 24, height: 24 }}>
                  <CircularProgress size={24} />
                </SpinningBox>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography gutterBottom>Status Indicators</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                  <StatusIndicator status="online" animated />
                  <Typography variant="bodyMedium">Online</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                  <StatusIndicator status="warning" animated />
                  <Typography variant="bodyMedium">Warning</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <StatusIndicator status="error" animated />
                  <Typography variant="bodyMedium">Error</Typography>
                </Box>
              </Grid>
            </Grid>
          </ShowcaseSection>

          <ShowcaseSection
            title="Interactive Animations"
            description="Hover and interaction states with smooth transitions"
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }} md={3}>
                <FloatingCard floating hoverFloat sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="titleMedium">Floating Card</Typography>
                  <Typography variant="bodySmall" color="text.secondary">
                    Hovers and floats on interaction
                  </Typography>
                </FloatingCard>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }} md={3}>
                <AnimatedElevationBox
                  elevation={1}
                  hoverElevation={3}
                  sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper', textAlign: 'center' }}
                >
                  <Typography variant="titleMedium">Elevation Box</Typography>
                  <Typography variant="bodySmall" color="text.secondary">
                    Changes elevation on hover
                  </Typography>
                </AnimatedElevationBox>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }} md={3}>
                <DropShadowContainer
                  level={2}
                  color="primary"
                  sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper', textAlign: 'center' }}
                >
                  <Typography variant="titleMedium">Colored Shadow</Typography>
                  <Typography variant="bodySmall" color="text.secondary">
                    Primary color shadow
                  </Typography>
                </DropShadowContainer>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }} md={3}>
                <AnimatedBox
                  animation="scaleIn"
                  duration="medium"
                  sx={{ p: 2, borderRadius: 2, backgroundColor: 'secondary.main', color: 'secondary.contrastText', textAlign: 'center' }}
                >
                  <Typography variant="titleMedium">Scale Animation</Typography>
                  <Typography variant="bodySmall">
                    Scales in on load
                  </Typography>
                </AnimatedBox>
              </Grid>
            </Grid>
          </ShowcaseSection>
        </TabPanel>

        {/* Accessibility Tab */}
        <TabPanel value={tabValue} index={5}>
          <ShowcaseSection
            title="Accessible Components"
            description="Components designed for WCAG 2.1 AA compliance"
          >
            <Box sx={{ mb: 3 }}>
              <AccessibleButton variant="contained" sx={{ mr: 2 }}>
                Accessible Button
              </AccessibleButton>
              <AccessibleButton variant="outlined">
                With Focus Ring
              </AccessibleButton>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <AccessibleText
                variant="bodyLarge"
                autoContrast
                backgroundColor={theme.palette.primary.main}
                sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.main' }}
              >
                This text automatically adjusts for optimal contrast
              </AccessibleText>
            </Box>
            
            <HighContrastContainer highContrast sx={{ p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="titleMedium">High Contrast Mode</Typography>
              <Typography variant="bodyMedium" sx={{ mb: 2 }}>
                This container provides high contrast for better accessibility
              </Typography>
              <Button variant="contained" sx={{ mr: 1 }}>
                Button
              </Button>
              <Button variant="outlined">
                Outlined
              </Button>
            </HighContrastContainer>
          </ShowcaseSection>

          <ShowcaseSection
            title="Contrast Validation"
            description="Built-in contrast checking and validation tools"
          >
            <Grid container spacing={2}>
              {[
                { bg: theme.palette.primary.main, text: theme.palette.primary.contrastText, label: 'Primary' },
                { bg: theme.palette.secondary.main, text: theme.palette.secondary.contrastText, label: 'Secondary' },
                { bg: theme.palette.error.main, text: theme.palette.error.contrastText, label: 'Error' },
                { bg: theme.palette.background.paper, text: theme.palette.text.primary, label: 'Surface' },
              ].map(({ bg, text, label }) => (
                <Grid size={{ xs: 6, sm: 3 }} key={label}>
                  <Box
                    sx={{
                      backgroundColor: bg,
                      color: text,
                      p: 2,
                      borderRadius: 1,
                      textAlign: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="labelMedium">
                      {label}
                    </Typography>
                  </Box>
                  <ContrastIndicator
                    backgroundColor={bg}
                    textColor={text}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              ))}
            </Grid>
          </ShowcaseSection>
        </TabPanel>

        {/* Patterns Tab */}
        <TabPanel value={tabValue} index={6}>
          <ShowcaseSection
            title="Telecommunications Patterns"
            description="Common UI patterns for SMPP and telecommunications applications"
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="titleMedium" gutterBottom>
                      Network Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <StatusIndicator status="online" animated />
                      <Typography variant="bodyMedium">Connection Active</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <StatusIndicator status="warning" />
                      <Typography variant="bodyMedium">High Latency</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <MonospaceText>
                      IP: 192.168.1.100{'\n'}
                      Port: 2775{'\n'}
                      Bind: TRX
                    </MonospaceText>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="titleMedium" gutterBottom>
                      Message Metrics
                    </Typography>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <MetricText>1,234,567</MetricText>
                      <Typography variant="labelMedium" color="text.secondary">
                        Total Messages
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <DataText>SMS_MT: 85%</DataText>
                      <DataText>SMS_MO: 15%</DataText>
                    </Box>
                    <AnimatedProgressBar
                      progress={85}
                      color="success"
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="titleMedium" gutterBottom>
                      Subscriber Info
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="MSISDN"
                          secondary="+1-555-0123"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="IMSI"
                          secondary="310410123456789"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Status"
                          secondary={
                            <StatusText status="online">Active</StatusText>
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </ShowcaseSection>

          <ShowcaseSection
            title="Interactive Elements"
            description="Buttons, FABs, and interactive components"
          >
            <Box sx={{ position: 'relative', height: 200, mb: 3 }}>
              <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                onClick={() => setDialogOpen(true)}
              >
                <AddIcon />
              </Fab>
              
              <SpeedDial
                ariaLabel="SpeedDial"
                sx={{ position: 'absolute', bottom: 16, left: 16 }}
                icon={<SpeedDialIcon />}
              >
                <SpeedDialAction
                  icon={<ShareIcon />}
                  tooltipTitle="Share"
                />
                <SpeedDialAction
                  icon={<PrintIcon />}
                  tooltipTitle="Print"
                />
                <SpeedDialAction
                  icon={<EmailIcon />}
                  tooltipTitle="Email"
                />
              </SpeedDial>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => setSnackbarOpen(true)}
              >
                Show Snackbar
              </Button>
              <Button
                variant="outlined"
                onClick={() => setDrawerOpen(true)}
              >
                Open Drawer
              </Button>
              <Tooltip title="This is a tooltip">
                <IconButton>
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </ShowcaseSection>
        </TabPanel>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Sample Dialog</DialogTitle>
        <DialogContent>
          <Typography>
            This is a sample dialog demonstrating the Material Design 3 dialog component.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="This is a snackbar notification"
        action={
          <Button color="inherit" size="small" onClick={() => setSnackbarOpen(false)}>
            CLOSE
          </Button>
        }
      />

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="titleMedium" gutterBottom>
            Sample Drawer
          </Typography>
          <List>
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </ResponsiveContainer>
  );
};

export default DesignSystemShowcase;