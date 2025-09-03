import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import { authApi, User } from '../authService';
import type { Permission, Role } from '../../types';

// Mock console methods to test logging
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});

// Mock data setup
const createMockPermission = (id: number, name: string): Permission => ({
  id,
  name,
  description: `Permission ${name}`,
  resource: 'test',
  action: 'test',
});

const createMockRole = (id: number, name: string, permissions: Permission[]): Role => ({
  id,
  name,
  description: `Role ${name}`,
  permissions,
  isSystem: false,
});

const createMockUser = (id: number, username: string, roles: Role[]): User => ({
  id,
  username,
  email: `${username}@test.com`,
  firstName: 'Test',
  lastName: 'User',
  roles,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
});

describe('AuthService Permission System', () => {
  beforeEach(() => {
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
    mockConsoleDebug.mockClear();
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleDebug.mockRestore();
  });

  describe('hasPermission', () => {
    it('should return false for null user', () => {
      const result = authApi.hasPermission(null, 'TEST_PERMISSION');
      expect(result).toBe(false);
      expect(mockConsoleDebug).toHaveBeenCalledWith('AuthService.hasPermission: user is null');
    });

    it('should return false for invalid permission parameter', () => {
      const permissions = [createMockPermission(1, 'TEST_PERMISSION')];
      const roles = [createMockRole(1, 'TEST_ROLE', permissions)];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasPermission(user, '')).toBe(false);
      expect(authApi.hasPermission(user, null as any)).toBe(false);
      expect(authApi.hasPermission(user, undefined as any)).toBe(false);
      expect(authApi.hasPermission(user, 123 as any)).toBe(false);

      expect(mockConsoleWarn).toHaveBeenCalledWith('AuthService.hasPermission: invalid permission parameter', expect.any(Object));
    });

    it('should return true when user has the required permission', () => {
      const permissions = [createMockPermission(1, 'TEST_PERMISSION')];
      const roles = [createMockRole(1, 'TEST_ROLE', permissions)];
      const user = createMockUser(1, 'testuser', roles);

      const result = authApi.hasPermission(user, 'TEST_PERMISSION');
      expect(result).toBe(true);
    });

    it('should return false when user does not have the required permission', () => {
      const permissions = [createMockPermission(1, 'OTHER_PERMISSION')];
      const roles = [createMockRole(1, 'TEST_ROLE', permissions)];
      const user = createMockUser(1, 'testuser', roles);

      const result = authApi.hasPermission(user, 'TEST_PERMISSION');
      expect(result).toBe(false);
    });

    it('should handle user with no roles', () => {
      const user = createMockUser(1, 'testuser', []);

      const result = authApi.hasPermission(user, 'TEST_PERMISSION');
      expect(result).toBe(false);
    });

    it('should handle user with null roles', () => {
      const user = { ...createMockUser(1, 'testuser', []), roles: null as any };

      const result = authApi.hasPermission(user, 'TEST_PERMISSION');
      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith('AuthService.getUserPermissions: user.roles is null, undefined, or not an array', expect.any(Object));
    });

    it('should handle roles with null permissions', () => {
      const roleWithNullPermissions = { ...createMockRole(1, 'TEST_ROLE', []), permissions: null as any };
      const user = createMockUser(1, 'testuser', [roleWithNullPermissions]);

      const result = authApi.hasPermission(user, 'TEST_PERMISSION');
      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith('AuthService.getUserPermissions: invalid role or permissions structure', expect.any(Object));
    });

    it('should handle permissions with missing names', () => {
      const invalidPermission = { ...createMockPermission(1, 'TEST_PERMISSION'), name: null as any };
      const validPermission = createMockPermission(2, 'VALID_PERMISSION');
      const roles = [createMockRole(1, 'TEST_ROLE', [invalidPermission, validPermission])];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasPermission(user, 'TEST_PERMISSION')).toBe(false);
      expect(authApi.hasPermission(user, 'VALID_PERMISSION')).toBe(true);
    });

    it('should find permissions across multiple roles', () => {
      const permissions1 = [createMockPermission(1, 'PERMISSION_1')];
      const permissions2 = [createMockPermission(2, 'PERMISSION_2')];
      const roles = [
        createMockRole(1, 'ROLE_1', permissions1),
        createMockRole(2, 'ROLE_2', permissions2)
      ];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasPermission(user, 'PERMISSION_1')).toBe(true);
      expect(authApi.hasPermission(user, 'PERMISSION_2')).toBe(true);
      expect(authApi.hasPermission(user, 'PERMISSION_3')).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return false for null user', () => {
      const result = authApi.hasRole(null, ['TEST_ROLE']);
      expect(result).toBe(false);
    });

    it('should return false for invalid roles parameter', () => {
      const roles = [createMockRole(1, 'TEST_ROLE', [])];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasRole(user, null as any)).toBe(false);
      expect(authApi.hasRole(user, undefined as any)).toBe(false);
      expect(authApi.hasRole(user, 'TEST_ROLE' as any)).toBe(false);

      expect(mockConsoleWarn).toHaveBeenCalledWith('AuthService.hasRole: invalid roles parameter', expect.any(Object));
    });

    it('should return true when user has any of the specified roles', () => {
      const roles = [createMockRole(1, 'ADMIN'), createMockRole(2, 'USER')];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasRole(user, ['ADMIN'])).toBe(true);
      expect(authApi.hasRole(user, ['USER'])).toBe(true);
      expect(authApi.hasRole(user, ['ADMIN', 'MODERATOR'])).toBe(true);
      expect(authApi.hasRole(user, ['MODERATOR', 'GUEST'])).toBe(false);
    });

    it('should handle user with no roles', () => {
      const user = createMockUser(1, 'testuser', []);
      expect(authApi.hasRole(user, ['ADMIN'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return false for null user', () => {
      const result = authApi.hasAllPermissions(null, ['PERMISSION_1']);
      expect(result).toBe(false);
    });

    it('should return true when user has all specified permissions', () => {
      const permissions = [
        createMockPermission(1, 'PERMISSION_1'),
        createMockPermission(2, 'PERMISSION_2'),
        createMockPermission(3, 'PERMISSION_3')
      ];
      const roles = [createMockRole(1, 'TEST_ROLE', permissions)];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasAllPermissions(user, ['PERMISSION_1', 'PERMISSION_2'])).toBe(true);
      expect(authApi.hasAllPermissions(user, ['PERMISSION_1', 'PERMISSION_2', 'PERMISSION_3'])).toBe(true);
      expect(authApi.hasAllPermissions(user, ['PERMISSION_1', 'PERMISSION_4'])).toBe(false);
    });

    it('should handle empty permissions array', () => {
      const user = createMockUser(1, 'testuser', []);
      expect(authApi.hasAllPermissions(user, [])).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return false for null user', () => {
      const result = authApi.hasAnyPermission(null, ['PERMISSION_1']);
      expect(result).toBe(false);
    });

    it('should return true when user has any of the specified permissions', () => {
      const permissions = [
        createMockPermission(1, 'PERMISSION_1'),
        createMockPermission(2, 'PERMISSION_2')
      ];
      const roles = [createMockRole(1, 'TEST_ROLE', permissions)];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasAnyPermission(user, ['PERMISSION_1'])).toBe(true);
      expect(authApi.hasAnyPermission(user, ['PERMISSION_1', 'PERMISSION_3'])).toBe(true);
      expect(authApi.hasAnyPermission(user, ['PERMISSION_3', 'PERMISSION_4'])).toBe(false);
    });

    it('should handle empty permissions array', () => {
      const permissions = [createMockPermission(1, 'PERMISSION_1')];
      const roles = [createMockRole(1, 'TEST_ROLE', permissions)];
      const user = createMockUser(1, 'testuser', roles);

      expect(authApi.hasAnyPermission(user, [])).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed user data gracefully', () => {
      const validRole = createMockRole(1, 'VALID_ROLE', [createMockPermission(1, 'VALID_PERMISSION')]);
      const malformedUser = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        roles: [
          validRole,
          null,
          undefined,
          { id: 2, name: null, permissions: null },
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      } as any;

      // Should find the valid permission despite malformed entries
      expect(authApi.hasPermission(malformedUser, 'VALID_PERMISSION')).toBe(true);
      // Should handle role checking without errors (basic functionality test)
      expect(() => authApi.hasRole(malformedUser, ['VALID_ROLE'])).not.toThrow();
      // Should still log warnings about malformed data
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should handle permissions with invalid structure', () => {
      const roleWithInvalidPermissions = {
        id: 1,
        name: 'TEST_ROLE',
        description: 'Test Role',
        permissions: [
          { id: 1, name: 'VALID_PERMISSION' },
          { id: 2 }, // missing name
          null,
          undefined,
          'invalid_permission',
        ] as any,
      };
      
      const user = createMockUser(1, 'testuser', [roleWithInvalidPermissions]);

      expect(authApi.hasPermission(user, 'VALID_PERMISSION')).toBe(true);
      expect(authApi.hasPermission(user, 'INVALID_PERMISSION')).toBe(false);
    });

    it('should handle exceptions during permission extraction', () => {
      // Create a user with roles that will cause an error when accessing permissions
      const problematicUser = {
        ...createMockUser(1, 'testuser', []),
        roles: [
          {
            get permissions() {
              throw new Error('Test error');
            },
          },
        ] as any,
      };

      const result = authApi.hasPermission(problematicUser, 'ANY_PERMISSION');
      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith('AuthService.getUserPermissions: error extracting permissions', expect.any(Error), expect.any(Object));
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large numbers of roles and permissions efficiently', () => {
      const permissions: Permission[] = [];
      const roles: Role[] = [];

      // Create 100 permissions and 10 roles with 10 permissions each
      for (let i = 0; i < 100; i++) {
        permissions.push(createMockPermission(i, `PERMISSION_${i}`));
      }

      for (let i = 0; i < 10; i++) {
        const rolePermissions = permissions.slice(i * 10, (i + 1) * 10);
        roles.push(createMockRole(i, `ROLE_${i}`, rolePermissions));
      }

      const user = createMockUser(1, 'testuser', roles);

      const startTime = performance.now();
      
      // Test multiple permission checks
      for (let i = 0; i < 100; i++) {
        authApi.hasPermission(user, `PERMISSION_${i}`);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (less than 100ms for 100 checks)
      expect(executionTime).toBeLessThan(100);
    });
  });
});