import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

// Initialize database schema (admin only - should be disabled after use)
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();

    // Create users table
    await pool.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Check if admin user exists
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);

    if (!rows || (rows as any[]).length === 0) {
      // Create admin user (password: admin123)
      const passwordHash = '$2b$10$bsZjyg9y1sjVKJQWMwwSg.Da9QeCulX0NpyNNOp0MdOjBmpGJXDoC';
      await pool.query(`
        INSERT INTO users (id, username, password_hash, display_name, role, is_active, created_at)
        VALUES ('admin-001', 'admin', ?, '管理员', 'admin', TRUE, UNIX_TIMESTAMP() * 1000)
      `, [passwordHash]);
    }

    // Verify
    const [users] = await pool.query('SELECT id, username, display_name, role, is_active FROM users');

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      users: users
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check initialization status
export async function GET() {
  try {
    const pool = getPool();
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');

    if (!tables || (tables as any[]).length === 0) {
      return NextResponse.json({
        initialized: false,
        message: 'Users table does not exist'
      });
    }

    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');

    return NextResponse.json({
      initialized: true,
      userCount: (users as any)[0].count
    });
  } catch (error) {
    return NextResponse.json({
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
