// src/lib/db.ts
import { Pool } from 'pg'

// Объявляем глобальный тип
declare global {
	var postgres: Pool | undefined
}

// Проверяем, есть ли уже пул, или создаем новый
export const pool =
	global.postgres ||
	new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000
	})

// Сохраняем пул глобально в dev-режиме
if (process.env.NODE_ENV !== 'production') {
	global.postgres = pool
}
