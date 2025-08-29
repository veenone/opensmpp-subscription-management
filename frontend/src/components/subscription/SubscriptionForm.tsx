import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Grid,
  Divider,
  Chip,
  InputAdornment,
  Collapse,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

import { Subscription, SubscriptionStatus, CreateSubscriptionRequest, UpdateSubscriptionRequest } from '../../types/subscription';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TitleLarge, 
  HeadlineMedium,
  BodyLarge, 
  MonospaceText 
} from '../../theme/typography';
import { 
  AccessibleButton,
  AccessibleFormControl,
  HighContrastContainer 
} from '../../theme/accessibility';
import { 
  ResponsiveFlex,
  useBreakpoint 
} from '../../theme/responsive';
import { FloatingCard } from '../../theme/elevation';

interface SubscriptionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: Subscription;
  mode: 'create' | 'edit';
}

interface FormData {
  msisdn: string;
  impu: string;
  impi: string;
  status: SubscriptionStatus;
  displayName?: string;
  email?: string;
  
  // Advanced settings
  maxSessions?: number;
  allowRoaming?: boolean;
  serviceProfile?: string;
  
  // Security settings
  authPassword?: string;
  encryptionEnabled?: boolean;
  
  // Custom attributes
  customAttributes?: Record<string, string>;
}

