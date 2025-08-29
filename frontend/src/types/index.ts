// Core application types
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SortRequest {
  property: string;
  direction: 'ASC' | 'DESC';
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: SortRequest[];
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le' | 'like' | 'in' | 'between';
  value: any;
}

export interface SearchRequest extends PageRequest {
  filters?: SearchFilter[];
  searchTerm?: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | ApiError;
  message?: string;
}

export interface UIState extends LoadingState, ErrorState {
  isSubmitting?: boolean;
  isDirty?: boolean;
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'datetime' | 'textarea';
  validation?: ValidationRule;
  options?: Array<{ value: any; label: string; disabled?: boolean }>;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
}

// Navigation types
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  permissions?: string[];
  roles?: string[];
  badge?: string | number;
  divider?: boolean;
  external?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: number;
  compactMode: boolean;
}

// Notification types
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Permission types
export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
}

// User types (extended from auth service)
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  roles: Role[];
  permissions: string[];
  preferences: UserPreferences;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  pageSize: number;
  compactMode: boolean;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
  };
}

// Component props types
export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface ChildrenProps {
  children: React.ReactNode;
}

export interface OptionalChildrenProps {
  children?: React.ReactNode;
}

// Generic utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type SelectOption<T = any> = {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
};

export type AsyncSelectOption<T = any> = SelectOption<T> & {
  loading?: boolean;
};

// HTTP types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// Export all types from services
export * from '../services/authService';
export * from '../services/subscriptionService';
