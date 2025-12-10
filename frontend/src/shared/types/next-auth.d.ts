import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
	/**
	 * Расширяем встроенный интерфейс Session
	 */
	interface Session {
		user: {
			id: string
			role: string
		} & DefaultSession['user']
	}

	/**
	 * Расширяем встроенный интерфейс User
	 */
	interface User {
		id: string
		role: string
	}
}

declare module 'next-auth/jwt' {
	/**
	 * Расширяем встроенный интерфейс JWT
	 */
	interface JWT {
		id: string
		role: string
	}
}