interface FormErrors {
  [key: string]: string;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  open,
  onClose,
  onSuccess,
  subscription,
  mode,
}) => {
  const theme = useTheme();
  const { hasPermission } = useAuth();
  const breakpoint = useBreakpoint();

  // State management
  const [formData, setFormData] = useState<FormData>({
    msisdn: '',
    impu: '',
    impi: '',
    status: 'ACTIVE',
    displayName: '',
    email: '',
    maxSessions: 1,
    allowRoaming: false,
    serviceProfile: 'default',
    authPassword: '',
    encryptionEnabled: true,
    customAttributes: {},
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Advanced sections state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  // Custom attributes state
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  // Initialize form data
  useEffect(() => {
    if (subscription && mode === 'edit') {
      setFormData({
        msisdn: subscription.msisdn || '',
        impu: subscription.impu || '',
        impi: subscription.impi || '',
        status: subscription.status || 'ACTIVE',
        displayName: subscription.displayName || '',
        email: subscription.email || '',
        maxSessions: subscription.maxSessions || 1,
        allowRoaming: subscription.allowRoaming || false,
        serviceProfile: subscription.serviceProfile || 'default',
        authPassword: '', // Never pre-fill password
        encryptionEnabled: subscription.encryptionEnabled ?? true,
        customAttributes: subscription.customAttributes || {},
      });
    } else if (mode === 'create') {
      // Reset form for new subscription
      setFormData({
        msisdn: '',
        impu: '',
        impi: '',
        status: 'ACTIVE',
        displayName: '',
        email: '',
        maxSessions: 1,
        allowRoaming: false,
        serviceProfile: 'default',
        authPassword: '',
        encryptionEnabled: true,
        customAttributes: {},
      });
    }
    
    setErrors({});
    setSubmitError(null);
  }, [subscription, mode, open]);

  // Auto-generate IMPU and IMPI from MSISDN
  useEffect(() => {
    if (formData.msisdn && mode === 'create') {
      const cleanMsisdn = formData.msisdn.replace(/[^\d+]/g, '');
      if (cleanMsisdn.startsWith('+')) {
        setFormData(prev => ({
          ...prev,
          impu: `sip:${cleanMsisdn.substring(1)}@ims.example.com`,
          impi: `${cleanMsisdn.substring(1)}@ims.example.com`,
        }));
      }
    }
  }, [formData.msisdn, mode]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.msisdn.trim()) {
      newErrors.msisdn = 'MSISDN is required';
    } else if (!/^\+[1-9]\d{6,14}$/.test(formData.msisdn)) {
      newErrors.msisdn = 'Invalid MSISDN format (E.164)';
    }

    if (!formData.impu.trim()) {
      newErrors.impu = 'IMPU is required';
    } else if (!/^sip:.+@.+\..+$/.test(formData.impu)) {
      newErrors.impu = 'Invalid IMPU format (SIP URI)';
    }

    if (!formData.impi.trim()) {
      newErrors.impi = 'IMPI is required';
    } else if (!/^.+@.+\..+$/.test(formData.impi)) {
      newErrors.impi = 'Invalid IMPI format (NAI)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.maxSessions && (formData.maxSessions < 1 || formData.maxSessions > 10)) {
      newErrors.maxSessions = 'Max sessions must be between 1 and 10';
    }

    if (mode === 'create' && !formData.authPassword) {
      newErrors.authPassword = 'Password is required for new subscriptions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle custom attribute addition
  const handleAddCustomAttribute = () => {
    if (newAttributeKey && newAttributeValue) {
      setFormData(prev => ({
        ...prev,
        customAttributes: {
          ...prev.customAttributes,
          [newAttributeKey]: newAttributeValue,
        },
      }));
      setNewAttributeKey('');
      setNewAttributeValue('');
    }
  };

  // Handle custom attribute removal
  const handleRemoveCustomAttribute = (key: string) => {
    setFormData(prev => ({
      ...prev,
      customAttributes: Object.keys(prev.customAttributes || {})
        .filter(k => k !== key)
        .reduce((acc, k) => ({ ...acc, [k]: prev.customAttributes![k] }), {}),
    }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const payload = {
        ...formData,
        customAttributes: Object.keys(formData.customAttributes || {}).length > 0 
          ? formData.customAttributes 
          : undefined,
      };

      if (mode === 'create') {
        await apiClient.post('/api/subscriptions', payload as CreateSubscriptionRequest);
      } else {
        await apiClient.put(`/api/subscriptions/${subscription!.id}`, payload as UpdateSubscriptionRequest);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || 
        `Failed to ${mode} subscription. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={breakpoint.xs}
      PaperProps={{
        sx: { minHeight: breakpoint.xs ? '100vh' : '600px' }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <ResponsiveFlex justify="space-between" align="center">
            <TitleLarge>
              {mode === 'create' ? 'Add New Subscription' : 'Edit Subscription'}
            </TitleLarge>
            <AccessibleButton
              onClick={onClose}
              size="small"
              variant="text"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </AccessibleButton>
          </ResponsiveFlex>
        </DialogTitle>

        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <HeadlineMedium gutterBottom>
                Basic Information
              </HeadlineMedium>
            </Grid>

            <Grid item xs={12} sm={6}>
              <AccessibleFormControl>
                <TextField
                  label="MSISDN *"
                  value={formData.msisdn}
                  onChange={(e) => handleChange('msisdn', e.target.value)}
                  error={!!errors.msisdn}
                  helperText={errors.msisdn || 'E.164 format (e.g., +1234567890)'}
                  fullWidth
                  disabled={mode === 'edit'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </AccessibleFormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <AccessibleFormControl>
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    label="Status *"
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    <MenuItem value="EXPIRED">Expired</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>
              </AccessibleFormControl>
            </Grid>

            <Grid item xs={12}>
              <AccessibleFormControl>
                <TextField
                  label="IMPU *"
                  value={formData.impu}
                  onChange={(e) => handleChange('impu', e.target.value)}
                  error={!!errors.impu}
                  helperText={errors.impu || 'SIP URI format (e.g., sip:user@domain.com)'}
                  fullWidth
                />
              </AccessibleFormControl>
            </Grid>

            <Grid item xs={12}>
              <AccessibleFormControl>
                <TextField
                  label="IMPI *"
                  value={formData.impi}
                  onChange={(e) => handleChange('impi', e.target.value)}
                  error={!!errors.impi}
                  helperText={errors.impi || 'Network Access Identifier (e.g., user@domain.com)'}
                  fullWidth
                />
              </AccessibleFormControl>
            </Grid>

            {/* Optional Fields */}
            <Grid item xs={12} sm={6}>
              <AccessibleFormControl>
                <TextField
                  label="Display Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </AccessibleFormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <AccessibleFormControl>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                />
              </AccessibleFormControl>
            </Grid>

            {/* Advanced Settings */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <AccessibleButton
                variant="text"
                onClick={() => setShowAdvanced(!showAdvanced)}
                startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                endIcon={<SettingsIcon />}
              >
                Advanced Settings
              </AccessibleButton>
            </Grid>

            <Grid item xs={12}>
              <Collapse in={showAdvanced}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <AccessibleFormControl>
                          <TextField
                            label="Max Sessions"
                            type="number"
                            value={formData.maxSessions}
                            onChange={(e) => handleChange('maxSessions', parseInt(e.target.value) || 1)}
                            error={!!errors.maxSessions}
                            helperText={errors.maxSessions}
                            inputProps={{ min: 1, max: 10 }}
                            fullWidth
                          />
                        </AccessibleFormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <AccessibleFormControl>
                          <TextField
                            label="Service Profile"
                            value={formData.serviceProfile}
                            onChange={(e) => handleChange('serviceProfile', e.target.value)}
                            fullWidth
                          />
                        </AccessibleFormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.allowRoaming}
                              onChange={(e) => handleChange('allowRoaming', e.target.checked)}
                            />
                          }
                          label="Allow Roaming"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Collapse>
            </Grid>

            {/* Security Settings */}
            {hasPermission('subscription:security') && (
              <>
                <Grid item xs={12}>
                  <AccessibleButton
                    variant="text"
                    onClick={() => setShowSecurity(!showSecurity)}
                    startIcon={showSecurity ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    endIcon={<SecurityIcon />}
                  >
                    Security Settings
                  </AccessibleButton>
                </Grid>

                <Grid item xs={12}>
                  <Collapse in={showSecurity}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <AccessibleFormControl>
                              <TextField
                                label={mode === 'create' ? 'Password *' : 'New Password'}
                                type="password"
                                value={formData.authPassword}
                                onChange={(e) => handleChange('authPassword', e.target.value)}
                                error={!!errors.authPassword}
                                helperText={errors.authPassword || (mode === 'edit' ? 'Leave blank to keep current password' : '')}
                                fullWidth
                              />
                            </AccessibleFormControl>
                          </Grid>

                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={formData.encryptionEnabled}
                                  onChange={(e) => handleChange('encryptionEnabled', e.target.checked)}
                                />
                              }
                              label="Enable Encryption"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Collapse>
                </Grid>
              </>
            )}

            {/* Custom Attributes */}
            <Grid item xs={12}>
              <AccessibleButton
                variant="text"
                onClick={() => setShowCustom(!showCustom)}
                startIcon={showCustom ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                Custom Attributes
              </AccessibleButton>
            </Grid>

            <Grid item xs={12}>
              <Collapse in={showCustom}>
                <Card variant="outlined">
                  <CardContent>
                    {/* Existing attributes */}
                    {Object.entries(formData.customAttributes || {}).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        onDelete={() => handleRemoveCustomAttribute(key)}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}

                    {/* Add new attribute */}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <TextField
                          label="Key"
                          size="small"
                          value={newAttributeKey}
                          onChange={(e) => setNewAttributeKey(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Value"
                          size="small"
                          value={newAttributeValue}
                          onChange={(e) => setNewAttributeValue(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <AccessibleButton
                          variant="outlined"
                          size="small"
                          onClick={handleAddCustomAttribute}
                          disabled={!newAttributeKey || !newAttributeValue}
                          fullWidth
                        >
                          Add
                        </AccessibleButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Collapse>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <AccessibleButton 
            onClick={onClose} 
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </AccessibleButton>
          <AccessibleButton
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Subscription' : 'Update Subscription'}
          </AccessibleButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubscriptionForm;