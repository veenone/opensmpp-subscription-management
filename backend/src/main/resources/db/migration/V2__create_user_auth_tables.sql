-- V2__create_user_auth_tables.sql
-- Create user authentication and authorization tables

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    failed_login_attempts INT DEFAULT 0,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP,
    auth_provider VARCHAR(20) DEFAULT 'DATABASE',
    ldap_dn VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    old_values TEXT,
    new_values TEXT,
    change_details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    correlation_id VARCHAR(100),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms BIGINT,
    is_external_change BOOLEAN DEFAULT false,
    external_source VARCHAR(100),
    checksum VARCHAR(64)
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_roles_name ON roles(name);

CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_category ON permissions(category);

CREATE INDEX idx_audit_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_name);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Insert default roles
INSERT INTO roles (name, description, is_system_role) VALUES
    ('ROLE_ADMIN', 'System Administrator with full access', true),
    ('ROLE_USER', 'Standard user with basic access', true),
    ('ROLE_OPERATOR', 'Operations user with subscription management access', true),
    ('ROLE_VIEWER', 'Read-only access to system', true),
    ('ROLE_API_USER', 'API access for external systems', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, category) VALUES
    -- Subscription permissions
    ('SUBSCRIPTION_CREATE', 'Create new subscriptions', 'SUBSCRIPTION'),
    ('SUBSCRIPTION_READ', 'View subscriptions', 'SUBSCRIPTION'),
    ('SUBSCRIPTION_UPDATE', 'Update existing subscriptions', 'SUBSCRIPTION'),
    ('SUBSCRIPTION_DELETE', 'Delete subscriptions', 'SUBSCRIPTION'),
    ('SUBSCRIPTION_BULK_IMPORT', 'Import multiple subscriptions', 'SUBSCRIPTION'),
    ('SUBSCRIPTION_BULK_EXPORT', 'Export subscription data', 'SUBSCRIPTION'),
    
    -- User management permissions
    ('USER_CREATE', 'Create new users', 'USER'),
    ('USER_READ', 'View user information', 'USER'),
    ('USER_UPDATE', 'Update user information', 'USER'),
    ('USER_DELETE', 'Delete users', 'USER'),
    ('USER_MANAGE_ROLES', 'Manage user roles', 'USER'),
    
    -- Cache management permissions
    ('CACHE_MANAGE', 'Manage cache settings', 'CACHE'),
    ('CACHE_INVALIDATE', 'Invalidate cache entries', 'CACHE'),
    
    -- Synchronization permissions
    ('SYNC_EXECUTE', 'Execute synchronization', 'SYNC'),
    ('SYNC_MONITOR', 'Monitor synchronization status', 'SYNC'),
    
    -- Audit permissions
    ('AUDIT_READ', 'View audit logs', 'AUDIT'),
    ('AUDIT_EXPORT', 'Export audit logs', 'AUDIT'),
    
    -- System permissions
    ('SYSTEM_CONFIGURE', 'Configure system settings', 'SYSTEM'),
    ('SYSTEM_MONITOR', 'Monitor system health', 'SYSTEM'),
    ('SYSTEM_BACKUP', 'Perform system backups', 'SYSTEM')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Operator gets subscription and sync permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_OPERATOR'
AND p.category IN ('SUBSCRIPTION', 'SYNC', 'CACHE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- User gets basic read and update permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_USER'
AND p.name IN ('SUBSCRIPTION_READ', 'SUBSCRIPTION_UPDATE', 'USER_READ', 'USER_UPDATE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer gets all read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_VIEWER'
AND (p.name LIKE '%_READ' OR p.name LIKE '%_MONITOR')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- API User gets subscription and sync permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_API_USER'
AND p.category IN ('SUBSCRIPTION', 'SYNC')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create default admin user (password: Admin@123! - should be changed on first login)
-- Password is bcrypt hash of Admin@123!
INSERT INTO users (username, email, password, first_name, last_name, is_active, password_changed_at, created_by)
VALUES ('admin', 'admin@smpp-system.local', '$2a$10$VQdOZQPbVKPLv8xRmYpGPOvEq2BwRfBA6z9dhuaMA82mE9j6Kqn2O', 
        'System', 'Administrator', true, CURRENT_TIMESTAMP, 'SYSTEM')
ON CONFLICT (username) DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT u.id, r.id, 'SYSTEM'
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();