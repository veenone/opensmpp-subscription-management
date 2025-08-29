// Validation utility functions
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const isEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

export const isPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isMsisdn = (msisdn: string): boolean => {
  // E.164 format: + followed by 1-15 digits
  const msisdnRegex = /^\+[1-9]\d{1,14}$/;
  return msisdnRegex.test(msisdn);
};

export const isImpi = (impi: string): boolean => {
  // IMPI format: email-like format
  const impiRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return impiRegex.test(impi);
};

export const isImpu = (impu: string): boolean => {
  // IMPU format: SIP URI format
  const impuRegex = /^sip:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return impuRegex.test(impu);
};

export const isUrl = (url: string): boolean => {
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  return urlRegex.test(url);
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

export const isNumeric = (value: string | number): boolean => {
  return !isNaN(Number(value)) && !isNaN(parseFloat(String(value)));
};

export const isPositiveNumber = (value: string | number): boolean => {
  const num = Number(value);
  return isNumeric(value) && num > 0;
};

export const isInteger = (value: string | number): boolean => {
  const num = Number(value);
  return isNumeric(value) && Number.isInteger(num);
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const hasMinLength = (value: string, minLength: number): boolean => {
  return Boolean(value && value.length >= minLength);
};

export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return !value || value.length <= maxLength;
};

export const isAlphabetic = (value: string): boolean => {
  const alphabeticRegex = /^[A-Za-z]+$/;
  return alphabeticRegex.test(value);
};

export const isAlphanumeric = (value: string): boolean => {
  const alphanumericRegex = /^[A-Za-z0-9]+$/;
  return alphanumericRegex.test(value);
};

export const isUsername = (username: string): boolean => {
  // Username: 3-20 characters, letters, numbers, underscores, hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const isIpAddress = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export const isMacAddress = (mac: string): boolean => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

export const isDateString = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

export const isFutureDate = (date: string | Date): boolean => {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate > now;
};

export const isPastDate = (date: string | Date): boolean => {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate < now;
};

// Validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  msisdn: 'Please enter a valid MSISDN in E.164 format',
  impi: 'Please enter a valid IMPI in email format',
  impu: 'Please enter a valid IMPU in SIP URI format',
  url: 'Please enter a valid URL',
  strongPassword: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  numeric: 'Please enter a valid number',
  positiveNumber: 'Please enter a positive number',
  integer: 'Please enter a whole number',
  alphabetic: 'Please enter only letters',
  alphanumeric: 'Please enter only letters and numbers',
  username: 'Username must be 3-20 characters (letters, numbers, _, -)',
  ipAddress: 'Please enter a valid IP address',
  macAddress: 'Please enter a valid MAC address',
  dateString: 'Please enter a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
  range: (min: number, max: number) => `Value must be between ${min} and ${max}`,
};

// Composite validators
export const validators = {
  required: (value: any) => isRequired(value) || validationMessages.required,
  email: (value: string) => !value || isEmail(value) || validationMessages.email,
  phone: (value: string) => !value || isPhoneNumber(value) || validationMessages.phone,
  msisdn: (value: string) => !value || isMsisdn(value) || validationMessages.msisdn,
  impi: (value: string) => !value || isImpi(value) || validationMessages.impi,
  impu: (value: string) => !value || isImpu(value) || validationMessages.impu,
  url: (value: string) => !value || isUrl(value) || validationMessages.url,
  strongPassword: (value: string) => !value || isStrongPassword(value) || validationMessages.strongPassword,
  numeric: (value: string) => !value || isNumeric(value) || validationMessages.numeric,
  positiveNumber: (value: string) => !value || isPositiveNumber(value) || validationMessages.positiveNumber,
  integer: (value: string) => !value || isInteger(value) || validationMessages.integer,
  alphabetic: (value: string) => !value || isAlphabetic(value) || validationMessages.alphabetic,
  alphanumeric: (value: string) => !value || isAlphanumeric(value) || validationMessages.alphanumeric,
  username: (value: string) => !value || isUsername(value) || validationMessages.username,
  ipAddress: (value: string) => !value || isIpAddress(value) || validationMessages.ipAddress,
  macAddress: (value: string) => !value || isMacAddress(value) || validationMessages.macAddress,
  dateString: (value: string) => !value || isDateString(value) || validationMessages.dateString,
  futureDate: (value: string) => !value || isFutureDate(value) || validationMessages.futureDate,
  pastDate: (value: string) => !value || isPastDate(value) || validationMessages.pastDate,
  minLength: (min: number) => (value: string) => !value || hasMinLength(value, min) || validationMessages.minLength(min),
  maxLength: (max: number) => (value: string) => !value || hasMaxLength(value, max) || validationMessages.maxLength(max),
  range: (min: number, max: number) => (value: number) => !value || isInRange(value, min, max) || validationMessages.range(min, max),
};
