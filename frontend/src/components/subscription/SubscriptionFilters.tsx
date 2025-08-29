import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Popover,
  Card,
  CardContent,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Tune as TuneIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

import { SubscriptionStatus } from '../../types/subscription';
import { 
  BodyLarge,
  DataText 
} from '../../theme/typography';
import { 
  AccessibleButton,
  HighContrastContainer 
} from '../../theme/accessibility';
import { 
  ResponsiveFlex,
  HideOn,
  ShowOn,
  useBreakpoint 
} from '../../theme/responsive';
import { FloatingCard } from '../../theme/elevation';

export interface FilterOptions {
  search: string;
  status: SubscriptionStatus | 'all';
  dateRange: {
    start: string;
    end: string;
  };
  messageCountRange: [number, number];
  hasCustomAttributes: boolean;
  encryptionEnabled?: boolean;
  allowRoaming?: boolean;
  serviceProfile?: string;
}

interface SubscriptionFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  loading?: boolean;
  totalCount?: number;
  filteredCount?: number;
}

const defaultFilters: FilterOptions = {
  search: '',
  status: 'all',
  dateRange: {
    start: '',
    end: '',
  },
  messageCountRange: [0, 10000],
  hasCustomAttributes: false,
  encryptionEnabled: undefined,
  allowRoaming: undefined,
  serviceProfile: undefined,
};

