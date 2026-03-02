import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection().then((connection) => {
  console.log(
    `${chalk.green('✓')} ${chalk.bold('Database:')} ${chalk.cyan('Connected successfully')} ${chalk.dim('│')} ` +
    `${chalk.dim('Database:')} ${chalk.cyan(process.env.DB_NAME)}`
  );
  connection.release();
}).catch((error) => {
  console.error(
    `${chalk.red('✗')} ${chalk.bold('Database:')} ${chalk.red('Connection failed')} ${chalk.dim('│')} ` +
    `${chalk.yellow('Error:')} ${error.message}`
  );
});

/**
 * Execute a query and return results
 * @example
 * const users = await query('SELECT * FROM users WHERE id = ?', [123]);
 */
export async function query<T = any>(
  sql: string,
  values?: any[]
): Promise<T[]> {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    connection.release();
    return results as T[];
  } catch (error) {
    console.error(
      `${chalk.red('✗')} ${chalk.bold('Database Query Error:')} ${chalk.red((error as Error).message)}`
    );
    throw error;
  }
}

/**
 * Execute an insert query and return the insert ID
 * @example
 * const insertId = await insert('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
 */
export async function insert(sql: string, values?: any[]): Promise<number> {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    connection.release();
    return (results as any).insertId;
  } catch (error) {
    console.error(
      `${chalk.red('✗')} ${chalk.bold('Database Insert Error:')} ${chalk.red((error as Error).message)}`
    );
    throw error;
  }
}

/**
 * Execute an update query and return affected rows
 * @example
 * const affectedRows = await update('UPDATE users SET name = ? WHERE id = ?', ['Jane', 123]);
 */
export async function update(sql: string, values?: any[]): Promise<number> {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    connection.release();
    return (results as any).affectedRows;
  } catch (error) {
    console.error(
      `${chalk.red('✗')} ${chalk.bold('Database Update Error:')} ${chalk.red((error as Error).message)}`
    );
    throw error;
  }
}

/**
 * Execute an delete query and return affected rows
 * @example
 * const affectedRows = await remove('DELETE FROM users WHERE id = ?', [ 123]);
 */
export async function remove(sql: string, values?: any[]): Promise<number> {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    connection.release();
    return (results as any).affectedRows;
  } catch (error) {
    console.error(
      `${chalk.red('✗')} ${chalk.bold('Database Delete Error:')} ${chalk.red((error as Error).message)}`
    );
    throw error;
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
