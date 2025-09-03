import { apiClient } from './apiClient';
import type { Permission, Role } from '../types';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
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
    const url = `${this.basePath}/login`;
    console.log('AuthService login - URL:', url);
    console.log('AuthService login - Credentials:', credentials);
    console.log('AuthService login - Base path:', this.basePath);
    
    try {
      const response = await apiClient.post(url, credentials);
      console.log('Login response:', response);
      return response;
    } catch (error) {
      console.error('Login error in authService:', error);
      throw error;
    }
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

  // Helper method to get all permissions from user roles
  private getUserPermissions(user: User): string[] {
    if (!user) {
      console.warn('AuthService.getUserPermissions: user is null or undefined');
      return [];
    }
    if (!user.roles || !Array.isArray(user.roles)) {
      console.warn('AuthService.getUserPermissions: user.roles is null, undefined, or not an array', { user });
      return [];
    }
    
    try {
      return user.roles.flatMap(role => {
        if (!role || !role.permissions || !Array.isArray(role.permissions)) {
          console.warn('AuthService.getUserPermissions: invalid role or permissions structure', { role });
          return [];
        }
        return role.permissions
          .filter(permission => permission && permission.name)
          .map(permission => permission.name);
      });
    } catch (error) {
      console.error('AuthService.getUserPermissions: error extracting permissions', error, { user });
      return [];
    }
  }

  // Check if user has specific permission
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) {
      console.debug('AuthService.hasPermission: user is null');
      return false;
    }
    if (!permission || typeof permission !== 'string') {
      console.warn('AuthService.hasPermission: invalid permission parameter', { permission });
      return false;
    }
    
    try {
      const userPermissions = this.getUserPermissions(user);
      const hasPermission = userPermissions.includes(permission);
      console.debug('AuthService.hasPermission:', { permission, hasPermission, userPermissions });
      return hasPermission;
    } catch (error) {
      console.error('AuthService.hasPermission: error checking permission', error, { user, permission });
      return false;
    }
  }

  // Check if user has any of the specified roles
  hasRole(user: User | null, roles: string[]): boolean {
    if (!user) {
      console.debug('AuthService.hasRole: user is null');
      return false;
    }
    if (!roles || !Array.isArray(roles)) {
      console.warn('AuthService.hasRole: invalid roles parameter', { roles });
      return false;
    }
    if (!user.roles || !Array.isArray(user.roles)) {
      console.warn('AuthService.hasRole: user.roles is null, undefined, or not an array', { user });
      return false;
    }
    
    try {
      const hasRole = user.roles.some(role => {
        if (!role || !role.name) {
          console.warn('AuthService.hasRole: invalid role structure', { role });
          return false;
        }
        return roles.includes(role.name);
      });
      console.debug('AuthService.hasRole:', { roles, hasRole, userRoles: user.roles.map(r => r.name) });
      return hasRole;
    } catch (error) {
      console.error('AuthService.hasRole: error checking roles', error, { user, roles });
      return false;
    }
  }

  // Check if user has all specified permissions
  hasAllPermissions(user: User | null, permissions: string[]): boolean {
    if (!user) {
      console.debug('AuthService.hasAllPermissions: user is null');
      return false;
    }
    if (!permissions || !Array.isArray(permissions)) {
      console.warn('AuthService.hasAllPermissions: invalid permissions parameter', { permissions });
      return false;
    }
    
    try {
      const userPermissions = this.getUserPermissions(user);
      const hasAllPermissions = permissions.every(permission => {
        if (!permission || typeof permission !== 'string') {
          console.warn('AuthService.hasAllPermissions: invalid permission in array', { permission });
          return false;
        }
        return userPermissions.includes(permission);
      });
      console.debug('AuthService.hasAllPermissions:', { permissions, hasAllPermissions, userPermissions });
      return hasAllPermissions;
    } catch (error) {
      console.error('AuthService.hasAllPermissions: error checking permissions', error, { user, permissions });
      return false;
    }
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(user: User | null, permissions: string[]): boolean {
    if (!user) {
      console.debug('AuthService.hasAnyPermission: user is null');
      return false;
    }
    if (!permissions || !Array.isArray(permissions)) {
      console.warn('AuthService.hasAnyPermission: invalid permissions parameter', { permissions });
      return false;
    }
    
    try {
      const userPermissions = this.getUserPermissions(user);
      const hasAnyPermission = permissions.some(permission => {
        if (!permission || typeof permission !== 'string') {
          console.warn('AuthService.hasAnyPermission: invalid permission in array', { permission });
          return false;
        }
        return userPermissions.includes(permission);
      });
      console.debug('AuthService.hasAnyPermission:', { permissions, hasAnyPermission, userPermissions });
      return hasAnyPermission;
    } catch (error) {
      console.error('AuthService.hasAnyPermission: error checking permissions', error, { user, permissions });
      return false;
    }
  }
}

export const authApi = new AuthService();
export default authApi;