const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({
  onFiltersChange,
  loading = false,
  totalCount = 0,
  filteredCount = 0,
}) => {
  const theme = useTheme();
  const breakpoint = useBreakpoint();

  // State management
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Service profile options
  const serviceProfiles = [
    { value: 'default', label: 'Default' },
    { value: 'premium', label: 'Premium' },
    { value: 'basic', label: 'Basic' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      const newFilters = { ...filters, search: value };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    }, 300); // 300ms debounce

    setSearchDebounceTimer(timer);
  }, [filters, onFiltersChange, searchDebounceTimer]);

  // Filter change handler
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setAdvancedOpen(false);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.messageCountRange[0] > 0 || filters.messageCountRange[1] < 10000) count++;
    if (filters.hasCustomAttributes) count++;
    if (filters.encryptionEnabled !== undefined) count++;
    if (filters.allowRoaming !== undefined) count++;
    if (filters.serviceProfile !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const isFiltered = totalCount !== filteredCount && filteredCount >= 0;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  return (
    <Box>
      {/* Main Filter Bar */}
      <ResponsiveFlex 
        gap={2} 
        sx={{ mb: 2 }}
        direction={{ xs: 'column', sm: 'row' }}
        align={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search Field */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '300px' } }}>
          <TextField
            placeholder="Search by MSISDN, IMPU, or display name..."
            value={filters.search}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, search: e.target.value }));
              handleSearchChange(e.target.value);
            }}
            disabled={loading}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, search: '' }));
                      handleSearchChange('');
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Status Filter */}
        <Box sx={{ minWidth: '140px' }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
              disabled={loading}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Advanced Filters Button */}
        <Tooltip title="Advanced Filters">
          <Box>
            <AccessibleButton
              variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
              startIcon={<TuneIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              disabled={loading}
              size="small"
            >
              <HideOn xs>Filters</HideOn>
              {activeFilterCount > 0 && (
                <Chip 
                  label={activeFilterCount} 
                  size="small" 
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              )}
            </AccessibleButton>
          </Box>
        </Tooltip>

        {/* Reset Filters Button */}
        {activeFilterCount > 0 && (
          <Tooltip title="Clear all filters">
            <AccessibleButton
              variant="text"
              startIcon={<ClearIcon />}
              onClick={handleResetFilters}
              disabled={loading}
              size="small"
            >
              <HideOn xs sm>Clear</HideOn>
            </AccessibleButton>
          </Tooltip>
        )}
      </ResponsiveFlex>

      {/* Filter Results Summary */}
      {isFiltered && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Showing ${filteredCount} of ${totalCount} subscriptions`}
            variant="outlined"
            size="small"
            color="primary"
          />
        </Box>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <ResponsiveFlex gap={1} wrap="wrap">
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                onDelete={() => handleFilterChange('search', '')}
                size="small"
                variant="outlined"
              />
            )}
            
            {filters.status !== 'all' && (
              <Chip
                label={`Status: ${filters.status}`}
                onDelete={() => handleFilterChange('status', 'all')}
                size="small"
                variant="outlined"
              />
            )}

            {(filters.messageCountRange[0] > 0 || filters.messageCountRange[1] < 10000) && (
              <Chip
                label={`Messages: ${filters.messageCountRange[0]}-${filters.messageCountRange[1]}`}
                onDelete={() => handleFilterChange('messageCountRange', [0, 10000])}
                size="small"
                variant="outlined"
              />
            )}

            {filters.hasCustomAttributes && (
              <Chip
                label="Has Custom Attributes"
                onDelete={() => handleFilterChange('hasCustomAttributes', false)}
                size="small"
                variant="outlined"
              />
            )}

            {filters.encryptionEnabled !== undefined && (
              <Chip
                label={`Encryption: ${filters.encryptionEnabled ? 'Enabled' : 'Disabled'}`}
                onDelete={() => handleFilterChange('encryptionEnabled', undefined)}
                size="small"
                variant="outlined"
              />
            )}

            {filters.allowRoaming !== undefined && (
              <Chip
                label={`Roaming: ${filters.allowRoaming ? 'Allowed' : 'Blocked'}`}
                onDelete={() => handleFilterChange('allowRoaming', undefined)}
                size="small"
                variant="outlined"
              />
            )}

            {filters.serviceProfile && (
              <Chip
                label={`Profile: ${filters.serviceProfile}`}
                onDelete={() => handleFilterChange('serviceProfile', undefined)}
                size="small"
                variant="outlined"
              />
            )}
          </ResponsiveFlex>
        </Box>
      )}

      {/* Advanced Filters Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: { xs: '90vw', sm: '400px' }, maxWidth: '400px' }
        }}
      >
        <FloatingCard>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <BodyLarge sx={{ fontWeight: 500 }}>
                Advanced Filters
              </BodyLarge>
            </Box>

            {/* Date Range Filter */}
            <Box sx={{ mb: 3 }}>
              <DataText gutterBottom>Created Date Range</DataText>
              <ResponsiveFlex gap={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', { 
                    ...filters.dateRange, 
                    start: e.target.value 
                  })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', { 
                    ...filters.dateRange, 
                    end: e.target.value 
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </ResponsiveFlex>
            </Box>

            {/* Message Count Range */}
            <Box sx={{ mb: 3 }}>
              <DataText gutterBottom>Message Count Range</DataText>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.messageCountRange}
                  onChange={(_, value) => handleFilterChange('messageCountRange', value)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000}
                  step={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 2500, label: '2.5K' },
                    { value: 5000, label: '5K' },
                    { value: 7500, label: '7.5K' },
                    { value: 10000, label: '10K' },
                  ]}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Service Profile Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Service Profile</InputLabel>
                <Select
                  value={filters.serviceProfile || ''}
                  onChange={(e) => handleFilterChange('serviceProfile', e.target.value || undefined)}
                  label="Service Profile"
                >
                  <MenuItem value="">All Profiles</MenuItem>
                  {serviceProfiles.map((profile) => (
                    <MenuItem key={profile.value} value={profile.value}>
                      {profile.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Boolean Filters */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasCustomAttributes}
                    onChange={(e) => handleFilterChange('hasCustomAttributes', e.target.checked)}
                  />
                }
                label="Has Custom Attributes"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Encryption</InputLabel>
                <Select
                  value={filters.encryptionEnabled === undefined ? '' : filters.encryptionEnabled.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('encryptionEnabled', 
                      value === '' ? undefined : value === 'true'
                    );
                  }}
                  label="Encryption"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="true">Enabled</MenuItem>
                  <MenuItem value="false">Disabled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Roaming</InputLabel>
                <Select
                  value={filters.allowRoaming === undefined ? '' : filters.allowRoaming.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('allowRoaming', 
                      value === '' ? undefined : value === 'true'
                    );
                  }}
                  label="Roaming"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="true">Allowed</MenuItem>
                  <MenuItem value="false">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Action Buttons */}
            <ResponsiveFlex justify="space-between" gap={1}>
              <Button
                variant="text"
                onClick={handleResetFilters}
                startIcon={<ClearIcon />}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                onClick={() => setAnchorEl(null)}
              >
                Apply Filters
              </Button>
            </ResponsiveFlex>
          </CardContent>
        </FloatingCard>
      </Popover>
    </Box>
  );
};

export default SubscriptionFilters;