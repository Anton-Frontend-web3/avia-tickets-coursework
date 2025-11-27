import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET() {
    try {
        // Выбираем только уникальные города и сортируем их по алфавиту
        const result = await pool.query('SELECT DISTINCT city FROM Airports ORDER BY city ASC');
        // Преобразуем массив объектов [{city: 'Москва'}] в простой массив строк ['Москва']
        const cities = result.rows.map(row => row.city);
        return NextResponse.json(cities);
    } catch (error) {
        console.error('Failed to fetch cities:', error)
        return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }
}