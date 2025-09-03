import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Debug logging
console.log('API Client Configuration:', {
  API_BASE_URL,
  env: import.meta.env,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
});

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Ensure base URL is valid - use proxy path to avoid CORS issues
    const baseURL = API_BASE_URL || '/api';
    
    console.log('Creating axios instance with baseURL:', baseURL);
    
    this.client = axios.create({
      baseURL: baseURL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
            headers: response.headers,
          });
        }

        return response;
      },
      (error) => {
        const { response } = error;

        // Log error in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: response?.status,
            data: response?.data,
            message: error.message,
          });
        }

        // Handle specific HTTP errors
        if (response) {
          const { status, data } = response;

          switch (status) {
            case 401:
              // Unauthorized - clear token and redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
              break;
            case 403:
              // Forbidden - show access denied message
              console.error('Access denied:', data?.message || 'Insufficient permissions');
              break;
            case 404:
              console.error('Resource not found:', data?.message || 'The requested resource was not found');
              break;
            case 429:
              console.error('Rate limit exceeded:', data?.message || 'Too many requests');
              break;
            case 500:
              console.error('Internal server error:', data?.message || 'Something went wrong on the server');
              break;
            default:
              console.error(`API error (${status}):`, data?.message || error.message);
          }
        } else if (error.code === 'ECONNABORTED') {
          console.error('Request timeout:', error.message);
        } else if (!error.response) {
          console.error('Network error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log('API post called with:', {
      url,
      data,
      baseURL: this.client.defaults.baseURL,
      fullURL: `${this.client.defaults.baseURL}${url}`
    });
    
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      console.error('Post request failed:', {
        url,
        baseURL: this.client.defaults.baseURL,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<T>(url, formData, config);
    return response.data;
  }

  // File download method
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Get the underlying axios instance for advanced usage
  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient;