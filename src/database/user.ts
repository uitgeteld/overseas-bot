import { query, insert } from "./main";

export async function createUser(userId: string, ): Promise<void | Error> {
    try {
        const existing = await getUser(userId);
        if (existing) return new Error('User already exists');

        await insert('INSERT INTO users (`id`) VALUES (?)', [userId]);
        await insert("")
    } catch (err) {
        return err as Error;
    }
}

export async function getUser(userId: string): Promise<{ id: string } | null | Error> {
    try {
        const rows = await query<{ id: string }>('SELECT `id` FROM users WHERE `id` = ? LIMIT 1', [userId]);
        if (!rows || rows.length === 0) return null;
        return rows[0];
    } catch (err) {
        return err as Error;
    }
}