// Form components barrel export
export { FormTextField } from './FormTextField';
export { FormSelect } from './FormSelect';
export { FormDatePicker } from './FormDatePicker';
export { FormCheckbox, FormCheckboxGroup } from './FormCheckbox';
export { FormRadioGroup } from './FormRadioGroup';
export { FormTextArea } from './FormTextArea';

// Form validation utilities
export const validationRules = {
  required: (message = 'This field is required') => ({
    required: message,
  }),

  email: (message = 'Please enter a valid email address') => ({
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message,
    },
  }),

  minLength: (min: number, message?: string) => ({
    minLength: {
      value: min,
      message: message || `Minimum ${min} characters required`,
    },
  }),

  maxLength: (max: number, message?: string) => ({
    maxLength: {
      value: max,
      message: message || `Maximum ${max} characters allowed`,
    },
  }),

  pattern: (pattern: RegExp, message: string) => ({
    pattern: {
      value: pattern,
      message,
    },
  }),

  phone: (message = 'Please enter a valid phone number') => ({
    pattern: {
      value: /^\+?[1-9]\d{1,14}$/,
      message,
    },
  }),

  url: (message = 'Please enter a valid URL') => ({
    pattern: {
      value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      message,
    },
  }),

  number: (min?: number, max?: number) => ({
    ...(min !== undefined && {
      min: {
        value: min,
        message: `Value must be at least ${min}`,
      },
    }),
    ...(max !== undefined && {
      max: {
        value: max,
        message: `Value must be at most ${max}`,
      },
    }),
  }),

  custom: (validator: (value: any) => boolean | string, message: string) => ({
    validate: (value: any) => {
      const result = validator(value);
      return result === true ? true : (typeof result === 'string' ? result : message);
    },
  }),

  // Compose multiple rules
  compose: (...rules: any[]) => {
    return rules.reduce((acc, rule) => ({ ...acc, ...rule }), {});
  },
};

// Common form field configurations
export const formFieldConfigs = {
  username: {
    label: 'Username',
    placeholder: 'Enter username',
    rules: validationRules.compose(
      validationRules.required(),
      validationRules.minLength(3),
      validationRules.maxLength(50)
    ),
  },

  email: {
    label: 'Email Address',
    placeholder: 'Enter email address',
    type: 'email' as const,
    rules: validationRules.compose(
      validationRules.required(),
      validationRules.email()
    ),
  },

  password: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password' as const,
    showPassword: true,
    rules: validationRules.compose(
      validationRules.required(),
      validationRules.minLength(8)
    ),
  },

  confirmPassword: (passwordFieldName = 'password') => ({
    label: 'Confirm Password',
    placeholder: 'Confirm password',
    type: 'password' as const,
    showPassword: true,
    rules: {
      required: 'Please confirm your password',
      validate: (value: string, formValues: any) =>
        value === formValues[passwordFieldName] || 'Passwords do not match',
    },
  }),

  phone: {
    label: 'Phone Number',
    placeholder: '+1234567890',
    type: 'tel' as const,
    rules: validationRules.phone(),
  },

  msisdn: {
    label: 'MSISDN',
    placeholder: '+1234567890',
    helpText: 'Enter phone number in E.164 format (e.g., +1234567890)',
    rules: validationRules.compose(
      validationRules.required(),
      validationRules.pattern(/^\+[1-9]\d{1,14}$/, 'Please enter a valid MSISDN in E.164 format')
    ),
  },

  impi: {
    label: 'IMPI (Private Identity)',
    placeholder: '1234567890@example.com',
    helpText: 'Private user identity in email format',
    rules: validationRules.compose(
      validationRules.required(),
      validationRules.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'IMPI must be in email format')
    ),
  },

  impu: {
    label: 'IMPU (Public Identity)',
    placeholder: 'sip:1234567890@example.com',
    helpText: 'Public user identity in SIP URI format',
    rules: validationRules.compose(
      validationRules.required(),
      validationRules.pattern(/^sip:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'IMPU must be in SIP URI format')
    ),
  },
};
