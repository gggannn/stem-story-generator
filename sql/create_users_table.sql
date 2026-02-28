-- Create users table for STEM Story Generator authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at BIGINT NOT NULL,
  last_login_at BIGINT,
  INDEX idx_username (username),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create initial admin user (password: admin123)
-- Note: Change the password after first login!
INSERT INTO users (id, username, password_hash, display_name, role, is_active, created_at)
VALUES (
  'admin-001',
  'admin',
  '$2b$10$bsZjyg9y1sjVKJQWMwwSg.Da9QeCulX0NpyNNOp0MdOjBmpGJXDoC',
  '管理员',
  'admin',
  TRUE,
  UNIX_TIMESTAMP() * 1000
) ON DUPLICATE KEY UPDATE username=username;
