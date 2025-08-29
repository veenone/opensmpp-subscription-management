import { apiClient } from './apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  provider?: 'DATABASE' | 'LDAP' | 'OAUTH2';
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}

class AuthService {
  private readonly basePath = '/auth';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post(`${this.basePath}/login`, credentials);
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/logout`);
    } catch (error) {
      // Even if logout fails on server, we clear local storage
      console.warn('Server logout failed:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post(`${this.basePath}/refresh`, { refreshToken });
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get(`${this.basePath}/me`);
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    return apiClient.post(`${this.basePath}/change-password`, request);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    return apiClient.post(`${this.basePath}/reset-password`, request);
  }

  async updateProfile(request: ProfileUpdateRequest): Promise<User> {
    return apiClient.put(`${this.basePath}/profile`, request);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await apiClient.get(`${this.basePath}/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Check if user has specific permission
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    return user.permissions.includes(permission);
  }

  // Check if user has any of the specified roles
  hasRole(user: User | null, roles: string[]): boolean {
    if (!user) return false;
    return user.roles.some(role => roles.includes(role.name));
  }

  // Check if user has all specified permissions
  hasAllPermissions(user: User | null, permissions: string[]): boolean {
    if (!user) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(user: User | null, permissions: string[]): boolean {
    if (!user) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  }
}

export const authApi = new AuthService();
export default authApi;