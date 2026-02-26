/**
 * Create Admin User Script
 *
 * Run this script to create the initial admin user after setting up the database.
 *
 * Usage:
 *   npx tsx scripts/create-admin-user.ts <username> <password>
 *
 * Example:
 *   npx tsx scripts/create-admin-user.ts admin mySecurePassword123
 */

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { loadEnvConfig } from '@next/env';

// Load environment variables
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production');

const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = '3306',
  MYSQL_DATABASE = 'stem_story',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
} = process.env;

async function createAdminUser(username: string, password: string) {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: parseInt(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  });

  try {
    console.log(`Creating admin user: ${username}`);

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `admin-${Date.now()}`;
    const now = Date.now();

    await connection.execute(
      `INSERT INTO users (id, username, password_hash, display_name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, 'admin', TRUE, ?)`,
      [userId, username, passwordHash, username, now]
    );

    console.log('✓ Admin user created successfully!');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: admin`);
    console.log('\nYou can now login at: http://localhost:3000/login');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('✗ Username already exists!');
    } else {
      console.error('✗ Error creating user:', error.message);
    }
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0];
const password = args[1];

if (!username || !password) {
  console.log('Usage: npx tsx scripts/create-admin-user.ts <username> <password>');
  console.log('Example: npx tsx scripts/create-admin-user.ts admin mySecurePassword123');
  process.exit(1);
}

createAdminUser(username, password);
