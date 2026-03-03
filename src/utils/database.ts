import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { schema } from './schema';

dotenv.config();

let pool: mysql.Pool | null = null;

/**
 * Initialize database connection and create tables if they don't exist
 * @example
 * await database.instance();
 */
export async function instance() {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    try {
        const connection = await pool.getConnection();
        console.log(
            `${chalk.green('✓')} ${chalk.bold('Database:')} ${chalk.cyan('Connected successfully')} ${chalk.dim('│')} ` +
            `${chalk.dim('Database:')} ${chalk.cyan(process.env.DB_NAME)}`
        );

        // Check existing tables before creation
        const [existingTables] = await connection.execute(
            'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
            [process.env.DB_NAME!]
        ) as any;
        const existingTableNames = new Set((existingTables as any[]).map(t => t.TABLE_NAME));

        // Create tables if they don't exist
        const statements = schema.split(';').filter(stmt => stmt.trim());
        const createdTables: string[] = [];

        for (const statement of statements) {
            if (statement.trim()) {
                const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
                const tableName = tableMatch ? tableMatch[1] : null;

                if (tableName && !existingTableNames.has(tableName)) {
                    createdTables.push(tableName);
                }

                await connection.execute(statement);
            }
        }

        if (createdTables.length > 0) {
            console.log(
                `${chalk.green('✓')} ${chalk.bold('Tables Created:')} ${chalk.cyan(createdTables.join(', '))}`
            );
        } else {
            console.log(
                `${chalk.cyan('ℹ')} ${chalk.bold('Tables:')} ${chalk.cyan('All tables already exist')}`
            );
        }

        connection.release();
    } catch (error) {
        console.error(
            `${chalk.red('✗')} ${chalk.bold('Database:')} ${chalk.red('Connection failed')} ${chalk.dim('│')} ` +
            `${chalk.yellow('Error:')} ${(error as Error).message}`
        );
        throw error;
    }
}

/**
 * Execute a query and return results
 * @example
 * const users = await query('SELECT * FROM users WHERE id = ?', [123]);
 */
export async function query<T = any>(
    sql: string,
    values?: any[]
): Promise<T[]> {
    if (!pool) throw new Error('Database not initialized. Call instance() first.');
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
    if (!pool) throw new Error('Database not initialized. Call instance() first.');
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
    if (!pool) throw new Error('Database not initialized. Call instance() first.');
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
    if (!pool) throw new Error('Database not initialized. Call instance() first.');
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
    if (!pool) throw new Error('Database not initialized. Call instance() first.');
    await pool.end();
}

export default pool;
