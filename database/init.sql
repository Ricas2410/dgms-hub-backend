-- DGMS Hub Database Initialization Script
-- This script creates the database and sets up initial configuration

-- Create database (run this as postgres superuser)
-- CREATE DATABASE dgms_hub;
-- CREATE USER dgms_hub_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE dgms_hub TO dgms_hub_user;

-- Connect to the dgms_hub database before running the rest

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'moderator');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'REORDER', 'ACTIVATE', 'DEACTIVATE');
CREATE TYPE audit_entity_type AS ENUM ('USER', 'APPLICATION', 'SYSTEM');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role NOT NULL DEFAULT 'moderator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    icon_path VARCHAR(255),
    category VARCHAR(50),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    background_color VARCHAR(7),
    text_color VARCHAR(7),
    requires_auth BOOLEAN NOT NULL DEFAULT false,
    open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action audit_action NOT NULL,
    entity_type audit_entity_type NOT NULL,
    entity_id UUID,
    user_id UUID NOT NULL REFERENCES users(id),
    application_id UUID REFERENCES applications(id),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_applications_display_order ON applications(display_order);
CREATE INDEX IF NOT EXISTS idx_applications_category ON applications(category);
CREATE INDEX IF NOT EXISTS idx_applications_is_active ON applications(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_name ON applications(name);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_application_id ON audit_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Note: In production, change this password immediately after first login
INSERT INTO users (
    id,
    username, 
    email, 
    password, 
    first_name, 
    last_name, 
    role
) VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@dgms.edu',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS', -- admin123
    'System',
    'Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample applications
INSERT INTO applications (
    id,
    name,
    description,
    url,
    category,
    display_order,
    background_color,
    text_color,
    created_by
) VALUES 
(
    uuid_generate_v4(),
    'Student Portal',
    'Access your grades, schedules, and academic information',
    'https://portal.dgms.edu',
    'Academic',
    1,
    '#1976D2',
    '#FFFFFF',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
),
(
    uuid_generate_v4(),
    'Library Catalog',
    'Search and reserve books from the school library',
    'https://library.dgms.edu',
    'Academic',
    2,
    '#388E3C',
    '#FFFFFF',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
),
(
    uuid_generate_v4(),
    'Learning Management System',
    'Access course materials, assignments, and online classes',
    'https://lms.dgms.edu',
    'Academic',
    3,
    '#F57C00',
    '#FFFFFF',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
),
(
    uuid_generate_v4(),
    'School Email',
    'Access your school email account',
    'https://mail.dgms.edu',
    'Communication',
    4,
    '#D32F2F',
    '#FFFFFF',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
),
(
    uuid_generate_v4(),
    'Cafeteria Menu',
    'View daily menu and nutritional information',
    'https://cafeteria.dgms.edu',
    'Services',
    5,
    '#7B1FA2',
    '#FFFFFF',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Create a view for application statistics
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    a.id,
    a.name,
    a.category,
    a.is_active,
    COUNT(al.id) as total_actions,
    COUNT(CASE WHEN al.action = 'CREATE' THEN 1 END) as creates,
    COUNT(CASE WHEN al.action = 'UPDATE' THEN 1 END) as updates,
    COUNT(CASE WHEN al.action = 'DELETE' THEN 1 END) as deletes,
    MAX(al.created_at) as last_modified
FROM applications a
LEFT JOIN audit_logs al ON a.id = al.application_id
GROUP BY a.id, a.name, a.category, a.is_active;

-- Grant permissions to the application user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dgms_hub_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dgms_hub_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO dgms_hub_user;
