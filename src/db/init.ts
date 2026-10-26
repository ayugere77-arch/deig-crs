import { connection } from './index';

export async function initDatabaseTables(): Promise<boolean> {
  if (!connection) {
    return false;
  }

  try {
    // 1. Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL UNIQUE,
        \`description\` TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Industries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`industries\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Departments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`departments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) DEFAULT 'Investigator',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Reports table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`reports\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`tracking_id\` VARCHAR(50) NOT NULL UNIQUE,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`date\` VARCHAR(50),
        \`location\` VARCHAR(255),
        \`organization\` VARCHAR(255),
        \`status\` VARCHAR(50) DEFAULT 'Submitted',
        \`priority\` VARCHAR(20) DEFAULT 'Medium',
        \`category\` VARCHAR(50),
        \`evidence\` JSON,
        \`is_anonymous\` BOOLEAN DEFAULT FALSE,
        \`reporter\` VARCHAR(255),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('[MySQL] Database tables verified / created successfully.');
    return true;
  } catch (error) {
    console.error('[MySQL] Table initialization error:', error);
    return false;
  }
}
