// Date formatting utilities
export const formatDate = (date: string | Date | null, _format = 'MM/dd/yyyy'): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return d.toLocaleDateString('en-US', options);
};

export const formatDateTime = (date: string | Date | null, includeSeconds = false): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  };

  return d.toLocaleString('en-US', options);
};

export const formatTime = (date: string | Date | null, format24h = false): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !format24h,
  };

  return d.toLocaleTimeString('en-US', options);
};

export const formatRelativeTime = (date: string | Date | null): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  return formatDate(date);
};

// Number formatting utilities
export const formatNumber = (num: number | null | undefined, decimals = 0): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (amount: number | null | undefined, currency = 'USD'): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercent = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '-';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// String formatting utilities
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // US phone number format
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // International format
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, -10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  return phone;
};

export const formatMsisdn = (msisdn: string | null | undefined): string => {
  if (!msisdn) return '-';
  
  // Ensure E.164 format
  if (!msisdn.startsWith('+')) {
    return `+${msisdn}`;
  }
  
  return msisdn;
};

export const truncateText = (text: string | null | undefined, maxLength = 50): string => {
  if (!text) return '-';
  
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength - 3)}...`;
};

export const capitalizeFirst = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const kebabToTitle = (str: string): string => {
  return str
    .split('-')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Status formatting utilities
export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return '-';
  
  return status
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const getStatusColor = (status: string | null | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (!status) return 'default';
  
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'active':
    case 'enabled':
    case 'online':
    case 'connected':
    case 'success':
    case 'completed':
      return 'success';
    
    case 'inactive':
    case 'disabled':
    case 'offline':
    case 'disconnected':
    case 'error':
    case 'failed':
    case 'terminated':
      return 'error';
    
    case 'pending':
    case 'processing':
    case 'in_progress':
    case 'warning':
    case 'suspended':
      return 'warning';
    
    case 'info':
    case 'draft':
      return 'info';
    
    default:
      return 'default';
  }
};
