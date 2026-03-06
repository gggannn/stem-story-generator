-- Add phone column to users table
ALTER TABLE users
ADD COLUMN phone VARCHAR(20) UNIQUE NULL COMMENT '手机号',
ADD INDEX idx_phone (phone);

-- Create SMS verification codes table
CREATE TABLE sms_verification_codes (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  INDEX idx_phone_expires (phone, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create SMS rate limits table
CREATE TABLE sms_rate_limits (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  sent_at BIGINT NOT NULL,
  INDEX idx_phone_sent (phone, sent_at),
  INDEX idx_ip_sent (ip_address, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
