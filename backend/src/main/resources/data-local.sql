-- H2 Database initialization for local development
-- Create default admin user with password: Admin@123!

-- Insert default admin user if not exists
INSERT INTO users (username, email, password, first_name, last_name, is_active, password_changed_at, created_by)
SELECT 'admin', 'admin@smpp-system.local', '$2a$10$VQdOZQPbVKPLv8xRmYpGPOvEq2BwRfBA6z9dhuaMA82mE9j6Kqn2O', 
       'System', 'Administrator', true, CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Insert default roles if not exists
INSERT INTO roles (name, description, is_system_role) 
SELECT 'ROLE_ADMIN', 'System Administrator with full access', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

INSERT INTO roles (name, description, is_system_role) 
SELECT 'ROLE_USER', 'Standard user with basic access', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_USER');

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT u.id, r.id, 'SYSTEM'
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);