import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import 'dotenv/config';

function createDatabaseConnection(): mysql.Pool | null {
  const connectionString = process.env.DATABASE_URL;
  const host = process.env.MYSQL_HOST || process.env.MYSQLHOST;
  const user = process.env.MYSQL_USER || process.env.MYSQLUSER;
  const password = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD;
  const database = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE;
  const port = Number(process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306);
  const explicitSsl = process.env.MYSQL_SSL;

  // Check if SSL should be enabled (common for cloud-hosted MySQL like Aiven, PlanetScale, TiDB, etc.)
  const shouldEnableSsl = explicitSsl === 'true' || 
    explicitSsl === '1' || 
    (connectionString && (connectionString.includes('ssl=') || connectionString.includes('sslmode=')));

  if (connectionString) {
    try {
      const poolConfig: mysql.PoolOptions = {
        uri: connectionString,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      };

      if (shouldEnableSsl || connectionString.includes('aivencloud.com') || connectionString.includes('tidbcloud.com')) {
        poolConfig.ssl = { rejectUnauthorized: false };
      }

      return mysql.createPool(poolConfig);
    } catch (err) {
      console.error('[MySQL] Failed to parse DATABASE_URL:', err);
    }
  } else if (host && user && database) {
    try {
      const poolConfig: mysql.PoolOptions = {
        host,
        port,
        user,
        password: password || '',
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: shouldEnableSsl ? { rejectUnauthorized: false } : undefined,
      };
      return mysql.createPool(poolConfig);
    } catch (err) {
      console.error('[MySQL] Failed to initialize connection pool with host/user:', err);
    }
  }

  console.warn('[MySQL] No DATABASE_URL or MYSQL_* environment variables provided. Operating in fallback mode.');
  return null;
}

export const connection = createDatabaseConnection();
export const db = connection ? drizzle(connection, { schema, mode: 'default' }) : null;

export async function checkConnection(): Promise<boolean> {
  if (!connection) return false;
  try {
    await connection.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('[MySQL] Health check ping failed:', error);
    return false;
  }
}
