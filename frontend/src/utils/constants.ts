// Application constants
export const APP_NAME = 'SMPP Subscription Management System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Comprehensive SMPP subscription management with real-time monitoring';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const MAX_PAGE_SIZE = 100;

// Date and time formats
export const DATE_FORMAT = 'MM/dd/yyyy';
export const DATETIME_FORMAT = 'MM/dd/yyyy HH:mm:ss';
export const TIME_FORMAT = 'HH:mm:ss';
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  THEME_MODE: 'themeMode',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  TABLE_DENSITY: 'tableDensity',
  FORM_DRAFTS: 'formDrafts',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
} as const;

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: SUBSCRIPTION_STATUS.ACTIVE, label: 'Active' },
  { value: SUBSCRIPTION_STATUS.SUSPENDED, label: 'Suspended' },
  { value: SUBSCRIPTION_STATUS.TERMINATED, label: 'Terminated' },
];

// User roles and permissions
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_READ: 'DASHBOARD_READ',
  
  // Subscriptions
  SUBSCRIPTION_READ: 'SUBSCRIPTION_READ',
  SUBSCRIPTION_CREATE: 'SUBSCRIPTION_CREATE',
  SUBSCRIPTION_UPDATE: 'SUBSCRIPTION_UPDATE',
  SUBSCRIPTION_DELETE: 'SUBSCRIPTION_DELETE',
  SUBSCRIPTION_BULK_IMPORT: 'SUBSCRIPTION_BULK_IMPORT',
  SUBSCRIPTION_EXPORT: 'SUBSCRIPTION_EXPORT',
  
  // Users
  USER_READ: 'USER_READ',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  
  // Roles
  ROLE_READ: 'ROLE_READ',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE',
  
  // Audit
  AUDIT_READ: 'AUDIT_READ',
  
  // Settings
  SETTINGS_READ: 'SETTINGS_READ',
  SETTINGS_UPDATE: 'SETTINGS_UPDATE',
  
  // System
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
} as const;

// Authentication providers
export const AUTH_PROVIDERS = {
  DATABASE: 'DATABASE',
  LDAP: 'LDAP',
  OAUTH2: 'OAUTH2',
} as const;

export const AUTH_PROVIDER_OPTIONS = [
  { value: AUTH_PROVIDERS.DATABASE, label: 'Database' },
  { value: AUTH_PROVIDERS.LDAP, label: 'LDAP / Active Directory' },
  { value: AUTH_PROVIDERS.OAUTH2, label: 'OAuth 2.0' },
];

// File types and extensions
export const ALLOWED_FILE_TYPES = {
  CSV: 'text/csv',
  JSON: 'application/json',
  XML: 'application/xml',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PDF: 'application/pdf',
};

export const FILE_EXTENSIONS = {
  CSV: '.csv',
  JSON: '.json',
  XML: '.xml',
  XLSX: '.xlsx',
  PDF: '.pdf',
};

// Validation constants
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    STRONG_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
  },
  MSISDN: {
    PATTERN: /^\+[1-9]\d{1,14}$/,
    MIN_LENGTH: 8,
    MAX_LENGTH: 16,
  },
  IMPI: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    MAX_LENGTH: 255,
  },
  IMPU: {
    PATTERN: /^sip:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    MAX_LENGTH: 255,
  },
};

// Theme configuration
export const THEME_CONFIG = {
  BREAKPOINTS: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
  DRAWER_WIDTH: 280,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATE: 'Created successfully',
  UPDATE: 'Updated successfully',
  DELETE: 'Deleted successfully',
  SAVE: 'Saved successfully',
  IMPORT: 'Import completed successfully',
  EXPORT: 'Export completed successfully',
  LOGIN: 'Login successful',
  LOGOUT: 'Logout successful',
  PASSWORD_CHANGE: 'Password changed successfully',
  PROFILE_UPDATE: 'Profile updated successfully',
};

// Feature flags
export const FEATURES = {
  DARK_MODE: true,
  BULK_IMPORT: true,
  EXPORT: true,
  NOTIFICATIONS: true,
  WEBSOCKETS: true,
  ADVANCED_SEARCH: true,
  AUDIT_LOGS: true,
  TWO_FACTOR_AUTH: false,
  SSO: true,
  API_DOCS: true,
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: ['#1976d2', '#42a5f5', '#90caf9', '#bbdefb', '#e3f2fd'],
  SUCCESS: ['#2e7d32', '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9'],
  WARNING: ['#f57c00', '#ff9800', '#ffb74d', '#ffcc02', '#ffe0b2'],
  ERROR: ['#d32f2f', '#f44336', '#ef5350', '#e57373', '#ffcdd2'],
  INFO: ['#0288d1', '#03a9f4', '#4fc3f7', '#81d4fa', '#b3e5fc'],
};

// Animation durations (ms)
export const ANIMATION_DURATION = {
  SHORT: 150,
  MEDIUM: 300,
  LONG: 500,
  EXTRA_LONG: 1000,
};

// Z-index layers
export const Z_INDEX = {
  BACKDROP: 1200,
  DRAWER: 1100,
  MODAL: 1300,
  SNACKBAR: 1400,
  TOOLTIP: 1500,
};
